package auth

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
)

func fakeIDToken(t *testing.T, claims map[string]any) string {
	t.Helper()
	payload, err := json.Marshal(claims)
	if err != nil {
		t.Fatal(err)
	}
	enc := base64.RawURLEncoding.EncodeToString
	return enc([]byte(`{"alg":"RS256"}`)) + "." + enc(payload) + ".sig"
}

func validClaims(now time.Time) map[string]any {
	return map[string]any{
		"iss": "https://accounts.google.com", "aud": "client-id", "exp": now.Add(time.Hour).Unix(),
		"sub": "1234", "email": "user@gmail.com", "email_verified": true, "name": "Test User",
	}
}

func TestProfileFromIDToken(t *testing.T) {
	g := NewGoogleClient("client-id", "secret", "http://localhost/cb")
	now := time.Now()

	p, err := g.profileFromIDToken(fakeIDToken(t, validClaims(now)), now)
	if err != nil {
		t.Fatalf("valid token: %v", err)
	}
	if p.Subject != "1234" || p.Email != "user@gmail.com" || !p.EmailVerified || p.Name != "Test User" {
		t.Errorf("profile = %+v", p)
	}

	cases := map[string]func(map[string]any){
		"other client":  func(c map[string]any) { c["aud"] = "someone-else" },
		"other issuer":  func(c map[string]any) { c["iss"] = "https://evil.example" },
		"expired":       func(c map[string]any) { c["exp"] = now.Add(-time.Minute).Unix() },
		"missing email": func(c map[string]any) { delete(c, "email") },
		"missing sub":   func(c map[string]any) { delete(c, "sub") },
	}
	for name, mutate := range cases {
		t.Run(name, func(t *testing.T) {
			claims := validClaims(now)
			mutate(claims)
			if _, err := g.profileFromIDToken(fakeIDToken(t, claims), now); err == nil {
				t.Fatal("want an error")
			}
		})
	}

	if _, err := g.profileFromIDToken("not-a-jwt", now); err == nil {
		t.Error("malformed token accepted")
	}
}

func TestAuthURLCarriesStateAndPKCE(t *testing.T) {
	g := NewGoogleClient("client-id", "secret", "http://localhost:8081/api/auth/google/callback")
	u, err := url.Parse(g.AuthURL("the-state", "the-verifier"))
	if err != nil {
		t.Fatal(err)
	}
	q := u.Query()
	if q.Get("state") != "the-state" || q.Get("client_id") != "client-id" ||
		q.Get("redirect_uri") != "http://localhost:8081/api/auth/google/callback" {
		t.Errorf("query = %v", q)
	}
	if q.Get("code_challenge_method") != "S256" || q.Get("code_challenge") != pkceChallenge("the-verifier") {
		t.Errorf("PKCE params = %q %q", q.Get("code_challenge_method"), q.Get("code_challenge"))
	}
	if strings.Contains(u.String(), "the-verifier") || strings.Contains(u.String(), "secret") {
		t.Error("verifier or secret leaked into the browser URL")
	}
}

func TestExchange(t *testing.T) {
	var form url.Values
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = r.ParseForm()
		form = r.PostForm
		_ = json.NewEncoder(w).Encode(map[string]string{"id_token": fakeIDToken(t, validClaims(time.Now()))})
	}))
	defer srv.Close()
	defer func(old string) { googleTokenURL = old }(googleTokenURL)
	googleTokenURL = srv.URL

	g := NewGoogleClient("client-id", "secret", "http://localhost/cb")
	p, err := g.Exchange(context.Background(), "the-code", "the-verifier")
	if err != nil {
		t.Fatalf("Exchange: %v", err)
	}
	if p.Email != "user@gmail.com" {
		t.Errorf("profile = %+v", p)
	}
	if form.Get("code") != "the-code" || form.Get("code_verifier") != "the-verifier" ||
		form.Get("client_secret") != "secret" || form.Get("grant_type") != "authorization_code" {
		t.Errorf("token request form = %v", form)
	}
}

