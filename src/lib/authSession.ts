export type AuthUserRole = "admin" | "client";

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
