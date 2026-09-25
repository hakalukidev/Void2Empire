package listing

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
		{StateSubmitted, TriggerReview, StateUnderReview},
		{StateUnderReview, TriggerApprove, StateApproved},
		{StateUnderReview, TriggerReject, StateRejected},
		{StateUnderReview, TriggerRequestInfo, StateNeedsInfo},
		{StateNeedsInfo, TriggerResubmit, StateUnderReview},
		{StateApproved, TriggerList, StateListed},
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
		{StateSubmitted, TriggerApprove}, // must be under_review first
		{StateRejected, TriggerReview},   // terminal (re-apply creates a new one)
		{StateListed, TriggerReject},     // terminal
		{StateNeedsInfo, TriggerApprove}, // must resubmit to under_review first
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
	for _, s := range []State{StateRejected, StateListed} {
		if !IsTerminal(s) {
			t.Errorf("%q should be terminal", s)
		}
	}
	for _, s := range []State{StateSubmitted, StateUnderReview, StateApproved, StateNeedsInfo} {
		if IsTerminal(s) {
			t.Errorf("%q should NOT be terminal", s)
		}
	}
}
