package mail

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestResendSend(t *testing.T) {
	var gotAuth string
	var gotBody map[string]any
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotAuth = r.Header.Get("Authorization")
		_ = json.NewDecoder(r.Body).Decode(&gotBody)
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"id":"email_1"}`))
	}))
	defer srv.Close()
	defer func(old string) { resendEndpoint = old }(resendEndpoint)
	resendEndpoint = srv.URL

	err := NewResend("re_key", "App <no-reply@example.com>").Send(context.Background(), Message{
		To: "user@example.com", Subject: "Hi", HTML: "<p>Hi</p>", Text: "Hi",
	})
	if err != nil {
		t.Fatalf("Send: %v", err)
	}
	if gotAuth != "Bearer re_key" {
		t.Errorf("Authorization = %q", gotAuth)
	}
	if gotBody["from"] != "App <no-reply@example.com>" || gotBody["subject"] != "Hi" {
		t.Errorf("body = %v", gotBody)
	}
	if to, _ := gotBody["to"].([]any); len(to) != 1 || to[0] != "user@example.com" {
		t.Errorf("to = %v", gotBody["to"])
	}
}

func TestResendSendReportsProviderError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusForbidden)
		_, _ = w.Write([]byte(`{"message":"domain is not verified"}`))
	}))
	defer srv.Close()
	defer func(old string) { resendEndpoint = old }(resendEndpoint)
	resendEndpoint = srv.URL

	err := NewResend("re_secret_key", "a@b.c").Send(context.Background(), Message{To: "x@y.z"})
	if err == nil || !strings.Contains(err.Error(), "403") || !strings.Contains(err.Error(), "domain is not verified") {
		t.Fatalf("err = %v, want the status and provider message", err)
	}
	if strings.Contains(err.Error(), "re_secret_key") {
		t.Errorf("error leaks the API key: %v", err)
	}
}
