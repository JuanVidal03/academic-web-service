import { api, toSession } from "@/shared/api/client";
import type { RawSession } from "@/shared/api/client";
import type { LoginCredentials, Session, User } from "@/shared/types/auth.types";

export const login = async (credentials: LoginCredentials): Promise<Session> => {
  const { data } = await api.post<RawSession>("/auth/login", credentials);
  return toSession(data);
};

export const refresh = async (): Promise<Session> => {
  const { data } = await api.post<RawSession>("/auth/refresh");
  return toSession(data);
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

interface RawUser {
  id: number;
  email: string;
  role: "adviser" | "admin";
  is_active: boolean;
}

export const me = async (): Promise<User> => {
  const { data } = await api.get<RawUser>("/auth/me");
  return { id: data.id, email: data.email, role: data.role, isActive: data.is_active };
};
