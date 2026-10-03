package auth

import (
	"context"
	"errors"
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

	// ContextSessionIDKey holds the id of the session the request runs under.
	ContextSessionIDKey = "sessionID"
)

// RoleResolver supplies the caller's platform role. *Repository implements it
// from admin_users; the interface exists so the middleware can be tested
// without a database.
type RoleResolver interface {
	RoleForUser(ctx context.Context, userID string) (rbac.Role, error)
}

// SessionStore is what RequireAuth checks a token against. *Repository
// implements it; the interface lets the middleware be tested without a
// database.
type SessionStore interface {
	RoleResolver
	SessionForToken(ctx context.Context, tokenHash string) (*Session, error)
}

// RequireAuth reads the JWT from the auth cookie, validates it, and stores the
// authenticated user's ID and role on the request context.
//
// This is the only authoritative authentication check in the Go service. The
// Next.js middleware in frontend/src/proxy.ts decodes the same cookie without
// verifying its signature, so it is a routing/UX layer and never a substitute
// for this.
func RequireAuth(tokens *TokenManager, cookieName string, store SessionStore) echo.MiddlewareFunc {
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

			// A valid signature is not enough: the session must still be live, so
			// logout and a password change or reset take effect at once.
			session, err := store.SessionForToken(c.Request().Context(), tokenHash(cookie.Value))
			if errors.Is(err, ErrSessionNotFound) {
				return httpx.Error(c, http.StatusUnauthorized, "not authenticated")
			}
			if err != nil {
				// Fail closed: a database error must never let a request through.
				log.Printf("auth: session lookup failed: %v", err)
				return httpx.Error(c, http.StatusServiceUnavailable, "could not check session")
			}
			if session.UserID != claims.UserID {
				return httpx.Error(c, http.StatusUnauthorized, "not authenticated")
			}
			if !session.EmailVerified {
				return httpx.ErrorWithCode(c, http.StatusForbidden, "EMAIL_NOT_VERIFIED", "verify your email to continue")
			}

			role, err := store.RoleForUser(c.Request().Context(), claims.UserID)
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
			c.Set(ContextSessionIDKey, session.ID)
			return next(c)
		}
	}
}
