import { AuditLog } from "../models/AuditLog";

export interface CreateAuditLogInput {
  userId: string | null;
  action: string;
  performedBy: string;
  details: Record<string, unknown>;
}

export interface AuditLogRepository {
  create(input: CreateAuditLogInput): Promise<AuditLog>;
  listRecent(limit: number): Promise<AuditLog[]>;
  listByUserId(userId: string, limit: number): Promise<AuditLog[]>;
}

