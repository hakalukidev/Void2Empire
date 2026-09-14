package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Env            string
	Port           string
	DatabaseURL    string
	JWTSecret      string
	JWTExpiry      time.Duration
	CookieName     string
	CookieDomain   string
	CookieSecure   bool
	AllowedOrigins []string
}

func Load() Config {
	_ = godotenv.Load()

	return Config{
		Env:            getEnv("APP_ENV", "development"),
		Port:           getEnv("PORT", "8080"),
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://binarytrade:binarytrade_dev@localhost:5432/binarytrade?sslmode=disable"),
		JWTSecret:      getEnv("JWT_SECRET", "dev-secret-change-me"),
		JWTExpiry:      7 * 24 * time.Hour,
		CookieName:     "access_token",
		CookieDomain:   getEnv("COOKIE_DOMAIN", ""),
		CookieSecure:   getEnv("APP_ENV", "development") == "production",
		AllowedOrigins: []string{getEnv("FRONTEND_ORIGIN", "http://localhost:3000")},
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
