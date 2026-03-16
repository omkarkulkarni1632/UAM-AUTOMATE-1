import { getDb } from "./db/knex";
import { PostgresAccessRequestRepository } from "./repositories/PostgresAccessRequestRepository";
import { PostgresAuditLogRepository } from "./repositories/PostgresAuditLogRepository";
import { PostgresPermissionRepository } from "./repositories/PostgresPermissionRepository";
import { PostgresRiskScoreRepository } from "./repositories/PostgresRiskScoreRepository";
import { PostgresRoleTemplateRepository } from "./repositories/PostgresRoleTemplateRepository";
import { PostgresUserAccessRepository } from "./repositories/PostgresUserAccessRepository";
import { PostgresUserRepository } from "./repositories/PostgresUserRepository";
import { UserUseCases } from "../application/usecases/UserUseCases";
import { WorkflowEngine } from "../application/workflow/WorkflowEngine";
import { RiskEngine } from "../application/risk/RiskEngine";
import { AuthService } from "./auth/AuthService";
import { AuditService } from "../application/audit/AuditService";

export function buildContainer() {
  const db = getDb();

  const users = new PostgresUserRepository(db);
  const accessRequests = new PostgresAccessRequestRepository(db);
  const userAccess = new PostgresUserAccessRepository(db);
  const auditLogs = new PostgresAuditLogRepository(db);
  const permissions = new PostgresPermissionRepository(db);
  const roleTemplates = new PostgresRoleTemplateRepository(db);
  const riskScores = new PostgresRiskScoreRepository(db);

  const userUseCases = new UserUseCases({
    users,
    accessRequests,
    auditLogs,
    userAccess,
    roleTemplates,
  });

  const workflowEngine = new WorkflowEngine({
    users,
    accessRequests,
    userAccess,
    auditLogs,
  });

  const riskEngine = new RiskEngine({
    users,
    userAccess,
    permissions,
    roleTemplates,
    riskScores,
  });

  const authService = new AuthService(users);
  const auditService = new AuditService(auditLogs);

  return {
    db,
    repos: { users, accessRequests, userAccess, auditLogs, permissions, roleTemplates, riskScores },
    services: { userUseCases, workflowEngine, riskEngine, authService, auditService },
  };
}

