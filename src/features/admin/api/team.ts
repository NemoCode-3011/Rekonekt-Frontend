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
  password: string;
}) {
  return http.post("/admin/admins", input);
}

export function revokeAdmin(id: number) {
  return http.patch(`/admin/admins/${id}/revoke`);
}