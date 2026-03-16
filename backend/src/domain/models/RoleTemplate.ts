export interface RoleTemplate {
  id: string;
  roleName: string;
  departmentId: string | null;
  defaultPermissions: string[]; // permission ids
}

