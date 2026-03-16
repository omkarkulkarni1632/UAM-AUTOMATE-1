import { Knex } from "knex";
import { UserAccess, UserAccessStatus } from "../../domain/models/UserAccess";
import {
  GrantAccessInput,
  UserAccessRepository,
} from "../../domain/repositories/UserAccessRepository";

type UserAccessRow = {
  id: string;
  user_id: string;
  permission_id: string;
  granted_by: string;
  status: string;
  granted_at: Date;
  last_used_at: Date | null;
};

function mapUserAccess(row: UserAccessRow): UserAccess {
  return {
    id: row.id,
    userId: row.user_id,
    permissionId: row.permission_id,
    grantedBy: row.granted_by,
    status: row.status as UserAccessStatus,
    grantedAt: new Date(row.granted_at),
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
  };
}

export class PostgresUserAccessRepository implements UserAccessRepository {
  constructor(private readonly db: Knex) {}

  async grant(input: GrantAccessInput): Promise<UserAccess> {
    const [row] = await this.db("user_access")
      .insert({
        user_id: input.userId,
        permission_id: input.permissionId,
        granted_by: input.grantedBy,
        status: input.status,
      })
      .returning("*");
    return mapUserAccess(row as UserAccessRow);
  }

  async listByUserId(userId: string): Promise<UserAccess[]> {
    const rows = (await this.db("user_access")
      .where({ user_id: userId })
      .orderBy("granted_at", "desc")) as UserAccessRow[];
    return rows.map(mapUserAccess);
  }

  async revokeAllForUser(userId: string, revokedBy: string): Promise<number> {
    const rows = await this.db("user_access")
      .where({ user_id: userId })
      .update({ status: "REVOKED", granted_by: revokedBy })
      .returning("id");
    return rows.length;
  }

  async setStatus(id: string, status: UserAccessStatus): Promise<UserAccess> {
    const [row] = await this.db("user_access")
      .where({ id })
      .update({ status })
      .returning("*");
    return mapUserAccess(row as UserAccessRow);
  }

  async touchLastUsed(accessId: string, at: Date): Promise<UserAccess> {
    const [row] = await this.db("user_access")
      .where({ id: accessId })
      .update({ last_used_at: at })
      .returning("*");
    return mapUserAccess(row as UserAccessRow);
  }
}

