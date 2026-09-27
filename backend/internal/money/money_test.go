package money

import (
	"encoding/json"
	"testing"
)

func TestParse(t *testing.T) {
	valid := []struct {
		in   string
		want string
	}{
		{"0", "0"},
		{"1.5", "1.5"},
		{"-0.001", "-0.001"},
		{"12345678901234567890.123456789012345678", "12345678901234567890.123456789012345678"},
		{"1.500", "1.5"}, // trailing zeros normalize
	}
	for _, tc := range valid {
		got, err := Parse(tc.in)
		if err != nil {
			t.Fatalf("Parse(%q) unexpected error: %v", tc.in, err)
		}
		if got.String() != tc.want {
			t.Errorf("Parse(%q) = %q, want %q", tc.in, got.String(), tc.want)
		}
	}

	invalid := []string{
		"",
		"   ",
		"1e5",
		"1E5",
		"-1.2e-3",
		"abc",
		"1.2.3",
		"NaN",
		"Inf",
	}
	for _, in := range invalid {
		if _, err := Parse(in); err == nil {
			t.Errorf("Parse(%q) expected error, got nil", in)
		}
	}
}

func TestArithmetic(t *testing.T) {
	a := mustParse(t, "10.5")
	b := mustParse(t, "3.25")

	if got := a.Add(b).String(); got != "13.75" {
		t.Errorf("Add = %s, want 13.75", got)
	}
	if got := a.Sub(b).String(); got != "7.25" {
		t.Errorf("Sub = %s, want 7.25", got)
	}
	if got := a.Mul(b).String(); got != "34.125" {
		t.Errorf("Mul = %s, want 34.125", got)
	}
	if got := b.Neg().String(); got != "-3.25" {
		t.Errorf("Neg = %s, want -3.25", got)
	}
	if got := b.Neg().Abs().String(); got != "3.25" {
		t.Errorf("Abs = %s, want 3.25", got)
	}
	if a.Cmp(b) != 1 || b.Cmp(a) != -1 || a.Cmp(a) != 0 {
		t.Errorf("Cmp ordering wrong")
	}
	if !mustParse(t, "1.50").Equal(mustParse(t, "1.5")) {
		t.Errorf("Equal should ignore trailing-zero scale")
	}
}

func TestQuantizeModes(t *testing.T) {
	cases := []struct {
		in     string
		places int32
		mode   RoundMode
		want   string
	}{
		// toward zero
		{"1.239", 2, RoundDown, "1.23"},
		{"-1.239", 2, RoundDown, "-1.23"},
		// away from zero
		{"1.231", 2, RoundUp, "1.24"},
		{"-1.231", 2, RoundUp, "-1.24"},
		{"1.23", 2, RoundUp, "1.23"}, // exact, no bump
		// half to even
		{"1.235", 2, RoundHalfEven, "1.24"},
		{"1.245", 2, RoundHalfEven, "1.24"},
		// half away from zero
		{"1.235", 2, RoundHalfUp, "1.24"},
		{"1.245", 2, RoundHalfUp, "1.25"},
		// places clamping
		{"1.239", 0, RoundDown, "1"},
	}
	for _, tc := range cases {
		a := mustParse(t, tc.in)
		if got := a.Quantize(tc.places, tc.mode).String(); got != tc.want {
			t.Errorf("Quantize(%q, %d, mode %d) = %s, want %s", tc.in, tc.places, tc.mode, got, tc.want)
		}
	}
}

func TestCreditRoundsDownFeeRoundsUp(t *testing.T) {
	// Sec 9.2 [REC]: credits round down, fees round up (pending DR-047).
	credit := mustParse(t, "10.999").QuantizeCredit(2)
	if credit.String() != "10.99" {
		t.Errorf("credit should round down to 10.99, got %s", credit.String())
	}
	fee := mustParse(t, "0.001").QuantizeFee(2)
	if fee.String() != "0.01" {
		t.Errorf("fee should round up to 0.01, got %s", fee.String())
	}
}

func TestJSONRoundTrip(t *testing.T) {
	type payload struct {
		Price Amount `json:"price"`
	}

	// Marshal must produce a quoted string, never a bare number.
	out, err := json.Marshal(payload{Price: mustParse(t, "1.2500")})
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	if string(out) != `{"price":"1.25"}` {
		t.Errorf("marshal = %s, want {\"price\":\"1.25\"}", out)
	}

	// Unmarshal from a string succeeds.
	var in payload
	if err := json.Unmarshal([]byte(`{"price":"3.14159"}`), &in); err != nil {
		t.Fatalf("unmarshal string: %v", err)
	}
	if in.Price.String() != "3.14159" {
		t.Errorf("unmarshal = %s, want 3.14159", in.Price.String())
	}

	// A bare JSON number must be rejected (contract transports strings).
	if err := json.Unmarshal([]byte(`{"price":3.14}`), &in); err == nil {
		t.Errorf("unmarshal of bare number should fail")
	}

	// Exponent notation inside a string must be rejected.
	if err := json.Unmarshal([]byte(`{"price":"1e5"}`), &in); err == nil {
		t.Errorf("unmarshal of exponent string should fail")
	}
}

func mustParse(t *testing.T, s string) Amount {
	t.Helper()
	a, err := Parse(s)
	if err != nil {
		t.Fatalf("Parse(%q): %v", s, err)
	}
	return a
}
