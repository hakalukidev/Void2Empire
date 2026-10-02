package config

import (
	"strings"
	"testing"
)

func TestValidateAuthSecret(t *testing.T) {
	cases := []struct {
		name    string
		secret  string
		wantErr string
	}{
		{name: "missing", secret: "", wantErr: "JWT_SECRET is not set"},
		{name: "too short", secret: strings.Repeat("a", minJWTSecretBytes-1), wantErr: "must be at least 32 bytes, got 31"},
		{name: "exact length", secret: strings.Repeat("a", minJWTSecretBytes)},
		{name: "longer", secret: strings.Repeat("a", 64)},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			err := Config{JWTSecret: tc.secret}.ValidateAuthSecret()
			if tc.wantErr == "" {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
				return
			}
			if err == nil {
				t.Fatalf("want error containing %q, got nil", tc.wantErr)
			}
			if !strings.Contains(err.Error(), tc.wantErr) {
				t.Errorf("error = %v, want it to contain %q", err, tc.wantErr)
			}
			// Rule #7: the message must diagnose without disclosing the key.
			if tc.secret != "" && strings.Contains(err.Error(), tc.secret) {
				t.Errorf("error leaks the secret value: %v", err)
			}
		})
	}
}

// TestLoadRealTradingKillSwitch pins Rule #42: real trading is off unless an
// environment says otherwise, and an unusable value stops the boot rather than
// being read as "false" by accident.
func TestLoadRealTradingKillSwitch(t *testing.T) {
	t.Setenv("JWT_SECRET", strings.Repeat("a", minJWTSecretBytes))

	cases := []struct {
		name    string
		set     bool
		value   string
		want    bool
		wantErr bool
	}{
		{name: "unset defaults off", want: false},
		{name: "empty defaults off", set: true, value: "", want: false},
		{name: "false", set: true, value: "false", want: false},
		{name: "true", set: true, value: "true", want: true},
		{name: "typo fails the boot", set: true, value: "ture", wantErr: true},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			t.Setenv("FEATURE_REAL_TRADING_ENABLED", "")
			if tc.set {
				t.Setenv("FEATURE_REAL_TRADING_ENABLED", tc.value)
			}

			cfg, err := Load()
			if tc.wantErr {
				if err == nil {
					t.Fatal("want error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if cfg.FeatureRealTradingEnabled != tc.want {
				t.Errorf("FeatureRealTradingEnabled = %v, want %v", cfg.FeatureRealTradingEnabled, tc.want)
			}
		})
	}
}

func TestLoadTrustedProxyCIDRs(t *testing.T) {
	t.Setenv("JWT_SECRET", strings.Repeat("a", minJWTSecretBytes))

	t.Run("blank means none", func(t *testing.T) {
		t.Setenv("TRUSTED_PROXY_CIDRS", "")
		cfg, err := Load()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(cfg.TrustedProxyCIDRs) != 0 {
			t.Errorf("got %d CIDRs, want 0", len(cfg.TrustedProxyCIDRs))
		}
	})

	t.Run("list parses", func(t *testing.T) {
		t.Setenv("TRUSTED_PROXY_CIDRS", "10.0.0.0/8, 192.168.1.0/24")
		cfg, err := Load()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(cfg.TrustedProxyCIDRs) != 2 {
			t.Fatalf("got %d CIDRs, want 2", len(cfg.TrustedProxyCIDRs))
		}
		if got := cfg.TrustedProxyCIDRs[0].String(); got != "10.0.0.0/8" {
			t.Errorf("first CIDR = %s, want 10.0.0.0/8", got)
		}
	})

	// A silently dropped entry would narrow the set of proxies believed, turning
	// every real client into the proxy's IP for rate limiting. Fail the boot.
	t.Run("malformed fails the boot", func(t *testing.T) {
		t.Setenv("TRUSTED_PROXY_CIDRS", "10.0.0.1")
		if _, err := Load(); err == nil {
			t.Fatal("want error for bare address, got nil")
		}
	})
}

// TestLoadHasNoJWTDefault guards the regression that let the API sign session
// tokens with a value present in the public repository.
func TestLoadHasNoJWTDefault(t *testing.T) {
	t.Setenv("JWT_SECRET", "")
	cfg, err := Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.JWTSecret != "" {
		t.Errorf("JWT_SECRET defaulted to %q, want empty so ValidateAuthSecret can reject it", cfg.JWTSecret)
	}
	if err := cfg.ValidateAuthSecret(); err == nil {
		t.Error("want ValidateAuthSecret to reject the default environment, got nil")
	}
}

func TestValidateMail(t *testing.T) {
	cases := []struct {
		name    string
		cfg     Config
		wantErr bool
	}{
		{name: "development without key logs mail", cfg: Config{Env: "development"}},
		{name: "production with key", cfg: Config{Env: "production", ResendAPIKey: "re_test"}},
		{name: "production without key", cfg: Config{Env: "production"}, wantErr: true},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if err := tc.cfg.ValidateMail(); (err != nil) != tc.wantErr {
				t.Fatalf("ValidateMail() error = %v, wantErr %v", err, tc.wantErr)
			}
		})
	}
}
