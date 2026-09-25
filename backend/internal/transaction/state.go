// Package transaction holds the user-facing transaction domain. This file
// defines the pure state machine from context.md Sec 30 (TRANSACTION), whose
// states match the ASM-018 status set. Status changes append to
// transaction_status_history (DB phase, not implemented here).
package transaction

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 TRANSACTION / ASM-018).
const (
	StatePending    State = "pending"
	StateProcessing State = "processing"
	StateCompleted  State = "completed"
	StateFailed     State = "failed"
	StateCancelled  State = "cancelled"
	StateReversed   State = "reversed"
)

// Triggers.
const (
	TriggerProcess  Trigger = "process"
	TriggerComplete Trigger = "complete"
	TriggerFail     Trigger = "fail"
	TriggerCancel   Trigger = "cancel"
	TriggerReverse  Trigger = "reverse"
)

// machine encodes: pending -> processing -> completed|failed|cancelled;
// completed -> reversed (compensating).
var machine = statemachine.New(
	statemachine.Transition{From: StatePending, Trigger: TriggerProcess, To: StateProcessing},
	statemachine.Transition{From: StateProcessing, Trigger: TriggerComplete, To: StateCompleted},
	statemachine.Transition{From: StateProcessing, Trigger: TriggerFail, To: StateFailed},
	statemachine.Transition{From: StateProcessing, Trigger: TriggerCancel, To: StateCancelled},
	statemachine.Transition{From: StateCompleted, Trigger: TriggerReverse, To: StateReversed},
)

var terminal = map[State]bool{
	StateFailed:    true,
	StateCancelled: true,
	StateReversed:  true,
}

func Machine() *statemachine.Machine { return machine }

func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}

func IsTerminal(s State) bool { return terminal[s] }
