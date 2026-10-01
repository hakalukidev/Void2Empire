package server

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"

	"void2empire/internal/auth"
	"void2empire/internal/config"
	"void2empire/internal/httpx"
)

// healthTimeout bounds the database ping inside the health handler. Caddy and
// the deploy workflow both poll this route; a hung connection must make it slow
// and healthy-looking, not slow and unreachable.
const healthTimeout = 2 * time.Second

// credentialBurst is how many sign-in/register attempts one address may make in
// a single instant before the sustained limit takes over. It is generous on
// purpose: a person retyping a password, a shared office or campus NAT, and a
// mobile client retrying after a timeout all spend part of it, while a scripted
// credential-stuffing run exhausts it in the first second.
const credentialBurst = 10

// dbPinger is the part of the pool the health check uses, named so the two
// outcomes can be tested without a live database.
type dbPinger interface {
	Ping(ctx context.Context) error
}

// healthHandler reports healthy only when PostgreSQL answers. Before this the
// route returned a constant, so the deploy workflow's gate proved the process had
// started and nothing more.
//
// The body keeps its exact single-key form because .github/workflows/deploy.yml
// byte-compares it against {"status":"ok"}.
func healthHandler(db dbPinger) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx, cancel := context.WithTimeout(c.Request().Context(), healthTimeout)
		defer cancel()

		if err := db.Ping(ctx); err != nil {
			// Logged, not returned: the detail is an internal address and error,
			// and Rule #7 keeps it out of a publicly polled response body.
			log.Printf("health: database unreachable: %v", err)
			return c.JSON(http.StatusServiceUnavailable, map[string]string{"status": "unavailable"})
		}
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	}
}

func New(cfg config.Config, pool *pgxpool.Pool) (*echo.Echo, error) {
	if err := cfg.ValidateAuthSecret(); err != nil {
		return nil, err
	}

	e := echo.New()
	e.HideBanner = true
	e.Validator = NewRequestValidator()
	e.HTTPErrorHandler = newErrorHandler()
	e.IPExtractor = ipExtractor(cfg)

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowCredentials: true,
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete},
	}))

	api := e.Group("/api")
	api.GET("/health", healthHandler(pool))

	tokens := auth.NewTokenManager(cfg.JWTSecret, cfg.JWTExpiry)
	authRepo := auth.NewRepository(pool)
	authService := auth.NewService(authRepo, tokens)
	authHandler := auth.NewHandler(authService, auth.CookieOptions{
		Name:   cfg.CookieName,
		Domain: cfg.CookieDomain,
		Secure: cfg.CookieSecure,
	})

	// Only the credential endpoints are limited. /me runs on every page load and
	// /logout is a plain navigation away, so a per-IP budget there would lock
	// out everyone behind a shared NAT or corporate proxy long before it slowed
	// down an attacker.
	credentialLimiter := credentialRateLimiter()

	authGroup := api.Group("/auth")
	authGroup.POST("/register", authHandler.Register, credentialLimiter)
	authGroup.POST("/login", authHandler.Login, credentialLimiter)
	authGroup.POST("/logout", authHandler.Logout)
	authGroup.GET("/me", authHandler.Me, auth.RequireAuth(tokens, cfg.CookieName, authRepo))

	return e, nil
}

// ipExtractor trusts X-Forwarded-For only from peers we believe. In production
// the only peer is Caddy on the compose network, so the private ranges must be
// trusted or every client shares the proxy's IP and rate limiting becomes a
// single global bucket. TRUSTED_PROXY_CIDRS adds explicit ranges (a CDN, a
// second load balancer) without opening the header to the internet.
func ipExtractor(cfg config.Config) echo.IPExtractor {
	options := []echo.TrustOption{echo.TrustLoopback(true), echo.TrustPrivateNet(true)}
	for _, cidr := range cfg.TrustedProxyCIDRs {
		options = append(options, echo.TrustIPRange(cidr))
	}
	return echo.ExtractIPFromXFFHeader(options...)
}

// credentialRateLimiter allows one credential attempt per two seconds per IP
// once credentialBurst is spent, and forgets idle IPs after five minutes so the
// in-memory store cannot grow without bound.
//
// This is a flood brake, not the account-lockout policy, whose rules Sec 8 leaves
// to the auth design (Rule #3).
func credentialRateLimiter() echo.MiddlewareFunc {
	return middleware.RateLimiterWithConfig(middleware.RateLimiterConfig{
		Skipper: middleware.DefaultSkipper,
		Store: middleware.NewRateLimiterMemoryStoreWithConfig(middleware.RateLimiterMemoryStoreConfig{
			Rate:      rate.Limit(0.5),
			Burst:     credentialBurst,
			ExpiresIn: 5 * time.Minute,
		}),
		DenyHandler: func(c echo.Context, _ string, _ error) error {
			return httpx.ErrorWithCode(c, http.StatusTooManyRequests, "RATE_LIMITED",
				"too many attempts from this address; wait a minute and try again")
		},
	})
}
