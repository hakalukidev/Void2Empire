package server

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"

	"void2empire/internal/config"
	"void2empire/internal/httpx"
)

// testSecret is only long enough to satisfy the shape check; nothing here signs
// or verifies a token with it.
const testSecret = "test-only-signing-key-00000000000000000000000000"

var testRouter = echo.New()

// unreachablePool builds a pool without connecting. pgxpool is lazy, so New
// succeeds and the first query — the health ping — is what fails, which is the
// exact situation the health check has to report honestly.
func unreachablePool(t *testing.T) *pgxpool.Pool {
	t.Helper()

	pool, err := pgxpool.New(t.Context(), "postgres://void2empire:void2empire@127.0.0.1:1/void2empire?sslmode=disable&connect_timeout=1")
	if err != nil {
		t.Fatalf("build pool: %v", err)
	}
	t.Cleanup(pool.Close)
	return pool
}

func serve(e *echo.Echo, method, path string) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, httptest.NewRequest(method, path, nil))
	return rec
}

func TestNewRejectsWeakJWTSecret(t *testing.T) {
	cases := []struct {
		name   string
		secret string
	}{
		{name: "empty", secret: ""},
		{name: "short", secret: "dev-secret-change-me"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			cfg := config.Config{JWTSecret: tc.secret, JWTExpiry: time.Hour}
			if _, err := New(cfg, unreachablePool(t)); err == nil {
				t.Fatal("want New to refuse to build a server that cannot sign tokens safely")
			}
		})
	}
}

func TestNewAcceptsValidConfig(t *testing.T) {
	e, err := New(config.Config{JWTSecret: testSecret, JWTExpiry: time.Hour}, unreachablePool(t))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// The routes the frontend calls must actually exist, or a passing unit test
	// would say nothing about what the API serves.
	for _, route := range []struct{ method, path string }{
		{http.MethodGet, "/api/health"},
		{http.MethodPost, "/api/auth/register"},
		{http.MethodPost, "/api/auth/login"},
		{http.MethodPost, "/api/auth/logout"},
		{http.MethodGet, "/api/auth/me"},
	} {
		if code := serve(e, route.method, route.path).Code; code == http.StatusNotFound {
			t.Errorf("%s %s is not routed", route.method, route.path)
		}
	}
}

// TestHealthDown covers the outcome that made the deploy gate meaningless: a
// process that is up while its database is not.
func TestHealthDown(t *testing.T) {
	e, err := New(config.Config{JWTSecret: testSecret, JWTExpiry: time.Hour}, unreachablePool(t))
	if err != nil {
		t.Fatalf("build server: %v", err)
	}

	rec := serve(e, http.MethodGet, "/api/health")

	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusServiceUnavailable)
	}

	var body struct {
		Status string `json:"status"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("body is not JSON: %s", rec.Body)
	}
	if body.Status != "unavailable" {
		t.Errorf("status = %q, want unavailable", body.Status)
	}
}

type stubPinger struct{ err error }

func (s stubPinger) Ping(context.Context) error { return s.err }

func callHealth(db dbPinger) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	_ = healthHandler(db)(testRouter.NewContext(req, rec))
	return rec
}

// TestHealthUpPinsDeployContract pins the exact bytes .github/workflows/deploy.yml
// compares against curl's output: one key, no version or latency field, since
// adding one would make every deploy fail against a healthy stack. Echo's JSON
// encoder appends a newline that the workflow's command substitution strips.
func TestHealthUpPinsDeployContract(t *testing.T) {
	rec := callHealth(stubPinger{})

	if rec.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusOK)
	}
	if got := strings.TrimSuffix(rec.Body.String(), "\n"); got != `{"status":"ok"}` {
		t.Errorf("body = %s, want exactly {\"status\":\"ok\"}", got)
	}
}

// TestHealthDownDetailStaysServerSide checks the 503 body carries no error text:
// the route is public and polled by Caddy, so the database's own message has to
// stay in the log (Rule #7).
func TestHealthDownDetailStaysServerSide(t *testing.T) {
	rec := callHealth(stubPinger{err: errors.New("dial tcp 10.0.3.7:5432: connect: connection refused")})

	if rec.Code != http.StatusServiceUnavailable {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusServiceUnavailable)
	}
	if strings.Contains(rec.Body.String(), "5432") {
		t.Errorf("body leaked the connection detail: %s", rec.Body)
	}
}

// TestCredentialRateLimiterDeniesAfterBurst guards the wiring itself: the
// limiter is a route middleware, and moving it off the credential routes would
// otherwise go unnoticed.
func TestCredentialRateLimiterDeniesAfterBurst(t *testing.T) {
	e := echo.New()
	e.HTTPErrorHandler = newErrorHandler()
	e.POST("/api/auth/login", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	}, credentialRateLimiter())

	// credentialBurst requests plus one: the loop runs in microseconds, so the
	// last has no time to wait for a refill and must be the one denied.
	var rec *httptest.ResponseRecorder
	for i := 0; i <= credentialBurst; i++ {
		rec = serve(e, http.MethodPost, "/api/auth/login")
	}

	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("after the burst: status = %d, want 429 (body %s)", rec.Code, rec.Body)
	}

	var body httpx.ErrorBody
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("denial body is not JSON: %s", rec.Body)
	}
	if body.Code != "RATE_LIMITED" {
		t.Errorf("code = %q, want RATE_LIMITED", body.Code)
	}
}

// TestLogoutIsNotRateLimited keeps the budget off the routes a page load or a
// plain navigation hits, where a per-IP limit would lock out everyone behind a
// shared NAT.
func TestLogoutIsNotRateLimited(t *testing.T) {
	e, err := New(config.Config{JWTSecret: testSecret, JWTExpiry: time.Hour}, unreachablePool(t))
	if err != nil {
		t.Fatalf("build server: %v", err)
	}

	var rec *httptest.ResponseRecorder
	for i := 0; i < credentialBurst*2; i++ {
		rec = serve(e, http.MethodPost, "/api/auth/logout")
	}
	if rec.Code == http.StatusTooManyRequests {
		t.Error("/api/auth/logout is rate limited; only the credential routes should be")
	}
}

func TestNewMailer(t *testing.T) {
	cases := []struct {
		name string
		cfg  config.Config
		want string
	}{
		{name: "key set", cfg: config.Config{Env: "production", ResendAPIKey: "re_x"}, want: "*mail.Resend"},
		{name: "production without key sends nothing", cfg: config.Config{Env: "production"}, want: "mail.Disabled"},
		{name: "development without key logs", cfg: config.Config{Env: "development"}, want: "mail.Log"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := fmt.Sprintf("%T", newMailer(tc.cfg)); got != tc.want {
				t.Errorf("newMailer() = %s, want %s", got, tc.want)
			}
		})
	}
}
