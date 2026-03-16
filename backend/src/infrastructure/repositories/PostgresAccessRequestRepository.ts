import { Knex } from "knex";
import {
  AccessRequestStatus,
  RequestType,
  WorkflowStage,
} from "../../domain/constants/rbac";
import { AccessRequest } from "../../domain/models/AccessRequest";
import {
  AccessRequestRepository,
  CreateAccessRequestInput,
} from "../../domain/repositories/AccessRequestRepository";

type AccessRequestRow = {
  id: string;
  user_id: string;
  requested_by: string;
  request_type: string;
  current_stage: string;
  status: string;
  created_at: Date;
};

function mapAccessRequest(row: AccessRequestRow): AccessRequest {
  return {
    id: row.id,
    userId: row.user_id,
    requestedBy: row.requested_by,
    requestType: row.request_type as RequestType,
    currentStage: row.current_stage as WorkflowStage,
    status: row.status as AccessRequestStatus,
    createdAt: new Date(row.created_at),
  };
}

export class PostgresAccessRequestRepository implements AccessRequestRepository {
  constructor(private readonly db: Knex) {}

  async create(input: CreateAccessRequestInput): Promise<AccessRequest> {
    const [row] = await this.db("access_requests")
      .insert({
        user_id: input.userId,
        requested_by: input.requestedBy,
        request_type: input.requestType,
        current_stage: input.currentStage,
        status: input.status,
      })
      .returning("*");
    return mapAccessRequest(row as AccessRequestRow);
  }

  async findById(id: string): Promise<AccessRequest | null> {
    const row = (await this.db("access_requests").where({ id }).first()) as
      | AccessRequestRow
      | undefined;
    return row ? mapAccessRequest(row) : null;
  }

  async listByStage(stage: WorkflowStage): Promise<AccessRequest[]> {
    const rows = (await this.db("access_requests")
      .where({ current_stage: stage })
      .orderBy("created_at", "asc")) as AccessRequestRow[];
    return rows.map(mapAccessRequest);
  }

  async listByUserId(userId: string): Promise<AccessRequest[]> {
    const rows = (await this.db("access_requests")
      .where({ user_id: userId })
      .orderBy("created_at", "desc")) as AccessRequestRow[];
    return rows.map(mapAccessRequest);
  }

  async updateStageAndStatus(
    id: string,
    stage: WorkflowStage,
    status: AccessRequestStatus
  ): Promise<AccessRequest> {
    const [row] = await this.db("access_requests")
      .where({ id })
      .update({ current_stage: stage, status })
      .returning("*");
    return mapAccessRequest(row as AccessRequestRow);
  }
}

