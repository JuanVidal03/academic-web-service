import { cleanup, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { ProtectedRoute } from "@/components/protected-route";
import { useAuthStore } from "@/shared/stores/auth.store";
import type { UserRole } from "@/shared/types/auth.types";

/**
 * Stub pages rather than the real ones: DashboardPage pulls in recharts, dnd-kit and a
 * sidebar, none of which this guard touches. Substituting them keeps the test about the
 * routing decision.
 */
const renderAt = (path: string, requiredRole?: UserRole) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<p>pagina de login</p>} />
        <Route element={<ProtectedRoute requiredRole={requiredRole} />}>
          <Route path="/dashboard" element={<p>contenido protegido</p>} />
          <Route path="/admin" element={<p>solo administradores</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

const signIn = (role: UserRole) =>
  useAuthStore.setState({
    accessToken: "a-token",
    user: { id: 1, email: `${role}@universidad.edu.co`, role, isActive: true },
    isBootstrapped: true
  });

const signOut = () =>
  useAuthStore.setState({ accessToken: null, user: null, isBootstrapped: true });

afterEach(() => {
  cleanup();
  signOut();
});

describe("ProtectedRoute", () => {
  it("redirects to login when there is no session", () => {
    // Bug 1 as reported: /dashboard was reachable while signed out.
    signOut();
    const { queryByText, getByText } = renderAt("/dashboard");

    expect(getByText("pagina de login")).toBeTruthy();
    expect(queryByText("contenido protegido")).toBeNull();
  });

  it("renders the protected content for a signed-in user", () => {
    signIn("adviser");
    const { getByText } = renderAt("/dashboard");

    expect(getByText("contenido protegido")).toBeTruthy();
  });

  it("shows the login page after logout, not a stuck loader", () => {
    // Bug 2 as reported. The old guard derived its loading flag from a disabled TanStack
    // query, which reports isPending forever once the cache is cleared -- so logging out
    // left the UI on "Verificando sesión..." permanently.
    signIn("admin");
    const first = renderAt("/dashboard");
    expect(first.getByText("contenido protegido")).toBeTruthy();
    cleanup();

    signOut();
    const { getByText, queryByText } = renderAt("/dashboard");

    expect(getByText("pagina de login")).toBeTruthy();
    expect(queryByText(/Verificando sesión/)).toBeNull();
    expect(queryByText("contenido protegido")).toBeNull();
  });

  it("keeps an adviser out of an admin-only route", () => {
    signIn("adviser");
    const { queryByText } = renderAt("/admin", "admin");

    expect(queryByText("solo administradores")).toBeNull();
  });

  it("lets an admin into an admin-only route", () => {
    signIn("admin");
    const { getByText } = renderAt("/admin", "admin");

    expect(getByText("solo administradores")).toBeTruthy();
  });
});
