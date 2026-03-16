"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmploymentStatuses = exports.AccessRequestStatuses = exports.WorkflowStages = exports.RequestTypes = exports.Roles = void 0;
exports.Roles = {
    HR_ADMIN: "HR_ADMIN",
    INFRA_ADMIN: "INFRA_ADMIN",
    DEPARTMENT_ADMIN: "DEPARTMENT_ADMIN",
    CISO: "CISO",
    EMPLOYEE: "EMPLOYEE",
};
exports.RequestTypes = {
    JOINER: "JOINER",
    MOVER: "MOVER",
    LEAVER: "LEAVER",
};
exports.WorkflowStages = {
    HR_CREATED: "HR_CREATED",
    INFRA_APPROVAL: "INFRA_APPROVAL",
    DEPARTMENT_APPROVAL: "DEPARTMENT_APPROVAL",
    CISO_APPROVAL: "CISO_APPROVAL",
    COMPLETED: "COMPLETED",
};
exports.AccessRequestStatuses = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    COMPLETED: "COMPLETED",
};
exports.EmploymentStatuses = {
    ONBOARDING: "ONBOARDING",
    ACTIVE: "ACTIVE",
    LEAVING: "LEAVING",
    DISABLED: "DISABLED",
};
