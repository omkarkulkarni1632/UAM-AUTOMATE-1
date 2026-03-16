"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresUserAccessRepository = void 0;
function mapUserAccess(row) {
    return {
        id: row.id,
        userId: row.user_id,
        permissionId: row.permission_id,
        grantedBy: row.granted_by,
        status: row.status,
        grantedAt: new Date(row.granted_at),
        lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
    };
}
class PostgresUserAccessRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async grant(input) {
        const [row] = await this.db("user_access")
            .insert({
            user_id: input.userId,
            permission_id: input.permissionId,
            granted_by: input.grantedBy,
            status: input.status,
        })
            .returning("*");
        return mapUserAccess(row);
    }
    async listByUserId(userId) {
        const rows = (await this.db("user_access")
            .where({ user_id: userId })
            .orderBy("granted_at", "desc"));
        return rows.map(mapUserAccess);
    }
    async revokeAllForUser(userId, revokedBy) {
        const rows = await this.db("user_access")
            .where({ user_id: userId })
            .update({ status: "REVOKED", granted_by: revokedBy })
            .returning("id");
        return rows.length;
    }
    async setStatus(id, status) {
        const [row] = await this.db("user_access")
            .where({ id })
            .update({ status })
            .returning("*");
        return mapUserAccess(row);
    }
    async touchLastUsed(accessId, at) {
        const [row] = await this.db("user_access")
            .where({ id: accessId })
            .update({ last_used_at: at })
            .returning("*");
        return mapUserAccess(row);
    }
}
exports.PostgresUserAccessRepository = PostgresUserAccessRepository;
