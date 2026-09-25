package support

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
		{StateOpen, TriggerStart, StateInProgress},
		{StateInProgress, TriggerWait, StateWaitingUser},
		{StateWaitingUser, TriggerResolve, StateResolved},
		{StateResolved, TriggerClose, StateClosed},
		{StateResolved, TriggerReopen, StateOpen},
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
		{StateOpen, TriggerResolve},  // must progress through the chain
		{StateClosed, TriggerReopen}, // terminal
		{StateClosed, TriggerStart},  // terminal
		{StateInProgress, TriggerClose},
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
	if !IsTerminal(StateClosed) {
		t.Errorf("closed should be terminal")
	}
	for _, s := range []State{StateOpen, StateInProgress, StateWaitingUser, StateResolved} {
		if IsTerminal(s) {
			t.Errorf("%q should NOT be terminal", s)
		}
	}
}
