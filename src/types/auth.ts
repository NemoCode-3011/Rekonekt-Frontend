export type Role = "visitor" | "admin" | "super admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  preferred_language: string;
  is_verified: boolean;
}