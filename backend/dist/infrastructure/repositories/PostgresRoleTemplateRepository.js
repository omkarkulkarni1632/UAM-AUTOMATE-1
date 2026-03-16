"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresRoleTemplateRepository = void 0;
function mapRoleTemplate(row) {
    return {
        id: row.id,
        roleName: row.role_name,
        departmentId: row.department_id,
        defaultPermissions: Array.isArray(row.default_permissions)
            ? row.default_permissions
            : [],
    };
}
class PostgresRoleTemplateRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findByRoleAndDepartment(roleName, departmentId) {
        const row = (await this.db("role_templates")
            .where({ role_name: roleName, department_id: departmentId })
            .first());
        return row ? mapRoleTemplate(row) : null;
    }
    async upsert(template) {
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
        return mapRoleTemplate(row);
    }
}
exports.PostgresRoleTemplateRepository = PostgresRoleTemplateRepository;
