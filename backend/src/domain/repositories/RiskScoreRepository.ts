import { RiskScore } from "../models/RiskScore";

export interface CreateRiskScoreInput {
  userId: string;
  score: number;
  factors: Record<string, unknown>;
}

export interface RiskScoreRepository {
  upsertLatest(input: CreateRiskScoreInput): Promise<RiskScore>;
  getLatestByUserId(userId: string): Promise<RiskScore | null>;
  listTopRisk(limit: number): Promise<RiskScore[]>;
}

