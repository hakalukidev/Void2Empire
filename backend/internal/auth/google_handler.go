package auth

import (
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

// The flow cookie carries state, PKCE verifier and post-login path from the
// redirect to the callback. It is scoped to the Google routes and lives ten
// minutes: long enough to pick an account, too short to be worth stealing.
const (
	googleFlowCookie = "google_oauth"
	googleFlowPath   = "/api/auth/google"
	googleFlowMaxAge = 600
)

// GoogleOptions wires Sign in with Google into the handler. A nil Client
// means the feature is off.
type GoogleOptions struct {
	Client *GoogleClient
	// FrontendURL is where the browser lands afterwards, e.g. http://localhost:3000.
	FrontendURL string
}

// GoogleStart sends the browser to Google. ?next= is the page to return to
// after sign-in, honored only as a same-site path.
func (h *Handler) GoogleStart(c echo.Context) error {
	if h.google.Client == nil {
		return h.googleFail(c, "google_unavailable")
	}

	state, err := randomToken(32)
	if err != nil {
		return h.googleFail(c, "google_failed")
	}
	verifier, err := randomToken(48)
	if err != nil {
		return h.googleFail(c, "google_failed")
	}
	next := base64.RawURLEncoding.EncodeToString([]byte(safeNext(c.QueryParam("next"))))

	h.setGoogleFlowCookie(c, state+"."+verifier+"."+next, googleFlowMaxAge)
	return c.Redirect(http.StatusFound, h.google.Client.AuthURL(state, verifier))
}

// GoogleCallback is where Google sends the browser back with a code.
func (h *Handler) GoogleCallback(c echo.Context) error {
	if h.google.Client == nil {
		return h.googleFail(c, "google_unavailable")
	}

	flow, err := c.Cookie(googleFlowCookie)
	// The flow cookie is single-use whatever happens next.
	h.setGoogleFlowCookie(c, "", -1)
	if err != nil {
		return h.googleFail(c, "google_failed")
	}
	parts := strings.Split(flow.Value, ".")
	if len(parts) != 3 {
		return h.googleFail(c, "google_failed")
	}
	state, verifier := parts[0], parts[1]
	nextBytes, _ := base64.RawURLEncoding.DecodeString(parts[2])

	if c.QueryParam("error") != "" {
		// The person closed or declined Google's consent screen.
		return h.googleFail(c, "google_cancelled")
	}
	if subtle.ConstantTimeCompare([]byte(c.QueryParam("state")), []byte(state)) != 1 {
		return h.googleFail(c, "google_failed")
	}

	ctx := c.Request().Context()
	profile, err := h.google.Client.Exchange(ctx, c.QueryParam("code"), verifier)
	if err != nil {
		log.Printf("auth: google token exchange: %v", err)
		return h.googleFail(c, "google_failed")
	}

	_, token, expiresAt, err := h.service.LoginWithGoogle(ctx, profile, clientInfo(c))
	if err != nil {
		switch {
		case errors.Is(err, ErrGoogleEmailUnverified):
			return h.googleFail(c, "google_unverified")
		case errors.Is(err, ErrGoogleAccountConflict):
			return h.googleFail(c, "google_conflict")
		default:
			log.Printf("auth: google sign-in: %v", err)
			return h.googleFail(c, "google_failed")
		}
	}

	h.setAuthCookie(c, token, expiresAt)
	return c.Redirect(http.StatusFound, h.google.FrontendURL+safeNext(string(nextBytes)))
}

// googleFail sends the browser back to the login page with a reason the
// frontend turns into a message.
func (h *Handler) googleFail(c echo.Context, reason string) error {
	return c.Redirect(http.StatusFound, h.google.FrontendURL+"/login?error="+reason)
}

func (h *Handler) setGoogleFlowCookie(c echo.Context, value string, maxAge int) {
	c.SetCookie(&http.Cookie{
		Name:     googleFlowCookie,
		Value:    value,
		Path:     googleFlowPath,
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   h.cookie.Secure,
		// Lax, not Strict: the callback is a cross-site navigation from Google,
		// and Strict would withhold the cookie from it.
		SameSite: http.SameSiteLaxMode,
	})
}

// safeNext keeps the post-login redirect on this site, mirroring the
// frontend's safeNextPath: a single leading slash, never "//" or "/\", which
// browsers read as another host.
func safeNext(next string) string {
	if !strings.HasPrefix(next, "/") || strings.HasPrefix(next, "//") || strings.HasPrefix(next, "/\\") {
		return "/dashboard"
	}
	return next
}
