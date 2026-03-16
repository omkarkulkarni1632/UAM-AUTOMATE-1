export interface RiskScore {
  id: string;
  userId: string;
  score: number; // 0-100
  calculatedAt: Date;
  factors: Record<string, unknown>;
}

