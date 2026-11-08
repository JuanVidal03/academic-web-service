import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import { getAccessToken, useAuthStore } from "@/shared/stores/auth.store";
import type { Session } from "@/shared/types/auth.types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const AUTH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"];

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && !AUTH_PATHS.some((path) => config.url?.startsWith(path))) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshInFlight: Promise<Session> | null = null;

const refreshSession = (): Promise<Session> => {
  if (refreshInFlight === null) {
    refreshInFlight = api
      .post<RawSession>("/auth/refresh")
      .then((response) => toSession(response.data))
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

interface RawSession {
  access_token: string;
  expires_in: number;
  user: { id: number; email: string; role: "adviser" | "admin"; is_active: boolean };
}

/** The API speaks snake_case; the client speaks camelCase. Converted in one place. */
export const toSession = (raw: RawSession): Session => ({
  accessToken: raw.access_token,
  expiresIn: raw.expires_in,
  user: {
    id: raw.user.id,
    email: raw.user.email,
    role: raw.user.role,
    isActive: raw.user.is_active
  }
});

export type { RawSession };

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isUnauthorised = error.response?.status === 401;
    const isAuthCall = AUTH_PATHS.some((path) => config?.url?.startsWith(path));

    if (!isUnauthorised || isAuthCall || config === undefined || config._retried === true) {
      return Promise.reject(error);
    }

    config._retried = true;
    try {
      const session = await refreshSession();
      useAuthStore.getState().setSession(session);
      config.headers.set("Authorization", `Bearer ${session.accessToken}`);
      return await api.request(config);
    } catch {
      useAuthStore.getState().clearSession();
      return Promise.reject(error);
    }
  }
);

export { refreshSession };
