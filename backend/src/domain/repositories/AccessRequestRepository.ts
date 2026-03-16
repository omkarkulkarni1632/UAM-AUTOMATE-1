import { AccessRequest } from "../models/AccessRequest";
import { AccessRequestStatus, RequestType, WorkflowStage } from "../constants/rbac";

export interface CreateAccessRequestInput {
  userId: string;
  requestedBy: string;
  requestType: RequestType;
  currentStage: WorkflowStage;
  status: AccessRequestStatus;
}

export interface AccessRequestRepository {
  create(input: CreateAccessRequestInput): Promise<AccessRequest>;
  findById(id: string): Promise<AccessRequest | null>;
  listByStage(stage: WorkflowStage): Promise<AccessRequest[]>;
  listByUserId(userId: string): Promise<AccessRequest[]>;
  updateStageAndStatus(
    id: string,
    stage: WorkflowStage,
    status: AccessRequestStatus
  ): Promise<AccessRequest>;
}

