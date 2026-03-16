import { Knex } from "knex";
import { RoleTemplate } from "../../domain/models/RoleTemplate";
import { RoleTemplateRepository } from "../../domain/repositories/RoleTemplateRepository";

type RoleTemplateRow = {
  id: string;
  role_name: string;
  department_id: string | null;
  default_permissions: any;
};

function mapRoleTemplate(row: RoleTemplateRow): RoleTemplate {
  return {
    id: row.id,
    roleName: row.role_name,
    departmentId: row.department_id,
    defaultPermissions: Array.isArray(row.default_permissions)
      ? row.default_permissions
      : [],
  };
}

export class PostgresRoleTemplateRepository implements RoleTemplateRepository {
  constructor(private readonly db: Knex) {}

  async findByRoleAndDepartment(
    roleName: string,
    departmentId: string | null
  ): Promise<RoleTemplate | null> {
    const row = (await this.db("role_templates")
      .where({ role_name: roleName, department_id: departmentId })
      .first()) as RoleTemplateRow | undefined;
    return row ? mapRoleTemplate(row) : null;
  }

  async upsert(
    template: Omit<RoleTemplate, "id"> & { id?: string }
  ): Promise<RoleTemplate> {
    const insertRow = {
      role_name: template.roleName,
      department_id: template.departmentId,
      default_permissions: template.defaultPermissions ?? [],
    };

    const [row] = await this.db("role_templates")
      .insert(insertRow)
      .onConflict(["role_name", "department_id"])
      .merge(insertRow)
      .returning("*");

    return mapRoleTemplate(row as RoleTemplateRow);
  }
}

