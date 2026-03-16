import { EmploymentStatus, Role } from "../constants/rbac";

export type UserId = string;

export interface User {
  id: UserId;
  name: string;
  email: string;
  departmentId: string | null;
  role: Role;
  managerId: string | null;
  employmentStatus: EmploymentStatus;
  passwordHash: string | null;
  createdAt: Date;
}

