package order

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
		{StateOpen, TriggerPartialFill, StatePartiallyFilled},
		{StateOpen, TriggerFill, StateFilled},
		{StatePartiallyFilled, TriggerFill, StateFilled},
		{StateOpen, TriggerCancel, StateCancelled},
		{StatePartiallyFilled, TriggerCancelRemainder, StateCancelled},
		{StateOpen, TriggerReject, StateRejected},
		{StateOpen, TriggerExpire, StateExpired},
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
		{StateOpen, TriggerCancelRemainder}, // only from partially_filled
		{StateFilled, TriggerCancel},        // terminal
		{StateCancelled, TriggerFill},       // terminal
		{StateRejected, TriggerExpire},      // terminal
		{StateExpired, TriggerFill},         // terminal
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
	for _, s := range []State{StateFilled, StateCancelled, StateRejected, StateExpired} {
		if !IsTerminal(s) {
			t.Errorf("%q should be terminal", s)
		}
	}
	for _, s := range []State{StateOpen, StatePartiallyFilled} {
		if IsTerminal(s) {
			t.Errorf("%q should NOT be terminal", s)
		}
	}
}
