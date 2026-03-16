import { Knex } from "knex";
import { EmploymentStatus, Role } from "../../domain/constants/rbac";
import { User } from "../../domain/models/User";
import { CreateUserInput, UserRepository } from "../../domain/repositories/UserRepository";

type UserRow = {
  id: string;
  name: string;
  email: string;
  department_id: string | null;
  role: string;
  manager_id: string | null;
  employment_status: string;
  password_hash: string | null;
  created_at: Date;
};

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    departmentId: row.department_id,
    role: row.role as Role,
    managerId: row.manager_id,
    employmentStatus: row.employment_status as EmploymentStatus,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at),
  };
}

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly db: Knex) {}

  async create(input: CreateUserInput): Promise<User> {
    const [row] = await this.db("users")
      .insert({
        name: input.name,
        email: input.email,
        department_id: input.departmentId,
        role: input.role,
        manager_id: input.managerId,
        employment_status: input.employmentStatus,
        password_hash: input.passwordHash,
      })
      .returning("*");
    return mapUser(row as UserRow);
  }

  async findById(id: string): Promise<User | null> {
    const row = (await this.db("users").where({ id }).first()) as
      | UserRow
      | undefined;
    return row ? mapUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = (await this.db("users").where({ email }).first()) as
      | UserRow
      | undefined;
    return row ? mapUser(row) : null;
  }

  async listAll(): Promise<User[]> {
    const rows = (await this.db("users").orderBy("created_at", "desc")) as UserRow[];
    return rows.map(mapUser);
  }

  async updateRoleAndDepartment(
    userId: string,
    role: Role,
    departmentId: string | null
  ): Promise<User> {
    const [row] = await this.db("users")
      .where({ id: userId })
      .update({ role, department_id: departmentId })
      .returning("*");
    return mapUser(row as UserRow);
  }

  async updateEmploymentStatus(
    userId: string,
    status: EmploymentStatus
  ): Promise<User> {
    const [row] = await this.db("users")
      .where({ id: userId })
      .update({ employment_status: status })
      .returning("*");
    return mapUser(row as UserRow);
  }
}

