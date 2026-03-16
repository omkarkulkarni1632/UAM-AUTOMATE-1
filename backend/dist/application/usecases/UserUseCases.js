"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUseCases = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const rbac_1 = require("../../domain/constants/rbac");
const UserAccess_1 = require("../../domain/models/UserAccess");
class UserUseCases {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async createEmployee(actorUserId, actorRole, input) {
        if (!actorUserId)
            throw new Error("actorUserId required");
        if (actorRole !== rbac_1.Roles.HR_ADMIN)
            throw new Error("Forbidden");
        const user = await this.deps.users.create({
            name: input.name,
            email: input.email,
            departmentId: input.departmentId,
            role: input.role,
            managerId: input.managerId,
            employmentStatus: rbac_1.EmploymentStatuses.ONBOARDING,
            passwordHash: await bcryptjs_1.default.hash(input.tempPassword, 10),
        });
        const request = await this.deps.accessRequests.create({
            userId: user.id,
            requestedBy: actorUserId,
            requestType: rbac_1.RequestTypes.JOINER,
            currentStage: rbac_1.WorkflowStages.HR_CREATED,
            status: rbac_1.AccessRequestStatuses.PENDING,
        });
        const advanced = await this.deps.accessRequests.updateStageAndStatus(request.id, rbac_1.WorkflowStages.INFRA_APPROVAL, rbac_1.AccessRequestStatuses.PENDING);
        await this.deps.auditLogs.create({
            userId: user.id,
            action: "USER_CREATED",
            performedBy: actorUserId,
            details: { requestId: request.id, requestType: rbac_1.RequestTypes.JOINER },
        });
        return { user, request: advanced };
    }
    async updateEmployeeRoleOrDepartment(input) {
        if (input.actorRole !== rbac_1.Roles.HR_ADMIN)
            throw new Error("Forbidden");
        const user = await this.deps.users.findById(input.userId);
        if (!user)
            throw new Error("User not found");
        const old = { role: user.role, departmentId: user.departmentId };
        const updatedUser = await this.deps.users.updateRoleAndDepartment(user.id, input.newRole, input.newDepartmentId);
        const template = (await this.deps.roleTemplates.findByRoleAndDepartment(updatedUser.role, updatedUser.departmentId)) ?? { defaultPermissions: [] };
        const currentAccess = await this.deps.userAccess.listByUserId(user.id);
        const currentGranted = currentAccess.filter((a) => a.status === UserAccess_1.UserAccessStatuses.GRANTED);
        const desired = new Set(template.defaultPermissions ?? []);
        for (const access of currentGranted) {
            if (!desired.has(access.permissionId)) {
                await this.deps.userAccess.setStatus(access.id, UserAccess_1.UserAccessStatuses.REVOKED);
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
        const pendingGrants = [];
        for (const permissionId of desired) {
            if (!grantedIds.has(permissionId)) {
                pendingGrants.push(permissionId);
                await this.deps.userAccess.grant({
                    userId: user.id,
                    permissionId,
                    grantedBy: input.actorUserId,
                    status: UserAccess_1.UserAccessStatuses.PENDING,
                });
            }
        }
        const request = await this.deps.accessRequests.create({
            userId: user.id,
            requestedBy: input.actorUserId,
            requestType: rbac_1.RequestTypes.MOVER,
            currentStage: rbac_1.WorkflowStages.CISO_APPROVAL,
            status: rbac_1.AccessRequestStatuses.PENDING,
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
    async markEmployeeAsLeaver(input) {
        if (input.actorRole !== rbac_1.Roles.HR_ADMIN)
            throw new Error("Forbidden");
        const user = await this.deps.users.findById(input.userId);
        if (!user)
            throw new Error("User not found");
        const disabled = await this.deps.users.updateEmploymentStatus(user.id, rbac_1.EmploymentStatuses.DISABLED);
        const revokedCount = await this.deps.userAccess.revokeAllForUser(user.id, input.actorUserId);
        const request = await this.deps.accessRequests.create({
            userId: user.id,
            requestedBy: input.actorUserId,
            requestType: rbac_1.RequestTypes.LEAVER,
            currentStage: rbac_1.WorkflowStages.COMPLETED,
            status: rbac_1.AccessRequestStatuses.COMPLETED,
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
exports.UserUseCases = UserUseCases;
