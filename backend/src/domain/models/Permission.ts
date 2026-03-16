export interface Permission {
  id: string;
  permissionName: string;
  system: string;
  privilegeLevel: number; // 0-5 (higher = more privileged)
  isSensitiveSystem: boolean;
}

