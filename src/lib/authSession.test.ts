import { describe, it, expect } from "vitest";
import { needsRoleRefresh, normalizeStaffRole, isStaffRole } from "./authSession";

describe("needsRoleRefresh", () => {
  it("returns false for SIGNED_OUT", () => {
    expect(needsRoleRefresh("SIGNED_OUT", "manager", "u1", "u1")).toBe(false);
  });

  it("returns true when user identity changes", () => {
    expect(needsRoleRefresh("TOKEN_REFRESHED", "manager", "u1", "u2")).toBe(true);
  });

  it("returns true when role is unknown for same user", () => {
    expect(needsRoleRefresh("TOKEN_REFRESHED", null, "u1", "u1")).toBe(true);
  });

  it("returns true for USER_UPDATED even when role already known", () => {
    expect(needsRoleRefresh("USER_UPDATED", "worker", "u1", "u1")).toBe(true);
  });

  it("returns false for token refresh when same user and role already known", () => {
    expect(needsRoleRefresh("TOKEN_REFRESHED", "manager", "u1", "u1")).toBe(false);
  });
});

describe("normalizeStaffRole", () => {
  it("passes through the staff roles", () => {
    expect(normalizeStaffRole("manager")).toBe("manager");
    expect(normalizeStaffRole("worker")).toBe("worker");
  });

  it("maps the legacy admin role to manager", () => {
    expect(normalizeStaffRole("admin")).toBe("manager");
  });

  it("denies legacy client accounts and unknown values", () => {
    expect(normalizeStaffRole("client")).toBeNull();
    expect(normalizeStaffRole("editor")).toBeNull();
    expect(normalizeStaffRole("")).toBeNull();
    expect(normalizeStaffRole(null)).toBeNull();
    expect(normalizeStaffRole(undefined)).toBeNull();
  });
});

describe("isStaffRole", () => {
  it("accepts staff roles including the legacy admin alias", () => {
    expect(isStaffRole("manager")).toBe(true);
    expect(isStaffRole("worker")).toBe(true);
    expect(isStaffRole("admin")).toBe(true);
  });

  it("rejects non-staff values", () => {
    expect(isStaffRole("client")).toBe(false);
    expect(isStaffRole(null)).toBe(false);
  });
});
