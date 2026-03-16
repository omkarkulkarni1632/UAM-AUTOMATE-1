"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUserRoutes = buildUserRoutes;
const express_1 = require("express");
const zod_1 = require("zod");
const rbac_1 = require("../../../domain/constants/rbac");
const authMiddleware_1 = require("../middleware/authMiddleware");
function buildUserRoutes(deps) {
    const router = (0, express_1.Router)();
    router.post("/users", authMiddleware_1.authRequired, (0, authMiddleware_1.requireRole)(rbac_1.Roles.HR_ADMIN), async (req, res, next) => {
        try {
            const body = zod_1.z
                .object({
                name: zod_1.z.string().min(1),
                email: zod_1.z.string().email(),
                departmentId: zod_1.z.string().uuid().nullable().optional().default(null),
                role: zod_1.z.enum([
                    rbac_1.Roles.HR_ADMIN,
                    rbac_1.Roles.INFRA_ADMIN,
                    rbac_1.Roles.DEPARTMENT_ADMIN,
                    rbac_1.Roles.CISO,
                    rbac_1.Roles.EMPLOYEE,
                ]),
                managerId: zod_1.z.string().uuid().nullable().optional().default(null),
                tempPassword: zod_1.z.string().min(6),
            })
                .parse(req.body);
            const result = await deps.userUseCases.createEmployee(req.user.id, req.user.role, body);
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    });
    router.get("/users/:id/access", authMiddleware_1.authRequired, async (req, res, next) => {
        try {
            const userId = zod_1.z.string().uuid().parse(req.params.id);
            const access = await deps.userAccess.listByUserId(userId);
            const perms = await deps.permissions.listByIds(access.map((a) => a.permissionId));
            const permById = new Map(perms.map((p) => [p.id, p]));
            res.json({
                userId,
                access: access.map((a) => ({
                    ...a,
                    permission: permById.get(a.permissionId) ?? null,
                })),
            });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
