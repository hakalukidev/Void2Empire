import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  // NOTE: Role-based gating is intentionally NOT implemented here — it is
  // blocked by DR-026 (unresolved). Only authentication is enforced.
  if (!token || isTokenExpired(token)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
