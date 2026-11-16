import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NavUser } from "@/components/nav-user";
import { SidebarProvider } from "@/components/ui/sidebar";
import { api } from "@/shared/api/client";
import { useAuthStore } from "@/shared/stores/auth.store";

/**
 * Renders the real NavUser, including the real Base UI dropdown.
 *
 * The earlier tests used a plain <button> stub, which is why a broken handler on the
 * actual menu item went unnoticed: the stub tested the stub. The menu primitive is part
 * of what can break here, so it has to be in the test.
 */
const Harness = () => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    <MemoryRouter>
      <SidebarProvider>
        <NavUser user={{ name: "test", email: "test@universidad.edu.co", avatar: "" }} />
      </SidebarProvider>
    </MemoryRouter>
  </QueryClientProvider>
);

let post: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  useAuthStore.setState({
    accessToken: "a-token",
    user: { id: 2, email: "test@universidad.edu.co", role: "admin", isActive: true },
    isBootstrapped: true
  });
  post = vi.spyOn(api, "post");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("NavUser", () => {
  it("signs the user out when the menu item is clicked", async () => {
    post.mockResolvedValue({ data: null });
    const screen = render(<Harness />);

    // Open the menu, then click the item -- the path a user actually takes.
    fireEvent.click(screen.getByRole("button", { name: /test@universidad\.edu\.co/ }));
    const item = await screen.findByText("Cerrar sesión");
    fireEvent.click(item);

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/auth/logout");
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });

  it("shows the signed-in user's email rather than the passed-in placeholder", () => {
    const screen = render(<Harness />);
    expect(screen.getByText("test@universidad.edu.co")).toBeTruthy();
  });

  it("shows the account's initials, not the shadcn \"CN\" placeholder", () => {
    const screen = render(<Harness />);

    expect(screen.getByTestId("avatar-initials").textContent).toBe("TE");
    expect(screen.queryByText("CN")).toBeNull();
  });

  it("derives initials from the signed-in session, not the passed-in prop", () => {
    useAuthStore.setState({
      accessToken: "a-token",
      user: { id: 3, email: "juan.vidal@universidad.edu.co", role: "adviser", isActive: true },
      isBootstrapped: true
    });

    const screen = render(<Harness />);

    expect(screen.getByTestId("avatar-initials").textContent).toBe("JV");
  });

  it("offers no menu entry that does nothing", async () => {
    // Cuenta, Facturación and Notificaciones were shadcn scaffolding with no handlers.
    // A menu that lists actions which silently do nothing is worse than a short menu.
    const screen = render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /test@universidad\.edu\.co/ }));
    await screen.findByText("Cerrar sesión");

    for (const dead of ["Cuenta", "Facturación", "Notificaciones"]) {
      expect(screen.queryByText(dead), `${dead} should be gone`).toBeNull();
    }
    // Logout is the only actionable item left.
    expect(screen.getAllByRole("menuitem")).toHaveLength(1);
  });
});
