export type AuthUserRole = "manager" | "worker";

/**
 * Maps a raw role value (from `profiles.role` or `user_metadata.role`)
 * to an app role. Legacy "admin" rows are treated as "manager" so the app
 * keeps working before the DB migration runs. Anything else — including
 * legacy "client" accounts — resolves to null (no dashboard access).
 */
export function normalizeStaffRole(value: unknown): AuthUserRole | null {
  if (value === "manager" || value === "worker") return value;
  if (value === "admin") return "manager";
  return null;
}

export function isStaffRole(value: unknown): value is AuthUserRole {
  return normalizeStaffRole(value) !== null;
}

/**
 * Decides whether a repeated auth event needs role re-fetching.
 * Avoids redundant role lookups/spinners while still refreshing on identity changes.
 */
export function needsRoleRefresh(
  event: string,
  currentRole: AuthUserRole | null,
  currentUserId: string | null,
  nextUserId: string
): boolean {
  if (event === "SIGNED_OUT") return false;

  // Different user/session identity always requires fresh role resolution
  if (currentUserId !== nextUserId) return true;

  // Role is unknown for current user
  if (currentRole === null) return true;

  // User metadata/profile may have changed
  if (event === "USER_UPDATED") return true;

  return false;
}
