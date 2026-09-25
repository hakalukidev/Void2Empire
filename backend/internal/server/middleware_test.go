package server

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"

	"void2empire/internal/rbac"
)

// newCapabilityEcho builds an Echo whose /approve route is guarded by
// RequireCapability, with an upstream middleware that injects the given role
// (skipped when inject is false, simulating an unresolved caller).
func newCapabilityEcho(role rbac.Role, inject bool) *echo.Echo {
	e := echo.New()
	e.HTTPErrorHandler = newErrorHandler()
	e.GET("/approve", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	}, func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if inject {
				c.Set(ContextRoleKey, role)
			}
			return next(c)
		}
	}, RequireCapability(rbac.CapWithdrawalApprove))
	return e
}

func doApprove(e *echo.Echo) int {
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/approve", nil))
	return rec.Code
}

func TestRequireCapability(t *testing.T) {
	cases := []struct {
		name       string
		role       rbac.Role
		inject     bool
		wantStatus int
	}{
		{"finance op may approve", rbac.RoleFinanceOp, true, http.StatusOK},
		{"admin may approve", rbac.RoleAdmin, true, http.StatusOK},
		{"user may not approve", rbac.RoleUser, true, http.StatusForbidden},
		{"support may not approve", rbac.RoleSupport, true, http.StatusForbidden},
		{"missing role fails closed as guest", rbac.RoleGuest, false, http.StatusForbidden},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			e := newCapabilityEcho(tc.role, tc.inject)
			if got := doApprove(e); got != tc.wantStatus {
				t.Fatalf("status = %d, want %d", got, tc.wantStatus)
			}
		})
	}
}
