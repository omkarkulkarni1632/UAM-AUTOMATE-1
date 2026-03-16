import { Router } from "express";
import { z } from "zod";
import { AuditLogRepository } from "../../../domain/repositories/AuditLogRepository";
import { authRequired } from "../middleware/authMiddleware";

export function buildAuditRoutes(auditLogs: AuditLogRepository) {
  const router = Router();

  router.get("/audit/recent", authRequired, async (req, res, next) => {
    try {
      const limit = z.coerce.number().min(1).max(500).default(100).parse(req.query.limit);
      const logs = await auditLogs.listRecent(limit);
      res.json({ logs });
    } catch (err) {
      next(err);
    }
  });

  router.get("/audit/user/:userId", authRequired, async (req, res, next) => {
    try {
      const userId = z.string().uuid().parse(req.params.userId);
      const limit = z.coerce.number().min(1).max(500).default(100).parse(req.query.limit);
      const logs = await auditLogs.listByUserId(userId, limit);
      res.json({ userId, logs });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

