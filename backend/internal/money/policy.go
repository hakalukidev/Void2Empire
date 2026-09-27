package money

import "github.com/shopspring/decimal"

// RoundMode selects how a value is quantized to a fixed number of decimals.
type RoundMode int

const (
	// RoundDown truncates toward zero.
	RoundDown RoundMode = iota
	// RoundUp rounds away from zero.
	RoundUp
	// RoundHalfEven rounds to nearest, ties to even (banker's rounding).
	RoundHalfEven
	// RoundHalfUp rounds to nearest, ties away from zero.
	RoundHalfUp
)

// Rounding policy. Sec 9.2 [REC]: amounts credited to a user round down and
// fees charged round up. These modes are configurable package-level values
// (not constants) precisely because the final policy is DR-047 (P0, undecided);
// they encode the recommended default only and must be confirmed by the client.
// The number of decimal places is NOT decided here — it comes from each asset's
// `assets.decimals` (0-18) and is supplied by the caller to Quantize*.
var (
	CreditRoundMode = RoundDown
	FeeRoundMode    = RoundUp
)

// Quantize rounds the amount to `places` decimals using the given mode.
// places is clamped to the 0-18 range used by NUMERIC(38,18) / assets.decimals.
func (a Amount) Quantize(places int32, mode RoundMode) Amount {
	if places < 0 {
		places = 0
	}
	if places > 18 {
		places = 18
	}
	return Amount{d: round(a.d, places, mode)}
}

// QuantizeCredit rounds a user-credit amount using CreditRoundMode (Sec 9.2).
func (a Amount) QuantizeCredit(places int32) Amount { return a.Quantize(places, CreditRoundMode) }

// QuantizeFee rounds a fee amount using FeeRoundMode (Sec 9.2).
func (a Amount) QuantizeFee(places int32) Amount { return a.Quantize(places, FeeRoundMode) }

func round(d decimal.Decimal, places int32, mode RoundMode) decimal.Decimal {
	switch mode {
	case RoundUp:
		t := d.Truncate(places)
		if t.Equal(d) {
			return t
		}
		unit := decimal.New(1, -places)
		if d.IsNegative() {
			return t.Sub(unit)
		}
		return t.Add(unit)
	case RoundHalfEven:
		return d.RoundBank(places)
	case RoundHalfUp:
		return d.Round(places)
	case RoundDown:
		fallthrough
	default:
		return d.Truncate(places)
	}
}
