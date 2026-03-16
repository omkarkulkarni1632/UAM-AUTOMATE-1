import {
  AccessRequestStatuses,
  EmploymentStatuses,
  Roles,
  WorkflowStages,
} from "../../domain/constants/rbac";
import { AccessRequest } from "../../domain/models/AccessRequest";
import { UserAccessStatuses } from "../../domain/models/UserAccess";
import { AccessRequestRepository } from "../../domain/repositories/AccessRequestRepository";
import { AuditLogRepository } from "../../domain/repositories/AuditLogRepository";
import { UserAccessRepository } from "../../domain/repositories/UserAccessRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";

export class WorkflowEngine {
  constructor(
    private readonly deps: {
      users: UserRepository;
      accessRequests: AccessRequestRepository;
      userAccess: UserAccessRepository;
      auditLogs: AuditLogRepository;
    }
  ) {}

  async advanceFromHrCreated(requestId: string): Promise<AccessRequest> {
    const request = await this.requireRequest(requestId);
    if (request.currentStage !== WorkflowStages.HR_CREATED) {
      throw new Error("Request is not in HR_CREATED stage");
    }
    return this.deps.accessRequests.updateStageAndStatus(
      request.id,
      WorkflowStages.INFRA_APPROVAL,
      AccessRequestStatuses.PENDING
    );
  }

  async infraApprove(input: {
    actorUserId: string;
    actorRole: string;
    requestId: string;
    basePermissionIds: string[];
  }) {
    this.requireRole(input.actorRole, Roles.INFRA_ADMIN);

    const request = await this.requireRequest(input.requestId);
    if (request.currentStage !== WorkflowStages.INFRA_APPROVAL) {
      throw new Error("Request is not in INFRA_APPROVAL stage");
    }

    for (const permissionId of input.basePermissionIds) {
      await this.deps.userAccess.grant({
        userId: request.userId,
        permissionId,
        grantedBy: input.actorUserId,
        status: UserAccessStatuses.GRANTED,
      });
    }

    await this.deps.auditLogs.create({
      userId: request.userId,
      action: "INFRA_APPROVED",
      performedBy: input.actorUserId,
      details: { requestId: request.id, permissionIds: input.basePermissionIds },
    });

    return this.deps.accessRequests.updateStageAndStatus(
      request.id,
      WorkflowStages.DEPARTMENT_APPROVAL,
      AccessRequestStatuses.PENDING
    );
  }

  async departmentApprove(input: {
    actorUserId: string;
    actorRole: string;
    requestId: string;
    departmentPermissionIds: string[];
  }) {
    this.requireRole(input.actorRole, Roles.DEPARTMENT_ADMIN);

    const request = await this.requireRequest(input.requestId);
    if (request.currentStage !== WorkflowStages.DEPARTMENT_APPROVAL) {
      throw new Error("Request is not in DEPARTMENT_APPROVAL stage");
    }

    for (const permissionId of input.departmentPermissionIds) {
      await this.deps.userAccess.grant({
        userId: request.userId,
        permissionId,
        grantedBy: input.actorUserId,
        status: UserAccessStatuses.GRANTED,
      });
    }

    await this.deps.auditLogs.create({
      userId: request.userId,
      action: "DEPARTMENT_APPROVED",
      performedBy: input.actorUserId,
      details: {
        requestId: request.id,
        permissionIds: input.departmentPermissionIds,
      },
    });

    return this.deps.accessRequests.updateStageAndStatus(
      request.id,
      WorkflowStages.CISO_APPROVAL,
      AccessRequestStatuses.PENDING
    );
  }

  async cisoApprove(input: {
    actorUserId: string;
    actorRole: string;
    requestId: string;
    finalPermissionIds: string[];
    decision: "APPROVE" | "REJECT";
    note?: string;
  }) {
    this.requireRole(input.actorRole, Roles.CISO);

    const request = await this.requireRequest(input.requestId);
    if (request.currentStage !== WorkflowStages.CISO_APPROVAL) {
      throw new Error("Request is not in CISO_APPROVAL stage");
    }

    if (input.decision === "REJECT") {
      await this.deps.userAccess.revokeAllForUser(request.userId, input.actorUserId);
      const updated = await this.deps.accessRequests.updateStageAndStatus(
        request.id,
        WorkflowStages.CISO_APPROVAL,
        AccessRequestStatuses.REJECTED
      );
      await this.deps.auditLogs.create({
        userId: request.userId,
        action: "CISO_REJECTED",
        performedBy: input.actorUserId,
        details: { requestId: request.id, note: input.note ?? null },
      });
      return updated;
    }

    const current = await this.deps.userAccess.listByUserId(request.userId);
    const desired = new Set(input.finalPermissionIds);

    for (const access of current) {
      if (access.status === UserAccessStatuses.GRANTED && !desired.has(access.permissionId)) {
        await this.deps.userAccess.setStatus(access.id, UserAccessStatuses.REVOKED);
      }
    }

    const currentGranted = new Set(
      current
        .filter((a) => a.status === UserAccessStatuses.GRANTED)
        .map((a) => a.permissionId)
    );
    for (const permissionId of desired) {
      const existing = current.find((a) => a.permissionId === permissionId);
      if (existing && existing.status === UserAccessStatuses.PENDING) {
        await this.deps.userAccess.setStatus(existing.id, UserAccessStatuses.GRANTED);
        continue;
      }
      if (!currentGranted.has(permissionId)) {
        await this.deps.userAccess.grant({
          userId: request.userId,
          permissionId,
          grantedBy: input.actorUserId,
          status: UserAccessStatuses.GRANTED,
        });
      }
    }

    await this.deps.users.updateEmploymentStatus(
      request.userId,
      EmploymentStatuses.ACTIVE
    );

    const updated = await this.deps.accessRequests.updateStageAndStatus(
      request.id,
      WorkflowStages.COMPLETED,
      AccessRequestStatuses.COMPLETED
    );

    await this.deps.auditLogs.create({
      userId: request.userId,
      action: "CISO_APPROVED",
      performedBy: input.actorUserId,
      details: {
        requestId: request.id,
        finalPermissionIds: input.finalPermissionIds,
        note: input.note ?? null,
      },
    });

    return updated;
  }

  private async requireRequest(id: string): Promise<AccessRequest> {
    const request = await this.deps.accessRequests.findById(id);
    if (!request) throw new Error("AccessRequest not found");
    return request;
  }

  private requireRole(actorRole: string, required: string) {
    if (actorRole !== required) throw new Error("Forbidden");
  }
}

