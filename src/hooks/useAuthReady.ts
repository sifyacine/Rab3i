import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook that returns true only when:
 * 1. Auth is fully initialized (not loading)
 * 2. Session is valid (if user is present)
 * 3. User role is resolved (if required)
 *
 * Use this before making authenticated Supabase queries to prevent
 * race conditions and session desync issues.
 *
 * Example:
 * const isReady = useAuthReady();
 * const { data } = useQuery({
 *   queryKey: ['services'],
 *   queryFn: () => getServices(),
 *   enabled: isReady,
 * });
 */
export function useAuthReady(requireRole?: "admin" | "client"): boolean {
  const { loading, sessionValid, user, role } = useAuth();

  // Still loading
  if (loading) return false;

  // No user at all
  if (!user) return false;

  // Session isn't valid
  if (!sessionValid) return false;

  // If a specific role is required, make sure it's resolved
  if (requireRole && role !== requireRole) return false;

  // All checks passed
  return true;
}
