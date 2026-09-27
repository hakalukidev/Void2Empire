// Package order holds the spot order domain. This file defines the pure state
// machine from context.md Sec 30 (ORDER). Order placement/matching logic is
// DR-001/002/003-blocked and is intentionally not implemented here.
package order

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 ORDER).
const (
	StateOpen            State = "open"
	StatePartiallyFilled State = "partially_filled"
	StateFilled          State = "filled"
	StateCancelled       State = "cancelled"
	StateRejected        State = "rejected"
	StateExpired         State = "expired"
)

// Triggers.
const (
	TriggerPartialFill     Trigger = "partial_fill"
	TriggerFill            Trigger = "fill"
	TriggerCancel          Trigger = "cancel"
	TriggerCancelRemainder Trigger = "cancel_remainder"
	TriggerReject          Trigger = "reject"
	TriggerExpire          Trigger = "expire"
)

// machine is the allowed-transition table from Sec 30. Anything not listed is
// invalid and returns ErrInvalidTransition (-> 409 INVALID_STATE_TRANSITION).
var machine = statemachine.New(
	statemachine.Transition{From: StateOpen, Trigger: TriggerPartialFill, To: StatePartiallyFilled},
	statemachine.Transition{From: StateOpen, Trigger: TriggerFill, To: StateFilled},
	statemachine.Transition{From: StatePartiallyFilled, Trigger: TriggerFill, To: StateFilled},
	statemachine.Transition{From: StateOpen, Trigger: TriggerCancel, To: StateCancelled},
	statemachine.Transition{From: StatePartiallyFilled, Trigger: TriggerCancelRemainder, To: StateCancelled},
	statemachine.Transition{From: StateOpen, Trigger: TriggerReject, To: StateRejected},
	// Sec 30 notes expiry applies only "if supported" (TIF); whether TIF exists
	// is DR-003/DR-039. The edge is part of the spec'd machine; the feature that
	// fires it is undecided.
	statemachine.Transition{From: StateOpen, Trigger: TriggerExpire, To: StateExpired},
)

// terminal states per Sec 30: no transition out of these is valid.
var terminal = map[State]bool{
	StateFilled:    true,
	StateCancelled: true,
	StateRejected:  true,
	StateExpired:   true,
}

// Machine exposes the transition table (read-only use).
func Machine() *statemachine.Machine { return machine }

// Transition validates and applies a trigger, returning the next state.
func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}

// IsTerminal reports whether a state is terminal.
func IsTerminal(s State) bool { return terminal[s] }
