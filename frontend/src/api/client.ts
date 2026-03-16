import axios from "axios";
import type { Role } from "../routing/roles";

export type AuthUser = { id: string; name: string; email: string; role: Role };

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000",
});

export function setAuthToken(token: string | null) {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    return;
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data as { token: string; user: AuthUser };
}

export async function createEmployee(input: {
  name: string;
  email: string;
  departmentId: string | null;
  role: Role;
  managerId: string | null;
  tempPassword: string;
}) {
  const res = await api.post("/users", input);
  return res.data;
}

export async function listRequestsByStage(stage: string) {
  const res = await api.get(`/access-requests/stage/${stage}`);
  return res.data as { stage: string; requests: any[] };
}

export async function infraApprove(input: { requestId: string; basePermissionIds: string[] }) {
  const res = await api.post("/infra/approve", input);
  return res.data;
}

export async function departmentApprove(input: {
  requestId: string;
  departmentPermissionIds: string[];
}) {
  const res = await api.post("/department/approve", input);
  return res.data;
}

export async function cisoApprove(input: {
  requestId: string;
  finalPermissionIds: string[];
  decision: "APPROVE" | "REJECT";
  note?: string;
}) {
  const res = await api.post("/ciso/approve", input);
  return res.data;
}

export async function getUserAccess(userId: string) {
  const res = await api.get(`/users/${userId}/access`);
  return res.data;
}

export async function getSecurityDashboard() {
  const res = await api.get("/dashboard/security");
  return res.data;
}

