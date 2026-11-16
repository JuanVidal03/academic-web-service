import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthGate } from "@/App";
import { LoginForm } from "@/components/login-form";
import { ProtectedRoute } from "@/components/protected-route";
import { useLogout } from "@/hooks/use-auth";
import { api } from "@/shared/api/client";
import { useAuthStore } from "@/shared/stores/auth.store";

/* eslint-disable camelcase -- the API's wire format, not ours to rename. */
const RAW_SESSION = {
  access_token: "an-access-token",
  expires_in: 900,
  user: { id: 2, email: "test@universidad.edu.co", role: "admin" as const, is_active: true }
};
/* eslint-enable camelcase */

const DashboardStub = () => {
  const { mutate: logout } = useLogout();
  return (
    <div>
      <p>panel de control</p>
      <button type="button" onClick={() => logout()}>
        Cerrar sesión
      </button>
    </div>
  );
};

/**
 * Mirrors App.tsx's structure -- AuthGate above the router, ProtectedRoute around the
 * dashboard -- with stub pages instead of the real ones, which drag in recharts and
 * dnd-kit. Everything under test is real: the bootstrap, the guard, the axios client, the
 * login form and the logout mutation.
 *
 * This exists because the browser could not be driven in this environment. It is the
 * closest headless equivalent to clicking through the app.
 */
const Journey = () => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    <MemoryRouter initialEntries={["/dashboard"]}>
      <AuthGate>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardStub />} />
          </Route>
        </Routes>
      </AuthGate>
    </MemoryRouter>
  </QueryClientProvider>
);

let post: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  useAuthStore.setState({ accessToken: null, user: null, isBootstrapped: false });
  post = vi.spyOn(api, "post");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("the full sign-in journey", () => {
  it("sends a signed-out visitor from /dashboard to the login form, then in and back out", async () => {
    // 1. Boot with no refresh cookie: the API rejects /auth/refresh.
    post.mockRejectedValueOnce(new Error("401"));
    const screen = render(<Journey />);

    // Bug 1: /dashboard must not render for a signed-out visitor.
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeTruthy();
    });
    expect(screen.queryByText("panel de control")).toBeNull();
    expect(screen.queryByText(/Verificando sesión/)).toBeNull();

    // 2. Sign in through the real form.
    post.mockResolvedValueOnce({ data: RAW_SESSION });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "test@universidad.edu.co" }
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "test123" }
    });
    fireEvent.submit(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(screen.getByText("panel de control")).toBeTruthy();
    });
    expect(post).toHaveBeenCalledWith("/auth/login", {
      email: "test@universidad.edu.co",
      password: "test123"
    });

    // 3. Sign out. Bug 2: this must return to the login form rather than freezing on the
    // loading placeholder.
    post.mockResolvedValueOnce({ data: null });
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeTruthy();
    });
    expect(post).toHaveBeenCalledWith("/auth/logout");
    expect(screen.queryByText("panel de control")).toBeNull();
    expect(screen.queryByText(/Verificando sesión/)).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("keeps a returning visitor signed in when the refresh cookie is valid", async () => {
    // The reload case: no access token in memory, but the httpOnly cookie is still good.
    post.mockResolvedValueOnce({ data: RAW_SESSION });
    const screen = render(<Journey />);

    await waitFor(() => {
      expect(screen.getByText("panel de control")).toBeTruthy();
    });
    expect(screen.queryByRole("heading", { name: "Iniciar sesión" })).toBeNull();
  });
});
