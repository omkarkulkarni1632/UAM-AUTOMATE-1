"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
class AuditService {
    auditLogs;
    constructor(auditLogs) {
        this.auditLogs = auditLogs;
    }
    logUserCreated(input) {
        return this.auditLogs.create({
            userId: input.userId,
            action: "USER_CREATED",
            performedBy: input.performedBy,
            details: { requestId: input.requestId },
        });
    }
    logAccessGranted(input) {
        return this.auditLogs.create({
            userId: input.userId,
            action: "ACCESS_GRANTED",
            performedBy: input.performedBy,
            details: { permissionId: input.permissionId, requestId: input.requestId ?? null },
        });
    }
    logPermissionRevoked(input) {
        return this.auditLogs.create({
            userId: input.userId,
            action: "PERMISSION_REVOKED",
            performedBy: input.performedBy,
            details: { permissionId: input.permissionId, reason: input.reason ?? null },
        });
    }
    logRoleChanged(input) {
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
    logApprovalDecision(input) {
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
exports.AuditService = AuditService;
