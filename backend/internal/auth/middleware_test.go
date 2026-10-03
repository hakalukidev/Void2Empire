package auth

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/labstack/echo/v4"

	"void2empire/internal/rbac"
)

const middlewareSecret = "middleware-test-signing-key-0000000000000000"

// stubStore answers role lookups and knows the sessions in live, keyed by
// token hash. A token missing from live is a revoked or never-issued session.
type stubStore struct {
	role       rbac.Role
	err        error
	live       map[string]*Session
	sessionErr error
}

func (s stubStore) RoleForUser(context.Context, string) (rbac.Role, error) {
	return s.role, s.err
}

func (s stubStore) SessionForToken(_ context.Context, hash string) (*Session, error) {
	if s.sessionErr != nil {
		return nil, s.sessionErr
	}
	if session, ok := s.live[hash]; ok {
		return session, nil
	}
	return nil, ErrSessionNotFound
}

func liveSession(token, userID string, verified bool) map[string]*Session {
	return map[string]*Session{tokenHash(token): {ID: "session-1", UserID: userID, EmailVerified: verified}}
}

// TestRequireAuth pins what the middleware puts on the context, because
// server.RequireCapability trusts it absolutely: a role settable from a header or
// a token claim, or a lookup failure that leaves no role at all, would both turn
// the fail-closed default into a hole.
func TestRequireAuth(t *testing.T) {
	tokens := NewTokenManager(middlewareSecret, time.Hour)
	token, _, err := tokens.Generate("user-1")
	if err != nil {
		t.Fatalf("generate token: %v", err)
	}

	cases := []struct {
		name       string
		cookie     string
		store      stubStore
		wantStatus int
		wantUser   any
		wantRole   any
	}{
		{
			name:       "valid cookie resolves the caller's role",
			cookie:     token,
			store:      stubStore{role: rbac.RoleAdmin, live: liveSession(token, "user-1", true)},
			wantStatus: http.StatusOK,
			wantUser:   "user-1",
			wantRole:   rbac.RoleAdmin,
		},
		{
			name:       "failed lookup falls back to ordinary user, not the resolved role",
			cookie:     token,
			store:      stubStore{role: rbac.RoleSuperAdmin, err: errors.New("connection reset"), live: liveSession(token, "user-1", true)},
			wantStatus: http.StatusOK,
			wantUser:   "user-1",
			wantRole:   rbac.RoleUser,
		},
		{
			name:       "revoked or unknown session is rejected despite a valid signature",
			cookie:     token,
			store:      stubStore{role: rbac.RoleAdmin},
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "session of another user is rejected",
			cookie:     token,
			store:      stubStore{role: rbac.RoleAdmin, live: liveSession(token, "user-2", true)},
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "unverified email is refused",
			cookie:     token,
			store:      stubStore{role: rbac.RoleUser, live: liveSession(token, "user-1", false)},
			wantStatus: http.StatusForbidden,
		},
		{
			name:       "failed session lookup fails closed",
			cookie:     token,
			store:      stubStore{role: rbac.RoleUser, sessionErr: errors.New("connection reset")},
			wantStatus: http.StatusServiceUnavailable,
		},
		{
			name:       "no cookie",
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "unsigned token is rejected",
			cookie:     "eyJhbGciOiJub25lIn0.eyJzdWIiOiJ1c2VyLTEifQ.",
			wantStatus: http.StatusUnauthorized,
		},
		{
			name: "token signed with another key is rejected",
			cookie: func() string {
				other := NewTokenManager("a-completely-different-signing-key-0000000000", time.Hour)
				signed, _, err := other.Generate("user-1")
				if err != nil {
					t.Fatalf("generate foreign token: %v", err)
				}
				return signed
			}(),
			wantStatus: http.StatusUnauthorized,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			var gotUser, gotRole any

			e := echo.New()
			e.GET("/protected", func(c echo.Context) error {
				gotUser = c.Get(ContextUserIDKey)
				gotRole = c.Get(ContextRoleKey)
				return c.NoContent(http.StatusOK)
			}, RequireAuth(tokens, "access_token", tc.store))

			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			if tc.cookie != "" {
				req.AddCookie(&http.Cookie{Name: "access_token", Value: tc.cookie})
			}
			rec := httptest.NewRecorder()
			e.ServeHTTP(rec, req)

			if rec.Code != tc.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tc.wantStatus)
			}
			if gotUser != tc.wantUser {
				t.Errorf("userID on context = %v, want %v", gotUser, tc.wantUser)
			}
			if gotRole != tc.wantRole {
				t.Errorf("role on context = %v, want %v", gotRole, tc.wantRole)
			}
		})
	}
}

// TestRequireAuthRejectsExpiredToken keeps the expiry path honest: a cookie the
// client still holds is not proof the session is still alive.
func TestRequireAuthRejectsExpiredToken(t *testing.T) {
	expired := NewTokenManager(middlewareSecret, -time.Minute)
	token, _, err := expired.Generate("user-1")
	if err != nil {
		t.Fatalf("generate token: %v", err)
	}

	e := echo.New()
	e.GET("/protected", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	}, RequireAuth(NewTokenManager(middlewareSecret, time.Hour), "access_token", stubStore{role: rbac.RoleUser, live: liveSession(token, "user-1", true)}))

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.AddCookie(&http.Cookie{Name: "access_token", Value: token})
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want 401 for an expired token", rec.Code)
	}
}
