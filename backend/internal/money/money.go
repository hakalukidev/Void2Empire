// Package money provides exact decimal monetary arithmetic.
//
// Rules enforced here (see context.md):
//   - Rule #40 / ADR-006: money is an exact decimal, never a float32/float64.
//   - Sec 18.1 / 18.3: decimals are transported in JSON as strings, parsed
//     strictly, and exponent notation is rejected.
//   - Sec 9.2: values are computed at full precision and quantized once, at the
//     boundary, to an asset's decimal places. The rounding direction/mode is a
//     configurable policy; the final policy is DR-047 (P0, undecided), so the
//     defaults here are the Sec 9.2 [REC] guidance and are NOT a locked decision.
package money

import (
	"encoding/json"
	"errors"
	"strings"

	"github.com/shopspring/decimal"
)

// ErrInvalidAmount is returned when a string cannot be parsed as a strict
// decimal monetary value (empty, exponent notation, or otherwise malformed).
var ErrInvalidAmount = errors.New("invalid monetary amount")

// Amount is an exact decimal monetary value. The zero Amount is 0.
// It marshals to JSON as a quoted string and never uses floating point.
type Amount struct {
	d decimal.Decimal
}

// New wraps an existing decimal as an Amount.
func New(d decimal.Decimal) Amount { return Amount{d: d} }

// Zero returns the zero Amount.
func Zero() Amount { return Amount{d: decimal.Zero} }

// Parse strictly parses a decimal string into an Amount.
// It rejects empty/whitespace input and exponent notation (e.g. "1e5"),
// per Sec 18.3 and the Sec 36 edge-case catalogue.
func Parse(s string) (Amount, error) {
	if strings.TrimSpace(s) == "" {
		return Amount{}, ErrInvalidAmount
	}
	if strings.ContainsAny(s, "eE") {
		return Amount{}, ErrInvalidAmount
	}
	d, err := decimal.NewFromString(s)
	if err != nil {
		return Amount{}, ErrInvalidAmount
	}
	return Amount{d: d}, nil
}

// Decimal exposes the underlying decimal for interop with pgx/shopspring.
func (a Amount) Decimal() decimal.Decimal { return a.d }

// String returns the exact decimal string representation (no exponent).
func (a Amount) String() string { return a.d.String() }

func (a Amount) IsZero() bool     { return a.d.IsZero() }
func (a Amount) IsPositive() bool { return a.d.IsPositive() }
func (a Amount) IsNegative() bool { return a.d.IsNegative() }

func (a Amount) Add(b Amount) Amount { return Amount{d: a.d.Add(b.d)} }
func (a Amount) Sub(b Amount) Amount { return Amount{d: a.d.Sub(b.d)} }
func (a Amount) Mul(b Amount) Amount { return Amount{d: a.d.Mul(b.d)} }
func (a Amount) Neg() Amount         { return Amount{d: a.d.Neg()} }
func (a Amount) Abs() Amount         { return Amount{d: a.d.Abs()} }

// Cmp returns -1 if a < b, 0 if a == b, and 1 if a > b.
func (a Amount) Cmp(b Amount) int { return a.d.Cmp(b.d) }

// Equal reports numeric equality (ignoring trailing-zero scale differences).
func (a Amount) Equal(b Amount) bool { return a.d.Equal(b.d) }

// MarshalJSON encodes the amount as a JSON string (ADR-006, Rule #40).
func (a Amount) MarshalJSON() ([]byte, error) {
	return json.Marshal(a.d.String())
}

// UnmarshalJSON decodes an amount strictly from a JSON string. A bare JSON
// number is rejected: the API contract transports decimals as strings.
func (a *Amount) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return ErrInvalidAmount
	}
	parsed, err := Parse(s)
	if err != nil {
		return err
	}
	*a = parsed
	return nil
}
