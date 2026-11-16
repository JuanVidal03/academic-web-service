import { vi } from "vitest";

/**
 * jsdom implements no CSS media query engine, so `window.matchMedia` is undefined. The
 * sidebar's `use-mobile` hook calls it on mount, which crashes any test that renders a
 * component tree containing the sidebar.
 *
 * Reports "not mobile", which is the desktop layout the tests assume.
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  })
});
