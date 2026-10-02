package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// Sign in with Google, using the OAuth 2.0 authorization code flow with PKCE
// (https://developers.google.com/identity/openid-connect/openid-connect).

// Endpoints are variables so tests can point the client at a fake server.
var (
	googleAuthURL  = "https://accounts.google.com/o/oauth2/v2/auth"
	googleTokenURL = "https://oauth2.googleapis.com/token"
)

var ErrGoogleToken = errors.New("google sign-in failed")

type GoogleClient struct {
	clientID     string
	clientSecret string
	redirectURL  string
	http         *http.Client
}

func NewGoogleClient(clientID, clientSecret, redirectURL string) *GoogleClient {
	return &GoogleClient{
		clientID:     clientID,
		clientSecret: clientSecret,
		redirectURL:  redirectURL,
		http:         &http.Client{Timeout: 10 * time.Second},
	}
}

// GoogleProfile is what sign-in needs from the ID token.
type GoogleProfile struct {
	Subject       string
	Email         string
	EmailVerified bool
	Name          string
}

// randomToken returns n random bytes, URL-safe encoded. It serves as both the
// state value and the PKCE verifier.
func randomToken(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func pkceChallenge(verifier string) string {
	sum := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

// AuthURL is where the browser goes to pick a Google account.
func (g *GoogleClient) AuthURL(state, verifier string) string {
	q := url.Values{
		"client_id":             {g.clientID},
		"redirect_uri":          {g.redirectURL},
		"response_type":         {"code"},
		"scope":                 {"openid email profile"},
		"state":                 {state},
		"code_challenge":        {pkceChallenge(verifier)},
		"code_challenge_method": {"S256"},
		"prompt":                {"select_account"},
	}
	return googleAuthURL + "?" + q.Encode()
}

// Exchange trades the authorization code for an ID token and reads the
// profile out of it.
//
// The token's signature is not checked against Google's keys. It comes straight
// from Google's token endpoint over TLS, in exchange for a code only this
// client's secret and PKCE verifier can redeem, and OpenID Connect Core
// (3.1.3.7, rule 6) allows TLS server validation to stand in for the signature
// in exactly that case. Issuer, audience and expiry are still checked.
func (g *GoogleClient) Exchange(ctx context.Context, code, verifier string) (*GoogleProfile, error) {
	form := url.Values{
		"code":          {code},
		"client_id":     {g.clientID},
		"client_secret": {g.clientSecret},
		"redirect_uri":  {g.redirectURL},
		"grant_type":    {"authorization_code"},
		"code_verifier": {verifier},
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, googleTokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := g.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%w: token request: %v", ErrGoogleToken, err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 64<<10))
	if resp.StatusCode != http.StatusOK {
		// Google's error body is a code and description, never the secret.
		return nil, fmt.Errorf("%w: token endpoint responded %d: %s", ErrGoogleToken, resp.StatusCode, strings.TrimSpace(string(body)))
	}

	var tokens struct {
		IDToken string `json:"id_token"`
	}
	if err := json.Unmarshal(body, &tokens); err != nil || tokens.IDToken == "" {
		return nil, fmt.Errorf("%w: no id_token in response", ErrGoogleToken)
	}
	return g.profileFromIDToken(tokens.IDToken, time.Now())
}

func (g *GoogleClient) profileFromIDToken(idToken string, now time.Time) (*GoogleProfile, error) {
	parts := strings.Split(idToken, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("%w: malformed id_token", ErrGoogleToken)
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("%w: undecodable id_token", ErrGoogleToken)
	}

	var claims struct {
		Iss           string `json:"iss"`
		Aud           string `json:"aud"`
		Exp           int64  `json:"exp"`
		Sub           string `json:"sub"`
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		Name          string `json:"name"`
	}
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, fmt.Errorf("%w: unreadable id_token claims", ErrGoogleToken)
	}

	switch {
	case claims.Iss != "https://accounts.google.com" && claims.Iss != "accounts.google.com":
		return nil, fmt.Errorf("%w: unexpected issuer %q", ErrGoogleToken, claims.Iss)
	case claims.Aud != g.clientID:
		return nil, fmt.Errorf("%w: id_token issued to another client", ErrGoogleToken)
	case now.Unix() >= claims.Exp:
		return nil, fmt.Errorf("%w: id_token expired", ErrGoogleToken)
	case claims.Sub == "" || claims.Email == "":
		return nil, fmt.Errorf("%w: id_token lacks sub or email", ErrGoogleToken)
	}

	return &GoogleProfile{
		Subject:       claims.Sub,
		Email:         claims.Email,
		EmailVerified: claims.EmailVerified,
		Name:          claims.Name,
	}, nil
}
