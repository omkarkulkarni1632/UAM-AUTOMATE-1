"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAccessRequestRepository = void 0;
function mapAccessRequest(row) {
    return {
        id: row.id,
        userId: row.user_id,
        requestedBy: row.requested_by,
        requestType: row.request_type,
        currentStage: row.current_stage,
        status: row.status,
        createdAt: new Date(row.created_at),
    };
}
class PostgresAccessRequestRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(input) {
        const [row] = await this.db("access_requests")
            .insert({
            user_id: input.userId,
            requested_by: input.requestedBy,
            request_type: input.requestType,
            current_stage: input.currentStage,
            status: input.status,
        })
            .returning("*");
        return mapAccessRequest(row);
    }
    async findById(id) {
        const row = (await this.db("access_requests").where({ id }).first());
        return row ? mapAccessRequest(row) : null;
    }
    async listByStage(stage) {
        const rows = (await this.db("access_requests")
            .where({ current_stage: stage })
            .orderBy("created_at", "asc"));
        return rows.map(mapAccessRequest);
    }
    async listByUserId(userId) {
        const rows = (await this.db("access_requests")
            .where({ user_id: userId })
            .orderBy("created_at", "desc"));
        return rows.map(mapAccessRequest);
    }
    async updateStageAndStatus(id, stage, status) {
        const [row] = await this.db("access_requests")
            .where({ id })
            .update({ current_stage: stage, status })
            .returning("*");
        return mapAccessRequest(row);
    }
}
exports.PostgresAccessRequestRepository = PostgresAccessRequestRepository;
