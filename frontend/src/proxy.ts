import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isGuestOnlyPath, isProtectedPath, safeNextPath } from "@/lib/auth/routes";

// Authentication cookie set by the backend (see backend config.CookieName).
const AUTH_COOKIE = "access_token";

function isTokenExpired(token: string): boolean {
  // Decode the JWT payload only to read `exp`. Signature verification is the
  // backend's job (RequireAuth); this guard is a routing/UX layer, not the
  // authoritative auth check.
  const payload = token.split(".")[1];
  if (!payload) return true;
  try {
    const json = JSON.parse(
      decodeURIComponent(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
    if (typeof json.exp !== "number") return false;
    return json.exp * 1000 <= Date.now();
  } catch {
    // Undecodable token — treat as absent and let the backend be the source of truth.
    return true;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const hasSession = !!token && !isTokenExpired(token);
  const { pathname, search } = request.nextUrl;

  if (isGuestOnlyPath(pathname)) {
    if (!hasSession) return NextResponse.next();
    const next = request.nextUrl.searchParams.get("next");
    return NextResponse.redirect(new URL(safeNextPath(next), request.url));
  }

  // NOTE: Role-based gating is intentionally NOT implemented here — it is
  // blocked by DR-026 (unresolved). Only authentication is enforced.
  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Must be static literals (Next analyzes them at build time); mirror
// PROTECTED_PREFIXES and GUEST_ONLY_PATHS in lib/auth/routes.ts.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/wallet/:path*",
    "/funding/:path*",
    "/profile/:path*",
    "/referral/:path*",
    "/trade/:path*",
    "/orders/:path*",
    "/positions/:path*",
    "/history/:path*",
    "/p2p/:path*",
    "/listing-application/:path*",
    "/support/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
