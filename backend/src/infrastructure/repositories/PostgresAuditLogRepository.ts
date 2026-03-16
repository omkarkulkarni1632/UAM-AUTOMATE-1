import { Knex } from "knex";
import { AuditLog } from "../../domain/models/AuditLog";
import {
  AuditLogRepository,
  CreateAuditLogInput,
} from "../../domain/repositories/AuditLogRepository";

type AuditLogRow = {
  id: string;
  user_id: string | null;
  action: string;
  performed_by: string;
  timestamp: Date;
  details: any;
};

function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    performedBy: row.performed_by,
    timestamp: new Date(row.timestamp),
    details: row.details ?? {},
  };
}

export class PostgresAuditLogRepository implements AuditLogRepository {
  constructor(private readonly db: Knex) {}

  async create(input: CreateAuditLogInput): Promise<AuditLog> {
    const [row] = await this.db("audit_logs")
      .insert({
        user_id: input.userId,
        action: input.action,
        performed_by: input.performedBy,
        details: input.details ?? {},
      })
      .returning("*");
    return mapAuditLog(row as AuditLogRow);
  }

  async listRecent(limit: number): Promise<AuditLog[]> {
    const rows = (await this.db("audit_logs")
      .orderBy("timestamp", "desc")
      .limit(limit)) as AuditLogRow[];
    return rows.map(mapAuditLog);
  }

  async listByUserId(userId: string, limit: number): Promise<AuditLog[]> {
    const rows = (await this.db("audit_logs")
      .where({ user_id: userId })
      .orderBy("timestamp", "desc")
      .limit(limit)) as AuditLogRow[];
    return rows.map(mapAuditLog);
  }
}

