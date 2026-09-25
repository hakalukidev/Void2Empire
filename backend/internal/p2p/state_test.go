package p2p

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
		{StatePending, TriggerMarkPaid, StatePaid},
		{StatePending, TriggerTimerExpire, StateCancelled},
		{StatePaid, TriggerRelease, StateReleased},
		{StateReleased, TriggerComplete, StateCompleted},
		{StatePaid, TriggerDispute, StateDisputed},
		{StateDisputed, TriggerAdminResolveBuyer, StateReleased},
		{StateDisputed, TriggerAdminResolveSeller, StateRefunded},
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

func TestDisputeExitsAreAdminOnly(t *testing.T) {
	// DR-064 / ASM-041: the only ways out of `disputed` are the two interim
	// manual admin resolutions. No party-triggered or automated exit may exist.
	for _, tr := range []Trigger{TriggerMarkPaid, TriggerRelease, TriggerTimerExpire, TriggerDispute} {
		if _, err := Transition(StateDisputed, tr); !errors.Is(err, statemachine.ErrInvalidTransition) {
			t.Errorf("disputed + %q should be invalid (admin-only), got %v", tr, err)
		}
	}
}

func TestInvalidTransitions(t *testing.T) {
	bad := []struct {
		from    State
		trigger Trigger
	}{
		{StatePending, TriggerRelease},    // must be paid first
		{StateCompleted, TriggerDispute},  // terminal
		{StateCancelled, TriggerMarkPaid}, // terminal
		{StateRefunded, TriggerRelease},   // terminal
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
	for _, s := range []State{StateCompleted, StateCancelled, StateRefunded} {
		if !IsTerminal(s) {
			t.Errorf("%q should be terminal", s)
		}
	}
	for _, s := range []State{StatePending, StatePaid, StateReleased, StateDisputed} {
		if IsTerminal(s) {
			t.Errorf("%q should NOT be terminal", s)
		}
	}
}
