export interface AuditLog {
  id: string;
  userId: string | null; // subject
  action: string;
  performedBy: string; // actor user id
  timestamp: Date;
  details: Record<string, unknown>;
}

