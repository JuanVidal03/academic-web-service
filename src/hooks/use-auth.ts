import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { login as loginRequest, logout as logoutRequest } from "@/shared/api/auth.api";
import { refreshSession } from "@/shared/api/client";
import { useAuthStore } from "@/shared/stores/auth.store";
import type { LoginCredentials } from "@/shared/types/auth.types";

export const useSession = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  return {
    user,
    isAuthenticated: accessToken !== null,
    isBootstrapped,
    role: user?.role ?? null
  };
};

export const useBootstrapSession = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  useEffect(() => {
    if (isBootstrapped) {
      return;
    }
    let active = true;

    refreshSession()
      .then((session) => {
        if (active) {
          setSession(session);
        }
      })
      .catch(() => {
        if (active) {
          clearSession();
        }
      });

    return () => {
      active = false;
    };
  }, [isBootstrapped, setSession, clearSession]);

  return { isBootstrapped };
};

export const useLogin = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginRequest(credentials),
    onSuccess: (session) => {
      setSession(session);
      navigate("/dashboard", { replace: true });
    },
    onError: () => {
      toast.error("Correo o contraseña incorrectos.");
    }
  });
};

export const useLogout = () => {
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearSession();
      queryClient.clear();
      navigate("/", { replace: true });
    }
  });
};
