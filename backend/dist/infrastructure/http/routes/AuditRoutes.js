"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAuditRoutes = buildAuditRoutes;
const express_1 = require("express");
const zod_1 = require("zod");
const authMiddleware_1 = require("../middleware/authMiddleware");
function buildAuditRoutes(auditLogs) {
    const router = (0, express_1.Router)();
    router.get("/audit/recent", authMiddleware_1.authRequired, async (req, res, next) => {
        try {
            const limit = zod_1.z.coerce.number().min(1).max(500).default(100).parse(req.query.limit);
            const logs = await auditLogs.listRecent(limit);
            res.json({ logs });
        }
        catch (err) {
            next(err);
        }
    });
    router.get("/audit/user/:userId", authMiddleware_1.authRequired, async (req, res, next) => {
        try {
            const userId = zod_1.z.string().uuid().parse(req.params.userId);
            const limit = zod_1.z.coerce.number().min(1).max(500).default(100).parse(req.query.limit);
            const logs = await auditLogs.listByUserId(userId, limit);
            res.json({ userId, logs });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
