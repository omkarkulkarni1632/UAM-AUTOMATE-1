"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresPermissionRepository = void 0;
function mapPermission(row) {
    return {
        id: row.id,
        permissionName: row.permission_name,
        system: row.system,
        privilegeLevel: row.privilege_level,
        isSensitiveSystem: row.is_sensitive_system,
    };
}
class PostgresPermissionRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        const row = (await this.db("permissions").where({ id }).first());
        return row ? mapPermission(row) : null;
    }
    async listAll() {
        const rows = (await this.db("permissions").orderBy("system").orderBy("permission_name"));
        return rows.map(mapPermission);
    }
    async listByIds(ids) {
        if (ids.length === 0)
            return [];
        const rows = (await this.db("permissions").whereIn("id", ids));
        return rows.map(mapPermission);
    }
    async upsert(permission) {
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
            return mapPermission(row);
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
        return mapPermission(row);
    }
}
exports.PostgresPermissionRepository = PostgresPermissionRepository;
