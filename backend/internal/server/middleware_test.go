package server

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"

	"void2empire/internal/auth"
	"void2empire/internal/config"
	"void2empire/internal/rbac"
)

// newCapabilityEcho builds an Echo whose /guard route is wrapped by
// RequireCapability, with an upstream middleware that injects the given role
// (skipped when inject is false, simulating an unresolved caller).
func newCapabilityEcho(cfg config.Config, cap rbac.Capability, role rbac.Role, inject bool) *echo.Echo {
	e := echo.New()
	e.HTTPErrorHandler = newErrorHandler()
	e.GET("/guard", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	}, func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if inject {
				c.Set(auth.ContextRoleKey, role)
			}
			return next(c)
		}
	}, RequireCapability(cfg, cap))
	return e
}

func doRequest(e *echo.Echo) int {
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/guard", nil))
	return rec.Code
}

func TestRequireCapability(t *testing.T) {
	cases := []struct {
		name       string
		cap        rbac.Capability
		role       rbac.Role
		inject     bool
		wantStatus int
	}{
		{"finance op may approve", rbac.CapWithdrawalApprove, rbac.RoleFinanceOp, true, http.StatusOK},
		{"ordinary user may not approve", rbac.CapWithdrawalApprove, rbac.RoleUser, true, http.StatusForbidden},
		{"guest may not approve", rbac.CapWithdrawalApprove, rbac.RoleGuest, true, http.StatusForbidden},
		{"unresolved role is treated as guest", rbac.CapWithdrawalApprove, rbac.RoleAdmin, false, http.StatusForbidden},
		{"unknown role denies", rbac.CapWithdrawalApprove, rbac.Role("platform_owner"), true, http.StatusForbidden},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := doRequest(newCapabilityEcho(config.Config{}, tc.cap, tc.role, tc.inject)); got != tc.wantStatus {
				t.Errorf("status = %d, want %d", got, tc.wantStatus)
			}
		})
	}
}

// TestRealTradingKillSwitch pins Rule #42: the feature gate outranks the matrix,
// so even a role the matrix grants CapRealTrading is denied while
// FEATURE_REAL_TRADING_ENABLED is unset or false.
func TestRealTradingKillSwitch(t *testing.T) {
	cases := []struct {
		name       string
		enabled    bool
		role       rbac.Role
		wantStatus int
	}{
		{"off denies trader", false, rbac.RoleTrader, http.StatusForbidden},
		{"off denies admin", false, rbac.RoleAdmin, http.StatusForbidden},
		{"off denies super admin", false, rbac.RoleSuperAdmin, http.StatusForbidden},
		{"on allows trader", true, rbac.RoleTrader, http.StatusOK},
		{"on still denies user", true, rbac.RoleUser, http.StatusForbidden},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			cfg := config.Config{FeatureRealTradingEnabled: tc.enabled}
			got := doRequest(newCapabilityEcho(cfg, rbac.CapRealTrading, tc.role, true))
			if got != tc.wantStatus {
				t.Errorf("status = %d, want %d", got, tc.wantStatus)
			}
		})
	}
}
