package funding

import (
	"errors"
	"testing"

	"void2empire/internal/statemachine"
)

func TestTransition(t *testing.T) {
	ok := []struct {
		from    State
		trigger Trigger
		to      State
	}{
		{StateActive, TriggerMilestone, StateActive},
		{StateActive, TriggerCloseByUser, StateClosedByUser},
		{StateActive, TriggerCloseLossThreshold, StateClosedLossThreshold},
	}
	for _, tc := range ok {
		got, err := Transition(tc.from, tc.trigger)
		if err != nil {
			t.Fatalf("Transition(%q,%q) unexpected err: %v", tc.from, tc.trigger, err)
		}
		if got != tc.to {
			t.Errorf("Transition(%q,%q) = %q, want %q", tc.from, tc.trigger, got, tc.to)
		}
	}
}

func TestClosedPositionsCannotReopen(t *testing.T) {
	// Sec 30 / REQ-102: both closed states are terminal; a closed purchase can
	// never be reopened (a new funding_purchases row is created instead).
	for _, s := range []State{StateClosedByUser, StateClosedLossThreshold} {
		for _, tr := range []Trigger{TriggerMilestone, TriggerCloseByUser, TriggerCloseLossThreshold} {
			if _, err := Transition(s, tr); !errors.Is(err, statemachine.ErrInvalidTransition) {
				t.Errorf("Transition(%q,%q) err = %v, want ErrInvalidTransition", s, tr, err)
			}
		}
	}
}

func TestTerminal(t *testing.T) {
	for _, s := range []State{StateClosedByUser, StateClosedLossThreshold} {
		if !IsTerminal(s) {
			t.Errorf("%q should be terminal", s)
		}
	}
	if IsTerminal(StateActive) {
		t.Errorf("active should NOT be terminal")
	}
}
