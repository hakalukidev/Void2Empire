package server

import (
	"github.com/labstack/echo/v4"

	"void2empire/internal/auth"
	"void2empire/internal/config"
	"void2empire/internal/rbac"
)

// RequireCapability returns middleware that allows a request only if the
// caller's role has access to the given capability and the platform's feature
// gates permit it. The role is read from auth.ContextRoleKey, which only
// RequireAuth writes; a missing role means the caller never passed
// authentication and is treated as a guest (default-deny). A denial returns
// rbac.ErrPermissionDenied, which the central error handler maps to
// 403 PERMISSION_DENIED.
//
// Breadth (own vs read-only vs full) and the per-request business gates documented
// in the rbac package (trading_enabled, KYC DR-018, P2P tier, dual-control DR-041)
// are enforced by the service layer, not here.
func RequireCapability(cfg config.Config, cap rbac.Capability) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Rule #42: the kill-switch outranks the matrix. A role the matrix
			// would allow still cannot move real money until an approved
			// environment sets FEATURE_REAL_TRADING_ENABLED=true (REQ-094).
			if cap == rbac.CapRealTrading && !cfg.FeatureRealTradingEnabled {
				return rbac.ErrPermissionDenied
			}

			role := rbac.RoleGuest
			if v, ok := c.Get(auth.ContextRoleKey).(rbac.Role); ok {
				role = v
			}
			if !rbac.Can(role, cap) {
				return rbac.ErrPermissionDenied
			}
			return next(c)
		}
	}
}
