import { Permission } from "../models/Permission";

export interface PermissionRepository {
  findById(id: string): Promise<Permission | null>;
  listAll(): Promise<Permission[]>;
  listByIds(ids: string[]): Promise<Permission[]>;
  upsert(permission: Omit<Permission, "id"> & { id?: string }): Promise<Permission>;
}

