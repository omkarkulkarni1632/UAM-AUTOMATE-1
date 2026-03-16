"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresRiskScoreRepository = void 0;
function mapRiskScore(row) {
    return {
        id: row.id,
        userId: row.user_id,
        score: row.score,
        calculatedAt: new Date(row.calculated_at),
        factors: row.factors ?? {},
    };
}
class PostgresRiskScoreRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async upsertLatest(input) {
        const [row] = await this.db("risk_scores")
            .insert({
            user_id: input.userId,
            score: input.score,
            factors: input.factors ?? {},
        })
            .returning("*");
        return mapRiskScore(row);
    }
    async getLatestByUserId(userId) {
        const row = (await this.db("risk_scores")
            .where({ user_id: userId })
            .orderBy("calculated_at", "desc")
            .first());
        return row ? mapRiskScore(row) : null;
    }
    async listTopRisk(limit) {
        const rows = (await this.db("risk_scores")
            .orderBy("score", "desc")
            .orderBy("calculated_at", "desc")
            .limit(limit));
        return rows.map(mapRiskScore);
    }
}
exports.PostgresRiskScoreRepository = PostgresRiskScoreRepository;
