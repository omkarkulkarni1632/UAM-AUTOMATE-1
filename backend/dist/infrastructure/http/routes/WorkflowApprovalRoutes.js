"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorkflowApprovalRoutes = buildWorkflowApprovalRoutes;
const express_1 = require("express");
const zod_1 = require("zod");
const rbac_1 = require("../../../domain/constants/rbac");
const authMiddleware_1 = require("../middleware/authMiddleware");
function buildWorkflowApprovalRoutes(workflow) {
    const router = (0, express_1.Router)();
    router.post("/infra/approve", authMiddleware_1.authRequired, (0, authMiddleware_1.requireRole)(rbac_1.Roles.INFRA_ADMIN), async (req, res, next) => {
        try {
            const body = zod_1.z
                .object({
                requestId: zod_1.z.string().uuid(),
                basePermissionIds: zod_1.z.array(zod_1.z.string().uuid()).default([]),
            })
                .parse(req.body);
            const updated = await workflow.infraApprove({
                actorUserId: req.user.id,
                actorRole: req.user.role,
                requestId: body.requestId,
                basePermissionIds: body.basePermissionIds,
            });
            res.json(updated);
        }
        catch (err) {
            next(err);
        }
    });
    router.post("/department/approve", authMiddleware_1.authRequired, (0, authMiddleware_1.requireRole)(rbac_1.Roles.DEPARTMENT_ADMIN), async (req, res, next) => {
        try {
            const body = zod_1.z
                .object({
                requestId: zod_1.z.string().uuid(),
                departmentPermissionIds: zod_1.z.array(zod_1.z.string().uuid()).default([]),
            })
                .parse(req.body);
            const updated = await workflow.departmentApprove({
                actorUserId: req.user.id,
                actorRole: req.user.role,
                requestId: body.requestId,
                departmentPermissionIds: body.departmentPermissionIds,
            });
            res.json(updated);
        }
        catch (err) {
            next(err);
        }
    });
    router.post("/ciso/approve", authMiddleware_1.authRequired, (0, authMiddleware_1.requireRole)(rbac_1.Roles.CISO), async (req, res, next) => {
        try {
            const body = zod_1.z
                .object({
                requestId: zod_1.z.string().uuid(),
                finalPermissionIds: zod_1.z.array(zod_1.z.string().uuid()).default([]),
                decision: zod_1.z.enum(["APPROVE", "REJECT"]),
                note: zod_1.z.string().optional(),
            })
                .parse(req.body);
            const updated = await workflow.cisoApprove({
                actorUserId: req.user.id,
                actorRole: req.user.role,
                requestId: body.requestId,
                finalPermissionIds: body.finalPermissionIds,
                decision: body.decision,
                note: body.note,
            });
            res.json(updated);
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
