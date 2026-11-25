import { http } from "../../../services/api/client";

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "admin" | "super admin";
  created_at: string;
}

export async function getTeam() {
  const res = await http.get<{ message: string; data: TeamMember[] }>(
    "/admin/admins",
  );
  return res.data.data;
}

export function createAdmin(input: {
  name: string;
  email: string;
}) {
  // Gives up after 30 seconds, so the form shows an error instead of "Saving..." forever.
  return http.post("/admin/admins", input, { timeout: 30_000 });
}

export function setupAdminPassword(token: string, password: string) {
  return http.post("/auth/admin/setup-password", { token, password });
}

export function revokeAdmin(id: number) {
  return http.patch(`/admin/admins/${id}/revoke`);
}