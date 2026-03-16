"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAuditLogRepository = void 0;
function mapAuditLog(row) {
    return {
        id: row.id,
        userId: row.user_id,
        action: row.action,
        performedBy: row.performed_by,
        timestamp: new Date(row.timestamp),
        details: row.details ?? {},
    };
}
class PostgresAuditLogRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(input) {
        const [row] = await this.db("audit_logs")
            .insert({
            user_id: input.userId,
            action: input.action,
            performed_by: input.performedBy,
            details: input.details ?? {},
        })
            .returning("*");
        return mapAuditLog(row);
    }
    async listRecent(limit) {
        const rows = (await this.db("audit_logs")
            .orderBy("timestamp", "desc")
            .limit(limit));
        return rows.map(mapAuditLog);
    }
    async listByUserId(userId, limit) {
        const rows = (await this.db("audit_logs")
            .where({ user_id: userId })
            .orderBy("timestamp", "desc")
            .limit(limit));
        return rows.map(mapAuditLog);
    }
}
exports.PostgresAuditLogRepository = PostgresAuditLogRepository;
