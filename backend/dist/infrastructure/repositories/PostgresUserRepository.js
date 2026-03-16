"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresUserRepository = void 0;
function mapUser(row) {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        departmentId: row.department_id,
        role: row.role,
        managerId: row.manager_id,
        employmentStatus: row.employment_status,
        passwordHash: row.password_hash,
        createdAt: new Date(row.created_at),
    };
}
class PostgresUserRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(input) {
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
        return mapUser(row);
    }
    async findById(id) {
        const row = (await this.db("users").where({ id }).first());
        return row ? mapUser(row) : null;
    }
    async findByEmail(email) {
        const row = (await this.db("users").where({ email }).first());
        return row ? mapUser(row) : null;
    }
    async listAll() {
        const rows = (await this.db("users").orderBy("created_at", "desc"));
        return rows.map(mapUser);
    }
    async updateRoleAndDepartment(userId, role, departmentId) {
        const [row] = await this.db("users")
            .where({ id: userId })
            .update({ role, department_id: departmentId })
            .returning("*");
        return mapUser(row);
    }
    async updateEmploymentStatus(userId, status) {
        const [row] = await this.db("users")
            .where({ id: userId })
            .update({ employment_status: status })
            .returning("*");
        return mapUser(row);
    }
}
exports.PostgresUserRepository = PostgresUserRepository;
