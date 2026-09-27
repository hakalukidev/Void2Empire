package statemachine

import (
	"errors"
	"testing"
)

func TestMachine(t *testing.T) {
	m := New(
		Transition{From: "a", Trigger: "go", To: "b"},
		Transition{From: "b", Trigger: "finish", To: "c"},
	)

	if !m.Can("a", "go") {
		t.Error("Can(a, go) should be true")
	}
	if m.Can("a", "finish") {
		t.Error("Can(a, finish) should be false")
	}
	if m.Can("c", "go") {
		t.Error("terminal state c should allow no transitions")
	}

	to, err := m.Transition("a", "go")
	if err != nil || to != "b" {
		t.Errorf("Transition(a, go) = (%q, %v), want (b, nil)", to, err)
	}

	// Unlisted trigger is invalid and leaves state unchanged.
	to, err = m.Transition("a", "finish")
	if !errors.Is(err, ErrInvalidTransition) {
		t.Errorf("Transition(a, finish) err = %v, want ErrInvalidTransition", err)
	}
	if to != "a" {
		t.Errorf("invalid transition should return the original state, got %q", to)
	}

	// Unknown state is invalid too.
	if _, err = m.Transition("zzz", "go"); !errors.Is(err, ErrInvalidTransition) {
		t.Errorf("Transition from unknown state should be invalid, got %v", err)
	}
}
