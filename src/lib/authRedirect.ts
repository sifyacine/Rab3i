/**
 * Auth redirect URL builder.
 * Prefers VITE_APP_URL env var, falls back to window.location.origin.
 */

/**
 * Returns the base URL for the app, preferring env override.
 * Reads from env on every call so tests can stub the value.
 */
export function getAppBaseUrl(): string {
  const appUrl = import.meta.env.VITE_APP_URL as string | undefined;
  if (appUrl) {
    return appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

/**
 * Builds a full redirect URL for Supabase auth flows.
 * @param path - The path to redirect to (e.g. "/reset-password")
 */
export function buildAuthRedirectUrl(path: string): string {
  const base = getAppBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
