import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useBootstrapSession, useLogout } from "@/hooks/use-auth";
import { api } from "@/shared/api/client";
import { useAuthStore } from "@/shared/stores/auth.store";

const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigate };
});

/* eslint-disable camelcase -- these keys are the API's wire format, not ours to rename.
   Using camelCase here would make the fixture disagree with the real payload and the
   toSession mapping would silently produce undefined. */
/** The snake_case payload the API actually returns. */
const RAW_SESSION = {
  access_token: "an-access-token",
  expires_in: 900,
  user: { id: 1, email: "test@universidad.edu.co", role: "admin" as const, is_active: true }
};
/* eslint-enable camelcase */

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

const BootstrapProbe = () => {
  const { isBootstrapped } = useBootstrapSession();
  return <span>{isBootstrapped ? "ready" : "booting"}</span>;
};

const LogoutProbe = () => {
  const { mutate } = useLogout();
  return (
    <button type="button" onClick={() => mutate()}>
      salir
    </button>
  );
};

/**
 * Spied at the HTTP boundary, not at `refreshSession`.
 *
 * That distinction is the point of the StrictMode test below: `refreshSession` *is* the
 * de-duplication, so mocking it would measure the mock instead of the protection. Letting
 * the real helper run and counting requests is what actually proves only one rotation
 * happens.
 */
let post: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  useAuthStore.setState({ accessToken: null, user: null, isBootstrapped: false });
  navigate.mockReset();
  post = vi.spyOn(api, "post");
});

afterEach(() => {
  // Required explicitly: Testing Library's auto-cleanup only registers when vitest runs
  // with globals enabled, and this project keeps them off.
  cleanup();
  vi.restoreAllMocks();
});

describe("useBootstrapSession", () => {
  it("stores the session when the refresh cookie is valid", async () => {
    post.mockResolvedValue({ data: RAW_SESSION });
    const { findByText } = render(<BootstrapProbe />, { wrapper: Wrapper });

    expect(await findByText("ready")).toBeTruthy();
    expect(useAuthStore.getState().accessToken).toBe("an-access-token");
    expect(useAuthStore.getState().user?.email).toBe("test@universidad.edu.co");
    expect(post).toHaveBeenCalledWith("/auth/refresh");
  });

  it("settles as bootstrapped when there is no session, rather than loading forever", async () => {
    // The reported bug: the app could never leave its loading state, so the guard never
    // decided and the login page froze on "Verificando sesión...".
    post.mockRejectedValue(new Error("401"));
    const { findByText } = render(<BootstrapProbe />, { wrapper: Wrapper });

    expect(await findByText("ready")).toBeTruthy();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isBootstrapped).toBe(true);
  });

  it("issues only one refresh request under StrictMode's double mount", async () => {
    // Effects run twice in development. A second /auth/refresh would replay a token the
    // first call just rotated away, which the API reads as theft and answers by revoking
    // the whole chain -- an unexplained logout on every page load.
    post.mockResolvedValue({ data: RAW_SESSION });
    const { findByText } = render(
      <StrictMode>
        <BootstrapProbe />
      </StrictMode>,
      { wrapper: Wrapper }
    );

    expect(await findByText("ready")).toBeTruthy();
    expect(post).toHaveBeenCalledTimes(1);
  });
});

describe("useLogout", () => {
  it("calls the endpoint, clears the store and returns to the login page", async () => {
    useAuthStore.setState({
      accessToken: "t",
      user: { id: 1, email: "a@b.co", role: "admin", isActive: true },
      isBootstrapped: true
    });
    post.mockResolvedValue({ data: null });
    const { getByText } = render(<LogoutProbe />, { wrapper: Wrapper });

    await act(async () => {
      getByText("salir").click();
    });

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/auth/logout");
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("still signs the user out when the request fails", async () => {
    // onSettled, not onSuccess: an unreachable API must not leave someone signed in
    // against their wishes.
    useAuthStore.setState({
      accessToken: "t",
      user: { id: 1, email: "a@b.co", role: "admin", isActive: true },
      isBootstrapped: true
    });
    post.mockRejectedValue(new Error("network"));
    const { getByText } = render(<LogoutProbe />, { wrapper: Wrapper });

    await act(async () => {
      getByText("salir").click();
    });

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });
});
