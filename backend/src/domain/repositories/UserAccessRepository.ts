import { UserAccess, UserAccessStatus } from "../models/UserAccess";

export interface GrantAccessInput {
  userId: string;
  permissionId: string;
  grantedBy: string;
  status: UserAccessStatus;
}

export interface UserAccessRepository {
  grant(input: GrantAccessInput): Promise<UserAccess>;
  listByUserId(userId: string): Promise<UserAccess[]>;
  revokeAllForUser(userId: string, revokedBy: string): Promise<number>;
  setStatus(id: string, status: UserAccessStatus): Promise<UserAccess>;
  touchLastUsed(accessId: string, at: Date): Promise<UserAccess>;
}

