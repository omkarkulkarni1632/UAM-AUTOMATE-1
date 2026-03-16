"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDashboardRoutes = buildDashboardRoutes;
const express_1 = require("express");
const zod_1 = require("zod");
const rbac_1 = require("../../../domain/constants/rbac");
const authMiddleware_1 = require("../middleware/authMiddleware");
function buildDashboardRoutes(deps) {
    const router = (0, express_1.Router)();
    router.get("/dashboard/security", authMiddleware_1.authRequired, (0, authMiddleware_1.requireRole)(rbac_1.Roles.CISO), async (_req, res, next) => {
        try {
            const users = await deps.users.listAll();
            const recentAudit = await deps.auditLogs.listRecent(50);
            const topRisk = await deps.riskScores.listTopRisk(20);
            res.json({
                totals: {
                    users: users.length,
                    highRiskUsers: topRisk.filter((r) => r.score >= 70).length,
                },
                openRequestsByStage: {},
                topRisk,
                recentAudit,
            });
        }
        catch (err) {
            next(err);
        }
    });
    router.post("/risk/recalculate", authMiddleware_1.authRequired, (0, authMiddleware_1.requireRole)(rbac_1.Roles.CISO), async (req, res, next) => {
        try {
            const body = zod_1.z.object({ userId: zod_1.z.string().uuid() }).parse(req.body);
            const risk = await deps.riskEngine.calculateForUser(body.userId);
            res.json(risk);
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
