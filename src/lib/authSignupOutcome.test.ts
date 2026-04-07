import { describe, expect, it } from "vitest";
import { isExistingUnconfirmedSignup } from "./authSignupOutcome";

describe("isExistingUnconfirmedSignup", () => {
  it("returns true when user exists, no session, and identities are empty", () => {
    expect(
      isExistingUnconfirmedSignup({
        user: { identities: [] },
        session: null,
      })
    ).toBe(true);
  });

  it("returns false when session exists", () => {
    expect(
      isExistingUnconfirmedSignup({
        user: { identities: [] },
        session: { access_token: "x" },
      })
    ).toBe(false);
  });

  it("returns false when user is missing", () => {
    expect(
      isExistingUnconfirmedSignup({
        user: null,
        session: null,
      })
    ).toBe(false);
  });
});
