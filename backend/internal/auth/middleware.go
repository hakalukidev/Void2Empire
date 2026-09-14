package auth

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"binarytrade/internal/httpx"
)

const ContextUserIDKey = "userID"

// RequireAuth reads the JWT from the auth cookie, validates it, and stores
// the authenticated user ID on the request context.
func RequireAuth(tokens *TokenManager, cookieName string) echo.MiddlewareFunc {
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

			c.Set(ContextUserIDKey, claims.UserID)
			return next(c)
		}
	}
}
