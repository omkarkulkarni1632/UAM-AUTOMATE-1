import { RoleTemplate } from "../models/RoleTemplate";

export interface RoleTemplateRepository {
  findByRoleAndDepartment(
    roleName: string,
    departmentId: string | null
  ): Promise<RoleTemplate | null>;
  upsert(template: Omit<RoleTemplate, "id"> & { id?: string }): Promise<RoleTemplate>;
}

