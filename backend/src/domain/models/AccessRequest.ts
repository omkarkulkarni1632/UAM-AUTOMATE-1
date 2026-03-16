import { AccessRequestStatus, RequestType, WorkflowStage } from "../constants/rbac";

export interface AccessRequest {
  id: string;
  userId: string;
  requestedBy: string; // actor user id
  requestType: RequestType;
  currentStage: WorkflowStage;
  status: AccessRequestStatus;
  createdAt: Date;
}

export interface AccessRequestDecision {
  requestId: string;
  actorUserId: string;
  decision: "APPROVE" | "REJECT";
  note?: string;
}

