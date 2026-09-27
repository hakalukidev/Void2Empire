package audit

import (
	"strings"
	"testing"
	"time"
)

func TestRedactSecretsAndPII(t *testing.T) {
	in := map[string]any{
		"password":     "hunter2",
		"PasswordHash": "$2a$10$abc",
		"access_token": "jwt.value.here",
		"otp_code":     "123456",
		"email":        "alice@example.com",
		"phone":        "+15551234567",
		"full_name":    "Alice",
		"amount":       "10.5",
		"nested": map[string]any{
			"api_key": "secret-value",
			"safe":    "ok",
		},
	}
	// Snapshot to assert non-mutation.
	origPassword := in["password"]

	out := Redact(in)

	if out["password"] != redactedValue {
		t.Errorf("password should be redacted, got %v", out["password"])
	}
	if out["PasswordHash"] != redactedValue {
		t.Errorf("PasswordHash should be redacted (case-insensitive), got %v", out["PasswordHash"])
	}
	if out["access_token"] != redactedValue {
		t.Errorf("access_token should be redacted, got %v", out["access_token"])
	}
	if out["otp_code"] != redactedValue {
		t.Errorf("otp_code should be redacted, got %v", out["otp_code"])
	}

	email, _ := out["email"].(string)
	if strings.Contains(email, "alice@") || !strings.HasSuffix(email, "@example.com") {
		t.Errorf("email should be masked but keep domain, got %v", out["email"])
	}
	phone, _ := out["phone"].(string)
	if strings.Contains(phone, "5551234567") {
		t.Errorf("phone should be masked, got %v", out["phone"])
	}

	// Non-sensitive values preserved.
	if out["full_name"] != "Alice" || out["amount"] != "10.5" {
		t.Errorf("non-sensitive fields must be preserved: %v", out)
	}

	// Nested redaction.
	nested, _ := out["nested"].(map[string]any)
	if nested == nil || nested["api_key"] != redactedValue || nested["safe"] != "ok" {
		t.Errorf("nested map not redacted correctly: %v", out["nested"])
	}

	// Input must not be mutated.
	if in["password"] != origPassword {
		t.Errorf("Redact mutated its input")
	}

	if Redact(nil) != nil {
		t.Errorf("Redact(nil) should be nil")
	}
}

func fixedEvent() Event {
	return Event{
		ID:         "11111111-1111-1111-1111-111111111111",
		OccurredAt: time.Date(2026, 9, 25, 12, 0, 0, 0, time.UTC),
		ActorType:  ActorAdmin,
		ActorID:    "admin-1",
		Action:     ActionWithdrawalApprove,
		TargetType: "withdrawal",
		TargetID:   "w-1",
		Reason:     "verified proof",
		Result:     ResultSuccess,
	}
}

func TestComputeHashDeterministic(t *testing.T) {
	e := fixedEvent()
	h1 := e.ComputeHash("prev")
	h2 := e.ComputeHash("prev")
	if h1 != h2 {
		t.Errorf("hash must be deterministic: %s != %s", h1, h2)
	}
	if len(h1) != 64 {
		t.Errorf("expected sha256 hex (64 chars), got %d", len(h1))
	}

	// prevHash changes the digest (chain linkage).
	if e.ComputeHash("prev") == e.ComputeHash("other") {
		t.Error("different prevHash must yield different hash")
	}

	// Any field change changes the digest.
	e2 := fixedEvent()
	e2.TargetID = "w-2"
	if e2.ComputeHash("prev") == h1 {
		t.Error("changing a field must change the hash")
	}
}

func TestSealLinksChain(t *testing.T) {
	e := fixedEvent()
	e.Seal("prev-hash")
	if e.HashPrev != "prev-hash" {
		t.Errorf("Seal should record prev hash, got %q", e.HashPrev)
	}
	if e.Hash != e.ComputeHash("prev-hash") {
		t.Error("Seal hash must equal ComputeHash(prev)")
	}
}

func TestNewEventAndWithDiff(t *testing.T) {
	e := NewEvent(ActionLoginSuccess, ActorUser, "u-1")
	if e.ID == "" || e.OccurredAt.IsZero() {
		t.Error("NewEvent must set ID and OccurredAt")
	}
	if e.Result != ResultSuccess {
		t.Errorf("default result should be success, got %q", e.Result)
	}
	if e.OccurredAt.Location() != time.UTC {
		t.Error("OccurredAt must be UTC")
	}

	e = e.WithDiff(
		map[string]any{"password": "x"},
		map[string]any{"status": "active", "email": "a@b.com"},
	).WithTarget("user", "u-1").WithRequestContext("1.2.3.4", "ua", "req-9")

	if e.Before["password"] != redactedValue {
		t.Error("WithDiff must redact before")
	}
	if e.After["status"] != "active" {
		t.Error("WithDiff must keep non-sensitive after")
	}
	if e.TargetType != "user" || e.IP != "1.2.3.4" || e.RequestID != "req-9" {
		t.Error("With* helpers must set context fields")
	}
}
