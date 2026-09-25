package user

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
		{StatePendingVerification, TriggerVerify, StateActive},
		{StateActive, TriggerSuspend, StateSuspended},
		{StateSuspended, TriggerActivate, StateActive},
		{StateActive, TriggerBan, StateBanned},
		{StateSuspended, TriggerBan, StateBanned},
		{StatePendingVerification, TriggerBan, StateBanned},
		{StateBanned, TriggerRestore, StateSuspended},
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
		{StatePendingVerification, TriggerSuspend}, // not listed
		{StateActive, TriggerRestore},              // restore is banned-only
		{StateBanned, TriggerActivate},             // banned -> suspended only
		{StateSuspended, TriggerVerify},            // verify is pending-only
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
