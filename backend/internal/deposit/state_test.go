package deposit

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
		{StatePending, TriggerProcess, StateProcessing},
		{StateProcessing, TriggerComplete, StateCompleted},
		{StatePending, TriggerFail, StateFailed},
		{StatePending, TriggerCancel, StateCancelled},
		{StatePending, TriggerExpire, StateExpired},
		{StateProcessing, TriggerFail, StateFailed},
		{StateProcessing, TriggerCancel, StateCancelled},
		{StateProcessing, TriggerExpire, StateExpired},
		{StateProcessing, TriggerReview, StateRequiresReview},
		{StateRequiresReview, TriggerComplete, StateCompleted},
		{StateRequiresReview, TriggerFail, StateFailed},
		{StateCompleted, TriggerReverse, StateReversed},
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
		{StatePending, TriggerComplete},  // must go through processing
		{StateCompleted, TriggerFail},    // completed only reverses
		{StateFailed, TriggerProcess},    // terminal
		{StateReversed, TriggerComplete}, // terminal
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
	for _, s := range []State{StateFailed, StateCancelled, StateExpired, StateReversed} {
		if !IsTerminal(s) {
			t.Errorf("%q should be terminal", s)
		}
	}
	for _, s := range []State{StatePending, StateProcessing, StateRequiresReview, StateCompleted} {
		if IsTerminal(s) {
			t.Errorf("%q should NOT be terminal", s)
		}
	}
}
