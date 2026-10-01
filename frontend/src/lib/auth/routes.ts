// Single source of truth for which routes need a session. proxy.ts uses it for
// the optimistic cookie check and AuthProvider uses it to bounce a stale
// cookie that the backend rejected. Keep proxy.ts `config.matcher` in sync.

// Pages that require a logged-in user.
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/wallet",
  "/funding",
  "/profile",
  "/referral",
  "/trade",
  "/orders",
  "/positions",
  "/history",
  "/p2p",
  "/listing-application",
  "/support",
  "/admin",
] as const;

// Pages a logged-in user has no reason to see; they are sent to the dashboard.
export const GUEST_ONLY_PATHS = ["/login", "/register"] as const;

export const DEFAULT_AUTHENTICATED_PATH = "/dashboard";

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export function isGuestOnlyPath(pathname: string) {
  return GUEST_ONLY_PATHS.some((path) => matchesPrefix(pathname, path));
}

// Only same-origin relative paths are honored for ?next=, to avoid open redirects.
export function safeNextPath(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : DEFAULT_AUTHENTICATED_PATH;
}

export function loginPathFor(pathname: string) {
  return `/login?next=${encodeURIComponent(pathname)}`;
}
