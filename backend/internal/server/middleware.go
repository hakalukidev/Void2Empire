package server

import (
	"github.com/labstack/echo/v4"

	"void2empire/internal/rbac"
)

// ContextRoleKey is the echo.Context key under which an upstream resolver stores
// the caller's rbac.Role. Setting it is the DB/JWT phase's job (roles live in
// admin_users / token claims); until then it is absent and callers are treated as
// guests, so RequireCapability fails closed.
const ContextRoleKey = "role"

// RequireCapability returns middleware that allows a request only if the caller's
// role has any access to the given capability. The role is read from
// ContextRoleKey; a missing/invalid role defaults to guest (default-deny). A
// denial returns rbac.ErrPermissionDenied, which the central error handler maps to
// 403 PERMISSION_DENIED.
//
// Breadth (own vs read-only vs full) and the per-request business gates documented
// in the rbac package (trading_enabled, KYC DR-018, P2P tier, dual-control DR-041)
// are enforced by the service layer, not here.
func RequireCapability(cap rbac.Capability) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			role := rbac.RoleGuest
			if v, ok := c.Get(ContextRoleKey).(rbac.Role); ok {
				role = v
			}
			if !rbac.Can(role, cap) {
				return rbac.ErrPermissionDenied
			}
			return next(c)
		}
	}
}
