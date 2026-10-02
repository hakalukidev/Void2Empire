package config

import (
	"fmt"
	"net"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// minJWTSecretBytes is the shortest key HS256 may use (256 bits). It is also
// what rejects the placeholder values this package used to default to: both
// were shorter than 32 bytes, so no separate deny list is needed.
const minJWTSecretBytes = 32

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

	// FeatureRealTradingEnabled is the Rule #42 kill-switch. It is off unless an
	// environment sets FEATURE_REAL_TRADING_ENABLED=true explicitly, and
	// server.RequireCapability denies rbac.CapRealTrading while it is off, so no
	// trading route can reach real money before the client flips it at the
	// go-live gate (REQ-094, Sec 37).
	FeatureRealTradingEnabled bool

	// TrustedProxyCIDRs are extra peer addresses whose X-Forwarded-For header
	// may be believed, on top of the loopback and private ranges that are always
	// trusted. Caddy terminates TLS on the compose network, so the socket peer
	// is a private address and the client IP has to come from the header for
	// per-IP rate limiting to work at all.
	TrustedProxyCIDRs []*net.IPNet

	// ResendAPIKey sends transactional email (verification codes) through
	// Resend. Without it, development prints mail to the log instead, and
	// production refuses to boot (ValidateMail).
	ResendAPIKey string

	// MailFrom is the sender on every outgoing email. Resend only accepts an
	// address on a domain verified in its dashboard; its shared
	// onboarding@resend.dev sender delivers to the account owner's address only.
	MailFrom string
}

// Load reads the environment. It returns an error rather than a silent fallback
// whenever a value is present but unusable: a mistyped kill-switch or a
// malformed CIDR must stop the boot, not quietly widen or narrow an
// authorization boundary.
func Load() (Config, error) {
	_ = godotenv.Load()

	env := getEnv("APP_ENV", "development")

	realTrading, err := parseBool("FEATURE_REAL_TRADING_ENABLED", false)
	if err != nil {
		return Config{}, err
	}

	cidrs, err := parseCIDRs(getEnv("TRUSTED_PROXY_CIDRS", ""))
	if err != nil {
		return Config{}, err
	}

	return Config{
		Env:                       env,
		Port:                      getEnv("PORT", "8080"),
		DatabaseURL:               getEnv("DATABASE_URL", "postgres://void2empire:void2empire_dev@localhost:5432/void2empire?sslmode=disable"),
		JWTSecret:                 getEnv("JWT_SECRET", ""),
		JWTExpiry:                 7 * 24 * time.Hour,
		CookieName:                "access_token",
		CookieDomain:              getEnv("COOKIE_DOMAIN", ""),
		CookieSecure:              env == "production",
		AllowedOrigins:            splitList(getEnv("FRONTEND_ORIGIN", "http://localhost:3000")),
		TrustedProxyCIDRs:         cidrs,
		FeatureRealTradingEnabled: realTrading,
		ResendAPIKey:              getEnv("RESEND_API_KEY", ""),
		MailFrom:                  getEnv("MAIL_FROM", "Void2Empire <onboarding@resend.dev>"),
	}, nil
}

// ValidateAuthSecret rejects a signing key that could not safely mint session
// tokens. Only cmd/api calls it: cmd/migrate and cmd/worker never sign
// anything, so requiring a secret there would be needless friction.
//
// The error names the length, never the value (Rule #7).
func (c Config) ValidateAuthSecret() error {
	if c.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET is not set; generate one with `openssl rand -base64 48`")
	}
	if len(c.JWTSecret) < minJWTSecretBytes {
		return fmt.Errorf("JWT_SECRET must be at least %d bytes, got %d; generate one with `openssl rand -base64 48`", minJWTSecretBytes, len(c.JWTSecret))
	}
	return nil
}

// ValidateMail rejects a production boot that could not deliver verification
// codes. Development may run without a key; mail is logged there instead.
func (c Config) ValidateMail() error {
	if c.Env == "production" && c.ResendAPIKey == "" {
		return fmt.Errorf("RESEND_API_KEY is not set; production cannot send verification codes without it")
	}
	return nil
}

func parseBool(key string, fallback bool) (bool, error) {
	raw := os.Getenv(key)
	if raw == "" {
		return fallback, nil
	}
	v, err := strconv.ParseBool(raw)
	if err != nil {
		return false, fmt.Errorf("%s: %q is not a boolean; %s must be an explicit true to enable real trading (Rule #42)", key, raw, key)
	}
	return v, nil
}

func parseCIDRs(raw string) ([]*net.IPNet, error) {
	var out []*net.IPNet
	for _, item := range splitList(raw) {
		_, network, err := net.ParseCIDR(item)
		if err != nil {
			return nil, fmt.Errorf("TRUSTED_PROXY_CIDRS: %q is not a CIDR range", item)
		}
		out = append(out, network)
	}
	return out, nil
}

func splitList(raw string) []string {
	var out []string
	for _, item := range strings.Split(raw, ",") {
		if trimmed := strings.TrimSpace(item); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
