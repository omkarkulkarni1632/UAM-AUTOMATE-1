import { AuditLogRepository } from "../../domain/repositories/AuditLogRepository";

export class AuditService {
  constructor(private readonly auditLogs: AuditLogRepository) {}

  logUserCreated(input: { userId: string; performedBy: string; requestId: string }) {
    return this.auditLogs.create({
      userId: input.userId,
      action: "USER_CREATED",
      performedBy: input.performedBy,
      details: { requestId: input.requestId },
    });
  }

  logAccessGranted(input: {
    userId: string;
    performedBy: string;
    permissionId: string;
    requestId?: string;
  }) {
    return this.auditLogs.create({
      userId: input.userId,
      action: "ACCESS_GRANTED",
      performedBy: input.performedBy,
      details: { permissionId: input.permissionId, requestId: input.requestId ?? null },
    });
  }

  logPermissionRevoked(input: {
    userId: string;
    performedBy: string;
    permissionId: string;
    reason?: string;
  }) {
    return this.auditLogs.create({
      userId: input.userId,
      action: "PERMISSION_REVOKED",
      performedBy: input.performedBy,
      details: { permissionId: input.permissionId, reason: input.reason ?? null },
    });
  }

  logRoleChanged(input: {
    userId: string;
    performedBy: string;
    oldRole: string;
    newRole: string;
    oldDepartmentId: string | null;
    newDepartmentId: string | null;
    requestId: string;
  }) {
    return this.auditLogs.create({
      userId: input.userId,
      action: "ROLE_CHANGED",
      performedBy: input.performedBy,
      details: {
        requestId: input.requestId,
        old: { role: input.oldRole, departmentId: input.oldDepartmentId },
        new: { role: input.newRole, departmentId: input.newDepartmentId },
      },
    });
  }

  logApprovalDecision(input: {
    userId: string;
    performedBy: string;
    stage: string;
    requestId: string;
    decision: "APPROVE" | "REJECT";
    note?: string;
  }) {
    return this.auditLogs.create({
      userId: input.userId,
      action: "APPROVAL_DECISION",
      performedBy: input.performedBy,
      details: {
        stage: input.stage,
        requestId: input.requestId,
        decision: input.decision,
        note: input.note ?? null,
      },
    });
  }
}

