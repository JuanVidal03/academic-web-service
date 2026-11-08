import { create } from "zustand";

import type { Session, User } from "@/shared/types/auth.types";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isBootstrapped: boolean;
  setSession: (_session: Session) => void;
  clearSession: () => void;
  setBootstrapped: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  isBootstrapped: false,
  setSession: (session) =>
    set({ accessToken: session.accessToken, user: session.user, isBootstrapped: true }),
  clearSession: () => set({ accessToken: null, user: null, isBootstrapped: true }),
  setBootstrapped: () => set({ isBootstrapped: true })
}));

export const getAccessToken = (): string | null => useAuthStore.getState().accessToken;
