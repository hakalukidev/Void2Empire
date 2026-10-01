package auth

import (
	"context"
	"log"
	"net/http"

	"github.com/labstack/echo/v4"

	"void2empire/internal/httpx"
	"void2empire/internal/rbac"
)

const (
	ContextUserIDKey = "userID"

	// ContextRoleKey holds the caller's rbac.Role, resolved per request by
	// RequireAuth. server.RequireCapability reads it. Keeping it out of the
	// request path's hands — set only here, never from a header or a token
	// claim — is what makes the fail-closed default meaningful.
	ContextRoleKey = "role"
)

// RoleResolver supplies the caller's platform role. *Repository implements it
// from admin_users; the interface exists so the middleware can be tested
// without a database.
type RoleResolver interface {
	RoleForUser(ctx context.Context, userID string) (rbac.Role, error)
}

// RequireAuth reads the JWT from the auth cookie, validates it, and stores the
// authenticated user's ID and role on the request context.
//
// This is the only authoritative authentication check in the Go service. The
// Next.js middleware in frontend/src/proxy.ts decodes the same cookie without
// verifying its signature, so it is a routing/UX layer and never a substitute
// for this.
func RequireAuth(tokens *TokenManager, cookieName string, roles RoleResolver) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cookie, err := c.Cookie(cookieName)
			if err != nil || cookie.Value == "" {
				return httpx.Error(c, http.StatusUnauthorized, "not authenticated")
			}

			claims, err := tokens.Parse(cookie.Value)
			if err != nil {
				return httpx.Error(c, http.StatusUnauthorized, "not authenticated")
			}

			role, err := roles.RoleForUser(c.Request().Context(), claims.UserID)
			if err != nil {
				// A failed lookup resolves to the lowest authenticated role, not
				// the highest and not an error: a database hiccup must never be a
				// route into an admin capability. It is logged because the same
				// fallback would otherwise hide a broken query by quietly
				// downgrading every administrator.
				log.Printf("auth: role lookup failed for user %s, continuing as %s: %v", claims.UserID, rbac.RoleUser, err)
				role = rbac.RoleUser
			}

			c.Set(ContextUserIDKey, claims.UserID)
			c.Set(ContextRoleKey, role)
			return next(c)
		}
	}
}
