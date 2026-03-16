export const Roles = {
  HR_ADMIN: "HR_ADMIN",
  INFRA_ADMIN: "INFRA_ADMIN",
  DEPARTMENT_ADMIN: "DEPARTMENT_ADMIN",
  CISO: "CISO",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

