// Package support holds the support-ticket domain. This file defines the pure
// state machine from context.md Sec 30 (SUPPORT TICKET). Ticket categories/SLA
// are DR-044 (P2) and not modeled here.
package support

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 SUPPORT TICKET).
const (
	StateOpen        State = "open"
	StateInProgress  State = "in_progress"
	StateWaitingUser State = "waiting_user"
	StateResolved    State = "resolved"
	StateClosed      State = "closed"
)

// Triggers.
const (
	TriggerStart   Trigger = "start"   // open -> in_progress
	TriggerWait    Trigger = "wait"    // in_progress -> waiting_user
	TriggerResolve Trigger = "resolve" // waiting_user -> resolved
	TriggerClose   Trigger = "close"   // resolved -> closed
	TriggerReopen  Trigger = "reopen"  // resolved -> open (within window)
)

// machine encodes exactly the Sec 30 chain:
// open -> in_progress -> waiting_user -> resolved -> closed; resolved -> open.
// Anything not listed (e.g. open -> resolved directly) is invalid.
var machine = statemachine.New(
	statemachine.Transition{From: StateOpen, Trigger: TriggerStart, To: StateInProgress},
	statemachine.Transition{From: StateInProgress, Trigger: TriggerWait, To: StateWaitingUser},
	statemachine.Transition{From: StateWaitingUser, Trigger: TriggerResolve, To: StateResolved},
	statemachine.Transition{From: StateResolved, Trigger: TriggerClose, To: StateClosed},
	statemachine.Transition{From: StateResolved, Trigger: TriggerReopen, To: StateOpen},
)

var terminal = map[State]bool{
	StateClosed: true,
}

func Machine() *statemachine.Machine { return machine }

func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}

func IsTerminal(s State) bool { return terminal[s] }
