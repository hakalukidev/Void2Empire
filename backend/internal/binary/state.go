// Package binary holds the binary trading domain. This file defines the pure
// trade state machine from context.md Sec 30 (BINARY TRADE).
//
// Rule #35: the payout formula and settlement price source (DR-012/013) and the
// cancellation rule (DR-014) are undecided. Only the definite spine is encoded
// here. The DR-gated edges are intentionally OMITTED, not guessed:
//   - active -> cancelled        (only if DR-014 allows)
//   - settled -> tie / refunded  (behavior per DR-013)
package binary

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 BINARY TRADE).
const (
	StateCreated  State = "created"
	StateAccepted State = "accepted"
	StateActive   State = "active"
	StateExpiring State = "expiring"
	StateSettled  State = "settled"
	StateWon      State = "won"
	StateLost     State = "lost"
	StateRejected State = "rejected"
)

// Triggers.
const (
	TriggerAccept   Trigger = "accept"
	TriggerActivate Trigger = "activate"
	TriggerExpire   Trigger = "expire"
	TriggerSettle   Trigger = "settle"
	TriggerWin      Trigger = "win"
	TriggerLose     Trigger = "lose"
	TriggerReject   Trigger = "reject"
)

// machine: created -> accepted -> active -> expiring -> settled -> won|lost;
// created -> rejected. DR-013/014 edges omitted (see package doc).
var machine = statemachine.New(
	statemachine.Transition{From: StateCreated, Trigger: TriggerAccept, To: StateAccepted},
	statemachine.Transition{From: StateAccepted, Trigger: TriggerActivate, To: StateActive},
	statemachine.Transition{From: StateActive, Trigger: TriggerExpire, To: StateExpiring},
	statemachine.Transition{From: StateExpiring, Trigger: TriggerSettle, To: StateSettled},
	statemachine.Transition{From: StateSettled, Trigger: TriggerWin, To: StateWon},
	statemachine.Transition{From: StateSettled, Trigger: TriggerLose, To: StateLost},
	statemachine.Transition{From: StateCreated, Trigger: TriggerReject, To: StateRejected},
)

var terminal = map[State]bool{
	StateWon:      true,
	StateLost:     true,
	StateRejected: true,
}

func Machine() *statemachine.Machine { return machine }

func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}

func IsTerminal(s State) bool { return terminal[s] }
