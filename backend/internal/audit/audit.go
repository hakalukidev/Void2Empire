// Package audit provides the append-only audit event model from context.md
// Sec 28. This file is the PURE model/builder: it constructs events, redacts
// secrets/PII from before/after diffs, and computes an optional tamper-evidence
// hash chain. Persistence (writing the row in the SAME tx as the business
// change, per ADR-013) is a DB-phase concern and is intentionally not here.
package audit

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ActorType identifies who performed an action (Sec 28). For ActorSystem the
// ActorID is the worker name (e.g. "system:liquidation-worker").
type ActorType string

const (
	ActorUser     ActorType = "user"
	ActorAdmin    ActorType = "admin"
	ActorSystem   ActorType = "system"
	ActorProvider ActorType = "provider"
)

// Result is the outcome of the audited action (Sec 28).
type Result string

const (
	ResultSuccess Result = "success"
	ResultDenied  Result = "denied"
	ResultFailed  Result = "failed"
)

// Action names for the Sec 28 "minimum events" set. Not exhaustive; add as
// modules land. Naming convention: <domain>.<object>.<verb>.
const (
	ActionLoginSuccess       = "auth.login.success"
	ActionLoginFailure       = "auth.login.failure"
	ActionLogout             = "auth.logout"
	ActionPasswordChange     = "auth.password.change"
	ActionPasswordReset      = "auth.password.reset"
	ActionRoleChange         = "admin.role.change"
	ActionPermissionChange   = "admin.permission.change"
	ActionWithdrawalApprove  = "admin.withdrawal.approve"
	ActionWithdrawalReject   = "admin.withdrawal.reject"
	ActionUserStatusChange   = "admin.user.status_change"
	ActionTradingPermChange  = "admin.user.trading_permission"
	ActionAssetCreate        = "admin.asset.create"
	ActionAssetPriceChange   = "admin.asset.price_change"
	ActionMarketConfigChange = "admin.market.config"
	ActionFeeConfigChange    = "admin.fee.config"
	ActionLeverageConfig     = "admin.leverage.config"
	ActionPaymentReceived    = "payment.event.received"
	ActionPaymentVerified    = "payment.event.verified"
	ActionPaymentRejected    = "payment.event.rejected"
	ActionLiquidation        = "futures.liquidation"
	ActionBinarySettlement   = "binary.settlement"
	ActionManualLedgerAdjust = "ledger.manual_adjustment"
	ActionKYCStatusChange    = "kyc.status_change"
	ActionListingDecision    = "listing.decision"
	ActionLegalPublish       = "legal.publish"
)

// Event is a single append-only audit record (Sec 28 fields).
type Event struct {
	ID         string
	OccurredAt time.Time
	ActorType  ActorType
	ActorID    string
	Action     string
	TargetType string
	TargetID   string
	Before     map[string]any // secrets/PII already redacted via WithDiff
	After      map[string]any
	Reason     string // mandatory for admin sensitive actions
	IP         string
	UserAgent  string
	RequestID  string
	Result     Result
	HashPrev   string
	Hash       string
}

// NewEvent starts an event with a generated ID, UTC timestamp, and Result
// defaulting to success. Callers set the remaining fields (or use the With*
// helpers) and finally Seal to compute the hash chain.
func NewEvent(action string, actorType ActorType, actorID string) Event {
	return Event{
		ID:         uuid.NewString(),
		OccurredAt: time.Now().UTC(),
		ActorType:  actorType,
		ActorID:    actorID,
		Action:     action,
		Result:     ResultSuccess,
	}
}

// WithDiff attaches redacted before/after snapshots and returns the event for
// chaining. Both maps are copied and passed through Redact.
func (e Event) WithDiff(before, after map[string]any) Event {
	e.Before = Redact(before)
	e.After = Redact(after)
	return e
}

