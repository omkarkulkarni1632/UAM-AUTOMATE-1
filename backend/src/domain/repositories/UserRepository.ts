import { EmploymentStatus, Role } from "../constants/rbac";
import { User } from "../models/User";

export interface CreateUserInput {
  name: string;
  email: string;
  departmentId: string | null;
  role: Role;
  managerId: string | null;
  employmentStatus: EmploymentStatus;
  passwordHash: string | null;
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  listAll(): Promise<User[]>;
  updateRoleAndDepartment(
    userId: string,
    role: Role,
    departmentId: string | null
  ): Promise<User>;
  updateEmploymentStatus(userId: string, status: EmploymentStatus): Promise<User>;
}

