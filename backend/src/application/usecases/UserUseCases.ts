import bcrypt from "bcryptjs";
import {
  AccessRequestStatuses,
  EmploymentStatuses,
  RequestTypes,
  Role,
  Roles,
  WorkflowStages,
} from "../../domain/constants/rbac";
import { AccessRequestRepository } from "../../domain/repositories/AccessRequestRepository";
import { AuditLogRepository } from "../../domain/repositories/AuditLogRepository";
import { RoleTemplateRepository } from "../../domain/repositories/RoleTemplateRepository";
import { UserAccessRepository } from "../../domain/repositories/UserAccessRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { UserAccessStatuses } from "../../domain/models/UserAccess";

export interface CreateEmployeeInput {
  name: string;
  email: string;
  departmentId: string | null;
  role: Role;
  managerId: string | null;
  tempPassword: string;
}

export class UserUseCases {
  constructor(
    private readonly deps: {
      users: UserRepository;
      accessRequests: AccessRequestRepository;
      auditLogs: AuditLogRepository;
      userAccess: UserAccessRepository;
      roleTemplates: RoleTemplateRepository;
    }
  ) {}

  async createEmployee(actorUserId: string, actorRole: string, input: CreateEmployeeInput) {
    if (!actorUserId) throw new Error("actorUserId required");
    if (actorRole !== Roles.HR_ADMIN) throw new Error("Forbidden");
    const user = await this.deps.users.create({
      name: input.name,
      email: input.email,
      departmentId: input.departmentId,
      role: input.role,
      managerId: input.managerId,
      employmentStatus: EmploymentStatuses.ONBOARDING,
      passwordHash: await bcrypt.hash(input.tempPassword, 10),
    });

    const request = await this.deps.accessRequests.create({
      userId: user.id,
      requestedBy: actorUserId,
      requestType: RequestTypes.JOINER,
      currentStage: WorkflowStages.HR_CREATED,
      status: AccessRequestStatuses.PENDING,
    });

    const advanced = await this.deps.accessRequests.updateStageAndStatus(
      request.id,
      WorkflowStages.INFRA_APPROVAL,
      AccessRequestStatuses.PENDING
    );

    await this.deps.auditLogs.create({
      userId: user.id,
      action: "USER_CREATED",
      performedBy: actorUserId,
      details: { requestId: request.id, requestType: RequestTypes.JOINER },
    });

    return { user, request: advanced };
  }

  async updateEmployeeRoleOrDepartment(input: {
    actorUserId: string;
    actorRole: string;
    userId: string;
    newRole: Role;
    newDepartmentId: string | null;
  }) {
    if (input.actorRole !== Roles.HR_ADMIN) throw new Error("Forbidden");

    const user = await this.deps.users.findById(input.userId);
    if (!user) throw new Error("User not found");

    const old = { role: user.role, departmentId: user.departmentId };
    const updatedUser = await this.deps.users.updateRoleAndDepartment(
      user.id,
      input.newRole,
      input.newDepartmentId
    );

    const template =
      (await this.deps.roleTemplates.findByRoleAndDepartment(
        updatedUser.role,
        updatedUser.departmentId
      )) ?? { defaultPermissions: [] };

    const currentAccess = await this.deps.userAccess.listByUserId(user.id);
    const currentGranted = currentAccess.filter(
      (a) => a.status === UserAccessStatuses.GRANTED
    );
    const desired = new Set<string>(template.defaultPermissions ?? []);

    for (const access of currentGranted) {
      if (!desired.has(access.permissionId)) {
        await this.deps.userAccess.setStatus(access.id, UserAccessStatuses.REVOKED);
        await this.deps.auditLogs.create({
          userId: user.id,
          action: "PERMISSION_REVOKED",
          performedBy: input.actorUserId,
          details: {
            permissionId: access.permissionId,
            reason: "Mover: role/department change (least privilege)",
          },
        });
      }
    }

    const grantedIds = new Set(currentGranted.map((a) => a.permissionId));
    const pendingGrants: string[] = [];
    for (const permissionId of desired) {
      if (!grantedIds.has(permissionId)) {
        pendingGrants.push(permissionId);
        await this.deps.userAccess.grant({
          userId: user.id,
          permissionId,
          grantedBy: input.actorUserId,
          status: UserAccessStatuses.PENDING,
        });
      }
    }

    const request = await this.deps.accessRequests.create({
      userId: user.id,
      requestedBy: input.actorUserId,
      requestType: RequestTypes.MOVER,
      currentStage: WorkflowStages.CISO_APPROVAL,
      status: AccessRequestStatuses.PENDING,
    });

    await this.deps.auditLogs.create({
      userId: user.id,
      action: "ROLE_CHANGED",
      performedBy: input.actorUserId,
      details: {
        old,
        new: { role: updatedUser.role, departmentId: updatedUser.departmentId },
        requestId: request.id,
        pendingGrantPermissionIds: pendingGrants,
      },
    });

    return { user: updatedUser, request };
  }

  async markEmployeeAsLeaver(input: {
    actorUserId: string;
    actorRole: string;
    userId: string;
  }) {
    if (input.actorRole !== Roles.HR_ADMIN) throw new Error("Forbidden");

    const user = await this.deps.users.findById(input.userId);
    if (!user) throw new Error("User not found");

    const disabled = await this.deps.users.updateEmploymentStatus(
      user.id,
      EmploymentStatuses.DISABLED
    );
    const revokedCount = await this.deps.userAccess.revokeAllForUser(
      user.id,
      input.actorUserId
    );

    const request = await this.deps.accessRequests.create({
      userId: user.id,
      requestedBy: input.actorUserId,
      requestType: RequestTypes.LEAVER,
      currentStage: WorkflowStages.COMPLETED,
      status: AccessRequestStatuses.COMPLETED,
    });

    await this.deps.auditLogs.create({
      userId: user.id,
      action: "LEAVER_PROCESSED",
      performedBy: input.actorUserId,
      details: { requestId: request.id, revokedCount },
    });

    return { user: disabled, request, revokedCount };
  }
}

