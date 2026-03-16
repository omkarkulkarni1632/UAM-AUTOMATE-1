"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = void 0;
const rbac_1 = require("../../domain/constants/rbac");
const UserAccess_1 = require("../../domain/models/UserAccess");
class WorkflowEngine {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async advanceFromHrCreated(requestId) {
        const request = await this.requireRequest(requestId);
        if (request.currentStage !== rbac_1.WorkflowStages.HR_CREATED) {
            throw new Error("Request is not in HR_CREATED stage");
        }
        return this.deps.accessRequests.updateStageAndStatus(request.id, rbac_1.WorkflowStages.INFRA_APPROVAL, rbac_1.AccessRequestStatuses.PENDING);
    }
    async infraApprove(input) {
        this.requireRole(input.actorRole, rbac_1.Roles.INFRA_ADMIN);
        const request = await this.requireRequest(input.requestId);
        if (request.currentStage !== rbac_1.WorkflowStages.INFRA_APPROVAL) {
            throw new Error("Request is not in INFRA_APPROVAL stage");
        }
        for (const permissionId of input.basePermissionIds) {
            await this.deps.userAccess.grant({
                userId: request.userId,
                permissionId,
                grantedBy: input.actorUserId,
                status: UserAccess_1.UserAccessStatuses.GRANTED,
            });
        }
        await this.deps.auditLogs.create({
            userId: request.userId,
            action: "INFRA_APPROVED",
            performedBy: input.actorUserId,
            details: { requestId: request.id, permissionIds: input.basePermissionIds },
        });
        return this.deps.accessRequests.updateStageAndStatus(request.id, rbac_1.WorkflowStages.DEPARTMENT_APPROVAL, rbac_1.AccessRequestStatuses.PENDING);
    }
    async departmentApprove(input) {
        this.requireRole(input.actorRole, rbac_1.Roles.DEPARTMENT_ADMIN);
        const request = await this.requireRequest(input.requestId);
        if (request.currentStage !== rbac_1.WorkflowStages.DEPARTMENT_APPROVAL) {
            throw new Error("Request is not in DEPARTMENT_APPROVAL stage");
        }
        for (const permissionId of input.departmentPermissionIds) {
            await this.deps.userAccess.grant({
                userId: request.userId,
                permissionId,
                grantedBy: input.actorUserId,
                status: UserAccess_1.UserAccessStatuses.GRANTED,
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
        return this.deps.accessRequests.updateStageAndStatus(request.id, rbac_1.WorkflowStages.CISO_APPROVAL, rbac_1.AccessRequestStatuses.PENDING);
    }
    async cisoApprove(input) {
        this.requireRole(input.actorRole, rbac_1.Roles.CISO);
        const request = await this.requireRequest(input.requestId);
        if (request.currentStage !== rbac_1.WorkflowStages.CISO_APPROVAL) {
            throw new Error("Request is not in CISO_APPROVAL stage");
        }
        if (input.decision === "REJECT") {
            await this.deps.userAccess.revokeAllForUser(request.userId, input.actorUserId);
            const updated = await this.deps.accessRequests.updateStageAndStatus(request.id, rbac_1.WorkflowStages.CISO_APPROVAL, rbac_1.AccessRequestStatuses.REJECTED);
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
            if (access.status === UserAccess_1.UserAccessStatuses.GRANTED && !desired.has(access.permissionId)) {
                await this.deps.userAccess.setStatus(access.id, UserAccess_1.UserAccessStatuses.REVOKED);
            }
        }
        const currentGranted = new Set(current
            .filter((a) => a.status === UserAccess_1.UserAccessStatuses.GRANTED)
            .map((a) => a.permissionId));
        for (const permissionId of desired) {
            const existing = current.find((a) => a.permissionId === permissionId);
            if (existing && existing.status === UserAccess_1.UserAccessStatuses.PENDING) {
                await this.deps.userAccess.setStatus(existing.id, UserAccess_1.UserAccessStatuses.GRANTED);
                continue;
            }
            if (!currentGranted.has(permissionId)) {
                await this.deps.userAccess.grant({
                    userId: request.userId,
                    permissionId,
                    grantedBy: input.actorUserId,
                    status: UserAccess_1.UserAccessStatuses.GRANTED,
                });
            }
        }
        await this.deps.users.updateEmploymentStatus(request.userId, rbac_1.EmploymentStatuses.ACTIVE);
        const updated = await this.deps.accessRequests.updateStageAndStatus(request.id, rbac_1.WorkflowStages.COMPLETED, rbac_1.AccessRequestStatuses.COMPLETED);
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
    async requireRequest(id) {
        const request = await this.deps.accessRequests.findById(id);
        if (!request)
            throw new Error("AccessRequest not found");
        return request;
    }
    requireRole(actorRole, required) {
        if (actorRole !== required)
            throw new Error("Forbidden");
    }
}
exports.WorkflowEngine = WorkflowEngine;
