"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContainer = buildContainer;
const knex_1 = require("./db/knex");
const PostgresAccessRequestRepository_1 = require("./repositories/PostgresAccessRequestRepository");
const PostgresAuditLogRepository_1 = require("./repositories/PostgresAuditLogRepository");
const PostgresPermissionRepository_1 = require("./repositories/PostgresPermissionRepository");
const PostgresRiskScoreRepository_1 = require("./repositories/PostgresRiskScoreRepository");
const PostgresRoleTemplateRepository_1 = require("./repositories/PostgresRoleTemplateRepository");
const PostgresUserAccessRepository_1 = require("./repositories/PostgresUserAccessRepository");
const PostgresUserRepository_1 = require("./repositories/PostgresUserRepository");
const UserUseCases_1 = require("../application/usecases/UserUseCases");
const WorkflowEngine_1 = require("../application/workflow/WorkflowEngine");
const RiskEngine_1 = require("../application/risk/RiskEngine");
const AuthService_1 = require("./auth/AuthService");
const AuditService_1 = require("../application/audit/AuditService");
function buildContainer() {
    const db = (0, knex_1.getDb)();
    const users = new PostgresUserRepository_1.PostgresUserRepository(db);
    const accessRequests = new PostgresAccessRequestRepository_1.PostgresAccessRequestRepository(db);
    const userAccess = new PostgresUserAccessRepository_1.PostgresUserAccessRepository(db);
    const auditLogs = new PostgresAuditLogRepository_1.PostgresAuditLogRepository(db);
    const permissions = new PostgresPermissionRepository_1.PostgresPermissionRepository(db);
    const roleTemplates = new PostgresRoleTemplateRepository_1.PostgresRoleTemplateRepository(db);
    const riskScores = new PostgresRiskScoreRepository_1.PostgresRiskScoreRepository(db);
    const userUseCases = new UserUseCases_1.UserUseCases({
        users,
        accessRequests,
        auditLogs,
        userAccess,
        roleTemplates,
    });
    const workflowEngine = new WorkflowEngine_1.WorkflowEngine({
        users,
        accessRequests,
        userAccess,
        auditLogs,
    });
    const riskEngine = new RiskEngine_1.RiskEngine({
        users,
        userAccess,
        permissions,
        roleTemplates,
        riskScores,
    });
    const authService = new AuthService_1.AuthService(users);
    const auditService = new AuditService_1.AuditService(auditLogs);
    return {
        db,
        repos: { users, accessRequests, userAccess, auditLogs, permissions, roleTemplates, riskScores },
        services: { userUseCases, workflowEngine, riskEngine, authService, auditService },
    };
}
