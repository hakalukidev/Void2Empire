// Package deposit holds the deposit domain. This file defines the pure state
// machine from context.md Sec 30 (DEPOSIT). Crediting is webhook-authoritative
// (Sec 21, Rule #39); the ledger posting itself is not implemented here.
package deposit

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 DEPOSIT).
const (
	StatePending        State = "pending"
	StateProcessing     State = "processing"
	StateRequiresReview State = "requires_review"
	StateCompleted      State = "completed"
	StateFailed         State = "failed"
	StateCancelled      State = "cancelled"
	StateExpired        State = "expired"
	StateReversed       State = "reversed"
)

// Triggers.
const (
	TriggerProcess  Trigger = "process"
	TriggerReview   Trigger = "review"
	TriggerComplete Trigger = "complete"
	TriggerFail     Trigger = "fail"
	TriggerCancel   Trigger = "cancel"
	TriggerExpire   Trigger = "expire"
	TriggerReverse  Trigger = "reverse"
)

// machine encodes: pending -> processing -> completed; pending/processing ->
// failed|cancelled|expired; processing -> requires_review -> completed|failed;
// completed -> reversed (refund/chargeback only).
var machine = statemachine.New(
	statemachine.Transition{From: StatePending, Trigger: TriggerProcess, To: StateProcessing},
	statemachine.Transition{From: StateProcessing, Trigger: TriggerComplete, To: StateCompleted},
	statemachine.Transition{From: StatePending, Trigger: TriggerFail, To: StateFailed},
	statemachine.Transition{From: StatePending, Trigger: TriggerCancel, To: StateCancelled},
	statemachine.Transition{From: StatePending, Trigger: TriggerExpire, To: StateExpired},
	statemachine.Transition{From: StateProcessing, Trigger: TriggerFail, To: StateFailed},
	statemachine.Transition{From: StateProcessing, Trigger: TriggerCancel, To: StateCancelled},
	statemachine.Transition{From: StateProcessing, Trigger: TriggerExpire, To: StateExpired},
	statemachine.Transition{From: StateProcessing, Trigger: TriggerReview, To: StateRequiresReview},
	statemachine.Transition{From: StateRequiresReview, Trigger: TriggerComplete, To: StateCompleted},
	statemachine.Transition{From: StateRequiresReview, Trigger: TriggerFail, To: StateFailed},
	statemachine.Transition{From: StateCompleted, Trigger: TriggerReverse, To: StateReversed},
)

var terminal = map[State]bool{
	StateFailed:    true,
	StateCancelled: true,
	StateExpired:   true,
	StateReversed:  true,
}

func Machine() *statemachine.Machine { return machine }

func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}

func IsTerminal(s State) bool { return terminal[s] }
