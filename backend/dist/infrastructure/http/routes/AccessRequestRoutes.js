"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAccessRequestRoutes = buildAccessRequestRoutes;
const express_1 = require("express");
const zod_1 = require("zod");
const rbac_1 = require("../../../domain/constants/rbac");
const authMiddleware_1 = require("../middleware/authMiddleware");
function buildAccessRequestRoutes(deps) {
    const router = (0, express_1.Router)();
    // Generic endpoint mainly for starting MOVER/LEAVER from HR dashboard.
    router.post("/access-request", authMiddleware_1.authRequired, (0, authMiddleware_1.requireRole)(rbac_1.Roles.HR_ADMIN), async (req, res, next) => {
        try {
            const body = zod_1.z
                .object({
                requestType: zod_1.z.enum([rbac_1.RequestTypes.MOVER, rbac_1.RequestTypes.LEAVER]),
                userId: zod_1.z.string().uuid(),
                newRole: zod_1.z
                    .enum([
                    rbac_1.Roles.HR_ADMIN,
                    rbac_1.Roles.INFRA_ADMIN,
                    rbac_1.Roles.DEPARTMENT_ADMIN,
                    rbac_1.Roles.CISO,
                    rbac_1.Roles.EMPLOYEE,
                ])
                    .optional(),
                newDepartmentId: zod_1.z.string().uuid().nullable().optional(),
            })
                .parse(req.body);
            if (body.requestType === rbac_1.RequestTypes.LEAVER) {
                const result = await deps.userUseCases.markEmployeeAsLeaver({
                    actorUserId: req.user.id,
                    actorRole: req.user.role,
                    userId: body.userId,
                });
                return res.status(201).json(result);
            }
            if (!body.newRole) {
                return res.status(400).json({ error: "newRole required for MOVER" });
            }
            const result = await deps.userUseCases.updateEmployeeRoleOrDepartment({
                actorUserId: req.user.id,
                actorRole: req.user.role,
                userId: body.userId,
                newRole: body.newRole,
                newDepartmentId: body.newDepartmentId ?? null,
            });
            return res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    });
    router.get("/access-requests/stage/:stage", authMiddleware_1.authRequired, async (req, res, next) => {
        try {
            const stage = zod_1.z.string().parse(req.params.stage);
            const rows = await deps.accessRequests.listByStage(stage);
            res.json({ stage, requests: rows });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