func TestExchangeRejectsTokenEndpointError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error":"invalid_grant"}`))
	}))
	defer srv.Close()
	defer func(old string) { googleTokenURL = old }(googleTokenURL)
	googleTokenURL = srv.URL

	_, err := NewGoogleClient("client-id", "secret", "http://localhost/cb").Exchange(context.Background(), "c", "v")
	if err == nil || !strings.Contains(err.Error(), "invalid_grant") {
		t.Fatalf("err = %v", err)
	}
}

func TestSafeNext(t *testing.T) {
	cases := map[string]string{
		"":                  "/dashboard",
		"/wallet":           "/wallet",
		"/trade/spot/BTC":   "/trade/spot/BTC",
		"//evil.example":    "/dashboard",
		"/\\evil.example":   "/dashboard",
		"https://evil.test": "/dashboard",
	}
	for in, want := range cases {
		if got := safeNext(in); got != want {
			t.Errorf("safeNext(%q) = %q, want %q", in, got, want)
		}
	}
}

func newGoogleTestHandler(client *GoogleClient) *Handler {
	return NewHandler(nil, CookieOptions{Name: "access_token"}, GoogleOptions{Client: client, FrontendURL: "http://front"})
}

func TestGoogleStartSetsFlowCookieAndRedirects(t *testing.T) {
	h := newGoogleTestHandler(NewGoogleClient("client-id", "secret", "http://api/cb"))
	rec := httptest.NewRecorder()
	c := echo.New().NewContext(httptest.NewRequest(http.MethodGet, "/api/auth/google?next=/wallet", nil), rec)

	if err := h.GoogleStart(c); err != nil {
		t.Fatal(err)
	}
	if rec.Code != http.StatusFound || !strings.HasPrefix(rec.Header().Get("Location"), googleAuthURL) {
		t.Fatalf("status %d location %q", rec.Code, rec.Header().Get("Location"))
	}
	cookie := rec.Result().Cookies()[0]
	if cookie.Name != googleFlowCookie || !cookie.HttpOnly || cookie.Path != googleFlowPath {
		t.Errorf("flow cookie = %+v", cookie)
	}
	location, _ := url.Parse(rec.Header().Get("Location"))
	if state := location.Query().Get("state"); !strings.HasPrefix(cookie.Value, state+".") {
		t.Error("cookie does not carry the state sent to Google")
	}
}

func TestGoogleCallbackRejects(t *testing.T) {
	client := NewGoogleClient("client-id", "secret", "http://api/cb")
	cases := []struct {
		name    string
		handler *Handler
		query   string
		cookie  string
		want    string
	}{
		{name: "feature off", handler: newGoogleTestHandler(nil), query: "state=s&code=c", cookie: "s.v.", want: "google_unavailable"},
		{name: "no flow cookie", handler: newGoogleTestHandler(client), query: "state=s&code=c", want: "google_failed"},
		{name: "state mismatch", handler: newGoogleTestHandler(client), query: "state=forged&code=c", cookie: "s.v.", want: "google_failed"},
		{name: "user cancelled", handler: newGoogleTestHandler(client), query: "error=access_denied&state=s", cookie: "s.v.", want: "google_cancelled"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/auth/google/callback?"+tc.query, nil)
			if tc.cookie != "" {
				req.AddCookie(&http.Cookie{Name: googleFlowCookie, Value: tc.cookie})
			}
			rec := httptest.NewRecorder()
			if err := tc.handler.GoogleCallback(echo.New().NewContext(req, rec)); err != nil {
				t.Fatal(err)
			}
			if want := "http://front/login?error=" + tc.want; rec.Header().Get("Location") != want {
				t.Errorf("location = %q, want %q", rec.Header().Get("Location"), want)
			}
		})
	}
}
