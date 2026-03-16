import { Router } from "express";
import { z } from "zod";
import { Roles } from "../../../domain/constants/rbac";
import { RiskEngine } from "../../../application/risk/RiskEngine";
import { AccessRequestRepository } from "../../../domain/repositories/AccessRequestRepository";
import { AuditLogRepository } from "../../../domain/repositories/AuditLogRepository";
import { RiskScoreRepository } from "../../../domain/repositories/RiskScoreRepository";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { authRequired, requireRole } from "../middleware/authMiddleware";

export function buildDashboardRoutes(deps: {
  users: UserRepository;
  accessRequests: AccessRequestRepository;
  auditLogs: AuditLogRepository;
  riskScores: RiskScoreRepository;
  riskEngine: RiskEngine;
}) {
  const router = Router();

  router.get(
    "/dashboard/security",
    authRequired,
    requireRole(Roles.CISO),
    async (_req, res, next) => {
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
      } catch (err) {
        next(err);
      }
    }
  );

  router.post(
    "/risk/recalculate",
    authRequired,
    requireRole(Roles.CISO),
    async (req, res, next) => {
      try {
        const body = z.object({ userId: z.string().uuid() }).parse(req.body);
        const risk = await deps.riskEngine.calculateForUser(body.userId);
        res.json(risk);
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}

