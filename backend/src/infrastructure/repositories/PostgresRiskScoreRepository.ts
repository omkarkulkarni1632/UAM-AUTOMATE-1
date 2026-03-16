import { Knex } from "knex";
import { RiskScore } from "../../domain/models/RiskScore";
import {
  CreateRiskScoreInput,
  RiskScoreRepository,
} from "../../domain/repositories/RiskScoreRepository";

type RiskScoreRow = {
  id: string;
  user_id: string;
  score: number;
  calculated_at: Date;
  factors: any;
};

function mapRiskScore(row: RiskScoreRow): RiskScore {
  return {
    id: row.id,
    userId: row.user_id,
    score: row.score,
    calculatedAt: new Date(row.calculated_at),
    factors: row.factors ?? {},
  };
}

export class PostgresRiskScoreRepository implements RiskScoreRepository {
  constructor(private readonly db: Knex) {}

  async upsertLatest(input: CreateRiskScoreInput): Promise<RiskScore> {
    const [row] = await this.db("risk_scores")
      .insert({
        user_id: input.userId,
        score: input.score,
        factors: input.factors ?? {},
      })
      .returning("*");
    return mapRiskScore(row as RiskScoreRow);
  }

  async getLatestByUserId(userId: string): Promise<RiskScore | null> {
    const row = (await this.db("risk_scores")
      .where({ user_id: userId })
      .orderBy("calculated_at", "desc")
      .first()) as RiskScoreRow | undefined;
    return row ? mapRiskScore(row) : null;
  }

  async listTopRisk(limit: number): Promise<RiskScore[]> {
    const rows = (await this.db("risk_scores")
      .orderBy("score", "desc")
      .orderBy("calculated_at", "desc")
      .limit(limit)) as RiskScoreRow[];
    return rows.map(mapRiskScore);
  }
}

