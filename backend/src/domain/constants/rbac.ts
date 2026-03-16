export const Roles = {
  HR_ADMIN: "HR_ADMIN",
  INFRA_ADMIN: "INFRA_ADMIN",
  DEPARTMENT_ADMIN: "DEPARTMENT_ADMIN",
  CISO: "CISO",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const RequestTypes = {
  JOINER: "JOINER",
  MOVER: "MOVER",
  LEAVER: "LEAVER",
} as const;

export type RequestType = (typeof RequestTypes)[keyof typeof RequestTypes];

export const WorkflowStages = {
  HR_CREATED: "HR_CREATED",
  INFRA_APPROVAL: "INFRA_APPROVAL",
  DEPARTMENT_APPROVAL: "DEPARTMENT_APPROVAL",
  CISO_APPROVAL: "CISO_APPROVAL",
  COMPLETED: "COMPLETED",
} as const;

export type WorkflowStage = (typeof WorkflowStages)[keyof typeof WorkflowStages];

export const AccessRequestStatuses = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
} as const;

export type AccessRequestStatus =
  (typeof AccessRequestStatuses)[keyof typeof AccessRequestStatuses];

export const EmploymentStatuses = {
  ONBOARDING: "ONBOARDING",
  ACTIVE: "ACTIVE",
  LEAVING: "LEAVING",
  DISABLED: "DISABLED",
} as const;

export type EmploymentStatus =
  (typeof EmploymentStatuses)[keyof typeof EmploymentStatuses];

