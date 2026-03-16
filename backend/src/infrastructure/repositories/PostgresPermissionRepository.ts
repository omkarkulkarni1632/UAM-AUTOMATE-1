import { Knex } from "knex";
import { Permission } from "../../domain/models/Permission";
import { PermissionRepository } from "../../domain/repositories/PermissionRepository";

type PermissionRow = {
  id: string;
  permission_name: string;
  system: string;
  privilege_level: number;
  is_sensitive_system: boolean;
};

function mapPermission(row: PermissionRow): Permission {
  return {
    id: row.id,
    permissionName: row.permission_name,
    system: row.system,
    privilegeLevel: row.privilege_level,
    isSensitiveSystem: row.is_sensitive_system,
  };
}

export class PostgresPermissionRepository implements PermissionRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<Permission | null> {
    const row = (await this.db("permissions").where({ id }).first()) as
      | PermissionRow
      | undefined;
    return row ? mapPermission(row) : null;
  }

  async listAll(): Promise<Permission[]> {
    const rows = (await this.db("permissions").orderBy("system").orderBy("permission_name")) as PermissionRow[];
    return rows.map(mapPermission);
  }

  async listByIds(ids: string[]): Promise<Permission[]> {
    if (ids.length === 0) return [];
    const rows = (await this.db("permissions").whereIn("id", ids)) as PermissionRow[];
    return rows.map(mapPermission);
  }

  async upsert(
    permission: Omit<Permission, "id"> & { id?: string }
  ): Promise<Permission> {
    if (permission.id) {
      const [row] = await this.db("permissions")
        .where({ id: permission.id })
        .update({
          permission_name: permission.permissionName,
          system: permission.system,
          privilege_level: permission.privilegeLevel,
          is_sensitive_system: permission.isSensitiveSystem,
        })
        .returning("*");
      return mapPermission(row as PermissionRow);
    }

    const [row] = await this.db("permissions")
      .insert({
        permission_name: permission.permissionName,
        system: permission.system,
        privilege_level: permission.privilegeLevel,
        is_sensitive_system: permission.isSensitiveSystem,
      })
      .onConflict(["permission_name", "system"])
      .merge({
        privilege_level: permission.privilegeLevel,
        is_sensitive_system: permission.isSensitiveSystem,
      })
      .returning("*");

    return mapPermission(row as PermissionRow);
  }
}