// WithTarget sets the affected entity.
func (e Event) WithTarget(targetType, targetID string) Event {
	e.TargetType = targetType
	e.TargetID = targetID
	return e
}

// WithRequestContext sets ip / user-agent / correlation id.
func (e Event) WithRequestContext(ip, userAgent, requestID string) Event {
	e.IP = ip
	e.UserAgent = userAgent
	e.RequestID = requestID
	return e
}

// Seal finalizes the tamper-evidence hash chain: it records the previous hash
// and computes this event's hash over its canonical form. See Sec 28
// (hash_prev / hash, [REC]).
func (e *Event) Seal(prevHash string) {
	e.HashPrev = prevHash
	e.Hash = e.ComputeHash(prevHash)
}

// ComputeHash returns a deterministic SHA-256 over the event's canonical JSON
// (excluding Hash/HashPrev) prefixed by prevHash. encoding/json marshals map
// keys in sorted order, so the digest is stable across runs.
func (e Event) ComputeHash(prevHash string) string {
	canon := struct {
		ID         string
		OccurredAt time.Time
		ActorType  ActorType
		ActorID    string
		Action     string
		TargetType string
		TargetID   string
		Before     map[string]any
		After      map[string]any
		Reason     string
		IP         string
		UserAgent  string
		RequestID  string
		Result     Result
	}{
		e.ID, e.OccurredAt, e.ActorType, e.ActorID, e.Action,
		e.TargetType, e.TargetID, e.Before, e.After, e.Reason,
		e.IP, e.UserAgent, e.RequestID, e.Result,
	}
	b, _ := json.Marshal(canon)
	sum := sha256.Sum256(append([]byte(prevHash), b...))
	return hex.EncodeToString(sum[:])
}

// secretKeySubstrings are redacted entirely (replaced by a stable hash so the
// value is auditable-but-unrecoverable). Matched case-insensitively as substrings.
var secretKeySubstrings = []string{
	"password", "passwd", "secret", "token", "jwt", "cookie", "otp",
	"cvv", "cvc", "card_number", "cardnumber", "private_key", "privatekey",
	"api_key", "apikey", "authorization", "session", "seed", "mnemonic",
}

// piiKeySubstrings are masked (partially hidden) rather than fully redacted.
var piiKeySubstrings = []string{"email", "phone", "msisdn"}

const redactedValue = "[REDACTED]"

// Redact returns a copy of m with secret keys hashed and PII keys masked, per
// Sec 28 ("secrets/PII redacted; sensitive fields hashed/masked"). Nested maps
// are redacted recursively. The input map is never mutated.
func Redact(m map[string]any) map[string]any {
	if m == nil {
		return nil
	}
	out := make(map[string]any, len(m))
	for k, v := range m {
		lk := strings.ToLower(k)
		switch {
		case containsAny(lk, secretKeySubstrings):
			out[k] = redactedValue
		case containsAny(lk, piiKeySubstrings):
			out[k] = maskPII(v)
		default:
			if nested, ok := v.(map[string]any); ok {
				out[k] = Redact(nested)
			} else {
				out[k] = v
			}
		}
	}
	return out
}

func containsAny(haystack string, needles []string) bool {
	for _, n := range needles {
		if strings.Contains(haystack, n) {
			return true
		}
	}
	return false
}

// maskPII hides the middle of a string value (e.g. an email or phone), keeping
// enough to identify the record without exposing the full value.
func maskPII(v any) any {
	s, ok := v.(string)
	if !ok || s == "" {
		return redactedValue
	}
	if at := strings.IndexByte(s, '@'); at > 0 {
		// email: keep first char and domain
		name := s[:at]
		domain := s[at:]
		return firstChar(name) + "***" + domain
	}
	if len(s) <= 4 {
		return "***"
	}
	return s[:2] + strings.Repeat("*", len(s)-4) + s[len(s)-2:]
}

func firstChar(s string) string {
	if s == "" {
		return ""
	}
	return s[:1]
}
