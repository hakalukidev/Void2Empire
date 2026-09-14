package server

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"void2empire/internal/auth"
	"void2empire/internal/config"
)

func New(cfg config.Config, pool *pgxpool.Pool) *echo.Echo {
	e := echo.New()
	e.HideBanner = true
	e.Validator = NewRequestValidator()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowCredentials: true,
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete},
	}))

	api := e.Group("/api")

	api.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	tokens := auth.NewTokenManager(cfg.JWTSecret, cfg.JWTExpiry)
	authRepo := auth.NewRepository(pool)
	authService := auth.NewService(authRepo, tokens)
	authHandler := auth.NewHandler(authService, auth.CookieOptions{
		Name:   cfg.CookieName,
		Domain: cfg.CookieDomain,
		Secure: cfg.CookieSecure,
	})

	authGroup := api.Group("/auth")
	authGroup.POST("/register", authHandler.Register)
	authGroup.POST("/login", authHandler.Login)
	authGroup.POST("/logout", authHandler.Logout)
	authGroup.GET("/me", authHandler.Me, auth.RequireAuth(tokens, cfg.CookieName))

	return e
}
