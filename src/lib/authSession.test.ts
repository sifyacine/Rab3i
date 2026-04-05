import { describe, it, expect } from "vitest";
import { needsRoleRefresh } from "./authSession";

describe("needsRoleRefresh", () => {
  it("returns false for SIGNED_OUT", () => {
    expect(needsRoleRefresh("SIGNED_OUT", "admin", "u1", "u1")).toBe(false);
  });

  it("returns true when user identity changes", () => {
    expect(needsRoleRefresh("TOKEN_REFRESHED", "admin", "u1", "u2")).toBe(true);
  });

  it("returns true when role is unknown for same user", () => {
    expect(needsRoleRefresh("TOKEN_REFRESHED", null, "u1", "u1")).toBe(true);
  });

  it("returns true for USER_UPDATED even when role already known", () => {
    expect(needsRoleRefresh("USER_UPDATED", "client", "u1", "u1")).toBe(true);
  });

  it("returns false for token refresh when same user and role already known", () => {
    expect(needsRoleRefresh("TOKEN_REFRESHED", "admin", "u1", "u1")).toBe(false);
  });
});
