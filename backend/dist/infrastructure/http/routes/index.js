"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRoutes = buildRoutes;
const express_1 = require("express");
const health_1 = require("./health");
const container_1 = require("../../container");
const auth_1 = require("./auth");
const UserRoutes_1 = require("./UserRoutes");
const AccessRequestRoutes_1 = require("./AccessRequestRoutes");
const WorkflowApprovalRoutes_1 = require("./WorkflowApprovalRoutes");
const DashboardRoutes_1 = require("./DashboardRoutes");
const AuditRoutes_1 = require("./AuditRoutes");
function buildRoutes() {
    const router = (0, express_1.Router)();
    const container = (0, container_1.buildContainer)();
    router.use(health_1.healthRouter);
    router.use((0, auth_1.buildAuthRouter)(container.services.authService));
    router.use((0, UserRoutes_1.buildUserRoutes)({
        userUseCases: container.services.userUseCases,
        userAccess: container.repos.userAccess,
        permissions: container.repos.permissions,
    }));
    router.use((0, AccessRequestRoutes_1.buildAccessRequestRoutes)({
        accessRequests: container.repos.accessRequests,
        userUseCases: container.services.userUseCases,
    }));
    router.use((0, WorkflowApprovalRoutes_1.buildWorkflowApprovalRoutes)(container.services.workflowEngine));
    router.use((0, DashboardRoutes_1.buildDashboardRoutes)({
        users: container.repos.users,
        accessRequests: container.repos.accessRequests,
        auditLogs: container.repos.auditLogs,
        riskScores: container.repos.riskScores,
        riskEngine: container.services.riskEngine,
    }));
    router.use((0, AuditRoutes_1.buildAuditRoutes)(container.repos.auditLogs));
    return router;
}
