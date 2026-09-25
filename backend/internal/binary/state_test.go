package binary

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
		{StateCreated, TriggerAccept, StateAccepted},
		{StateAccepted, TriggerActivate, StateActive},
		{StateActive, TriggerExpire, StateExpiring},
		{StateExpiring, TriggerSettle, StateSettled},
		{StateSettled, TriggerWin, StateWon},
		{StateSettled, TriggerLose, StateLost},
		{StateCreated, TriggerReject, StateRejected},
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

func TestDRGatedEdgesAreNotImplemented(t *testing.T) {
	// Rule #35: DR-013 (tie/refund) and DR-014 (cancellation) are undecided.
	// No transition may exist for them; they must be invalid.
	if Machine().Can(StateActive, "cancel") {
		t.Error("active->cancel must not exist (DR-014)")
	}
	if Machine().Can(StateSettled, "tie") {
		t.Error("settled->tie must not exist (DR-013)")
	}
	if Machine().Can(StateSettled, "refund") {
		t.Error("settled->refund must not exist (DR-013)")
	}
}

func TestInvalidTransitions(t *testing.T) {
	bad := []struct {
		from    State
		trigger Trigger
	}{
		{StateCreated, TriggerActivate}, // must be accepted first
		{StateWon, TriggerLose},         // terminal
		{StateLost, TriggerWin},         // terminal
		{StateRejected, TriggerAccept},  // terminal
		{StateActive, TriggerWin},       // must settle first
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
	for _, s := range []State{StateWon, StateLost, StateRejected} {
		if !IsTerminal(s) {
			t.Errorf("%q should be terminal", s)
		}
	}
	for _, s := range []State{StateCreated, StateAccepted, StateActive, StateExpiring, StateSettled} {
		if IsTerminal(s) {
			t.Errorf("%q should NOT be terminal", s)
		}
	}
}
