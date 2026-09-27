package payment

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
		{StateCreated, TriggerInitiate, StatePending},
		{StatePending, TriggerSucceed, StateSucceeded},
		{StatePending, TriggerFail, StateFailed},
		{StatePending, TriggerCancel, StateCancelled},
		{StatePending, TriggerExpire, StateExpired},
		{StatePending, TriggerReview, StateRequiresReview},
		{StateSucceeded, TriggerRefund, StateRefunded},
		{StateSucceeded, TriggerPartialRefund, StatePartiallyRefunded},
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

func TestRequiresReviewHasNoExit(t *testing.T) {
	// Sec 30 defines no transition out of requires_review, so none may exist.
	for _, tr := range []Trigger{TriggerSucceed, TriggerFail, TriggerCancel, TriggerExpire} {
		if _, err := Transition(StateRequiresReview, tr); !errors.Is(err, statemachine.ErrInvalidTransition) {
			t.Errorf("requires_review + %q should be invalid, got %v", tr, err)
		}
	}
}

func TestInvalidTransitions(t *testing.T) {
	bad := []struct {
		from    State
		trigger Trigger
	}{
		{StateCreated, TriggerSucceed}, // must be pending first
		{StateFailed, TriggerInitiate}, // terminal
		{StateCancelled, TriggerSucceed},
		{StateExpired, TriggerReview},
		{StateRefunded, TriggerRefund}, // terminal
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
	for _, s := range []State{StateFailed, StateCancelled, StateExpired, StateRefunded, StatePartiallyRefunded} {
		if !IsTerminal(s) {
			t.Errorf("%q should be terminal", s)
		}
	}
	for _, s := range []State{StateCreated, StatePending, StateSucceeded, StateRequiresReview} {
		if IsTerminal(s) {
			t.Errorf("%q should NOT be terminal", s)
		}
	}
}
