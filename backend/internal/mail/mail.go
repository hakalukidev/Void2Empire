// Package mail sends transactional email. Callers depend on Sender, so the
// provider behind it (Resend today) can change without touching them.
package mail

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

type Message struct {
	To      string
	Subject string
	HTML    string
	Text    string
}

type Sender interface {
	Send(ctx context.Context, msg Message) error
}

// resendEndpoint is a variable so tests can point the client at a fake server.
var resendEndpoint = "https://api.resend.com/emails"

// sendTimeout bounds one call to the provider. Sends happen inside a request,
// so a slow provider must cost the caller seconds, not the full server timeout.
const sendTimeout = 10 * time.Second

// Resend sends through the Resend HTTP API (https://resend.com/docs/api-reference/emails/send-email).
// It is a plain HTTP call rather than the SDK, which would add a dependency for
// one POST.
type Resend struct {
	apiKey string
	from   string
	client *http.Client
}

func NewResend(apiKey, from string) *Resend {
	return &Resend{apiKey: apiKey, from: from, client: &http.Client{Timeout: sendTimeout}}
}

func (r *Resend) Send(ctx context.Context, msg Message) error {
	body, err := json.Marshal(map[string]any{
		"from":    r.from,
		"to":      []string{msg.To},
		"subject": msg.Subject,
		"html":    msg.HTML,
		"text":    msg.Text,
	})
	if err != nil {
		return fmt.Errorf("encode email: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, resendEndpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("build resend request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+r.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := r.client.Do(req)
	if err != nil {
		return fmt.Errorf("resend request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		// Resend's error body names the problem (unverified domain, bad key) and
		// never echoes the key, so it is safe to surface in the server log.
		detail, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return fmt.Errorf("resend responded %d: %s", resp.StatusCode, bytes.TrimSpace(detail))
	}
	return nil
}

// ErrNotConfigured is what Disabled returns for every message.
var ErrNotConfigured = errors.New("email sending is not configured (RESEND_API_KEY is empty)")

// Disabled drops every message with ErrNotConfigured. Production uses it while
// no provider key is set: callers already treat a failed send as recoverable,
// and unlike Log it never writes a verification code into the server log.
type Disabled struct{}

func (Disabled) Send(context.Context, Message) error { return ErrNotConfigured }

// Log prints messages instead of sending them. It exists so development works
// without a provider account: the OTP shows up in the API's terminal. It must
// never run in production, where the log is not a safe place for a code.
type Log struct{}

func (Log) Send(_ context.Context, msg Message) error {
	log.Printf("mail (development, not sent) to=%s subject=%q\n%s", msg.To, msg.Subject, msg.Text)
	return nil
}
