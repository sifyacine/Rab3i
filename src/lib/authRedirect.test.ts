import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildAuthRedirectUrl, getAppBaseUrl } from "./authRedirect";

describe("authRedirect", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getAppBaseUrl", () => {
    it("returns VITE_APP_URL when set", () => {
      vi.stubEnv("VITE_APP_URL", "https://my-app.netlify.app");
      // Re-evaluate by re-importing the cached module via direct call
      // (the module reads import.meta.env at call time, not at module init)
      expect(getAppBaseUrl()).toBe("https://my-app.netlify.app");
    });

    it("strips trailing slash from VITE_APP_URL", () => {
      vi.stubEnv("VITE_APP_URL", "https://my-app.netlify.app/");
      expect(getAppBaseUrl()).toBe("https://my-app.netlify.app");
    });

    it("falls back to window.location.origin when VITE_APP_URL not set", () => {
      // location.origin will be defined by jsdom
      expect(getAppBaseUrl()).toBe(window.location.origin);
    });
  });

  describe("buildAuthRedirectUrl", () => {
    it("prepends / to path when missing", () => {
      vi.stubEnv("VITE_APP_URL", "https://my-app.netlify.app");
      expect(buildAuthRedirectUrl("reset-password")).toBe(
        "https://my-app.netlify.app/reset-password"
      );
    });

    it("keeps path intact when it already starts with /", () => {
      vi.stubEnv("VITE_APP_URL", "https://my-app.netlify.app");
      expect(buildAuthRedirectUrl("/reset-password")).toBe(
        "https://my-app.netlify.app/reset-password"
      );
    });

    it("uses window.location.origin when VITE_APP_URL not set", () => {
      expect(buildAuthRedirectUrl("/reset-password")).toBe(
        `${window.location.origin}/reset-password`
      );
    });
  });
});
