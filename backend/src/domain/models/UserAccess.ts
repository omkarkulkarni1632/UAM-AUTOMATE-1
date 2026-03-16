export const UserAccessStatuses = {
  GRANTED: "GRANTED",
  REVOKED: "REVOKED",
  PENDING: "PENDING",
} as const;

export type UserAccessStatus =
  (typeof UserAccessStatuses)[keyof typeof UserAccessStatuses];

export interface UserAccess {
  id: string;
  userId: string;
  permissionId: string;
  grantedBy: string; // user id
  status: UserAccessStatus;
  grantedAt: Date;
  lastUsedAt: Date | null;
}

