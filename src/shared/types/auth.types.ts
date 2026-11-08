export type UserRole = "adviser" | "admin";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Session {
  accessToken: string;
  expiresIn: number;
  user: User;
}
