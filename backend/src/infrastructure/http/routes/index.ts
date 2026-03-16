import { Router } from "express";
import { healthRouter } from "./health";
import { buildContainer } from "../../container";
import { buildAuthRouter } from "./auth";
import { buildUserRoutes } from "./UserRoutes";
import { buildAccessRequestRoutes } from "./AccessRequestRoutes";
import { buildWorkflowApprovalRoutes } from "./WorkflowApprovalRoutes";
import { buildDashboardRoutes } from "./DashboardRoutes";
import { buildAuditRoutes } from "./AuditRoutes";

export function buildRoutes() {
  const router = Router();
  const container = buildContainer();

  router.use(healthRouter);
  router.use(buildAuthRouter(container.services.authService));
  router.use(
    buildUserRoutes({
      userUseCases: container.services.userUseCases,
      userAccess: container.repos.userAccess,
      permissions: container.repos.permissions,
    })
  );
  router.use(
    buildAccessRequestRoutes({
      accessRequests: container.repos.accessRequests,
      userUseCases: container.services.userUseCases,
    })
  );
  router.use(buildWorkflowApprovalRoutes(container.services.workflowEngine));
  router.use(
    buildDashboardRoutes({
      users: container.repos.users,
      accessRequests: container.repos.accessRequests,
      auditLogs: container.repos.auditLogs,
      riskScores: container.repos.riskScores,
      riskEngine: container.services.riskEngine,
    })
  );
  router.use(buildAuditRoutes(container.repos.auditLogs));
  return router;
}

