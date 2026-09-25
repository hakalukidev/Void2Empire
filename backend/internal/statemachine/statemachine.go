// Package statemachine provides a tiny, pure state-transition validator.
//
// Sec 30 of context.md: "Each transition is implemented by a domain function
// (pure) validating the allowed-transition table... Anything not listed is
// invalid and must return 409 INVALID_STATE_TRANSITION." This package encodes
// that rule once; each domain supplies only its own allowed-transition table.
package statemachine

import "errors"

// ErrInvalidTransition is returned when a (state, trigger) pair is not present
// in the allowed-transition table. Callers map it to HTTP 409 with the
// INVALID_STATE_TRANSITION error code (Sec 32).
var ErrInvalidTransition = errors.New("invalid state transition")

// State is a node in the machine (e.g. "pending").
type State string

// Trigger is an event that requests a transition (e.g. "admin_approve").
type Trigger string

// Transition is a single allowed edge: From --Trigger--> To.
type Transition struct {
	From    State
	Trigger Trigger
	To      State
}

// Machine is an immutable allowed-transition table. The zero value is unusable;
// construct with New.
type Machine struct {
	allowed map[State]map[Trigger]State
}

// New builds a Machine from the given allowed transitions.
func New(transitions ...Transition) *Machine {
	m := &Machine{allowed: make(map[State]map[Trigger]State, len(transitions))}
	for _, t := range transitions {
		if m.allowed[t.From] == nil {
			m.allowed[t.From] = make(map[Trigger]State)
		}
		m.allowed[t.From][t.Trigger] = t.To
	}
	return m
}

// Can reports whether the transition is allowed without performing it.
func (m *Machine) Can(from State, trigger Trigger) bool {
	_, ok := m.allowed[from][trigger]
	return ok
}

// Transition returns the resulting state, or ErrInvalidTransition (leaving the
// state unchanged) if the edge is not in the table.
func (m *Machine) Transition(from State, trigger Trigger) (State, error) {
	to, ok := m.allowed[from][trigger]
	if !ok {
		return from, ErrInvalidTransition
	}
	return to, nil
}
