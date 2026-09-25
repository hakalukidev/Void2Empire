package futures

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
		{StateOpen, TriggerAdd, StateOpen},
		{StateOpen, TriggerReduce, StateOpen},
		{StateOpen, TriggerMarginChange, StateOpen},
		{StateOpen, TriggerClose, StateClosed},
		{StateOpen, TriggerLiquidate, StateLiquidated},
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

func TestInvalidTransitions(t *testing.T) {
	bad := []struct {
		from    State
		trigger Trigger
	}{
		{StateClosed, TriggerClose},     // terminal
		{StateClosed, TriggerLiquidate}, // terminal
		{StateLiquidated, TriggerAdd},   // terminal
		{StateLiquidated, TriggerClose}, // terminal
	}
	for _, tc := range bad {
		got, err := Transition(tc.from, tc.trigger)
		if !errors.Is(err, statemachine.ErrInvalidTransition) {
			t.Errorf("Transition(%q,%q) err = %v, want ErrInvalidTransition", tc.from, tc.trigger, err)
		}
		if got != tc.from {
			t.Errorf("invalid transition should keep state %q, got %q", tc.from, got)
		}
	}
}

func TestTerminal(t *testing.T) {
	for _, s := range []State{StateClosed, StateLiquidated} {
		if !IsTerminal(s) {
			t.Errorf("%q should be terminal", s)
		}
	}
	if IsTerminal(StateOpen) {
		t.Errorf("open should NOT be terminal")
	}
}
