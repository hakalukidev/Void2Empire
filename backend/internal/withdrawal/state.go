// Package withdrawal holds the withdrawal domain. This file defines the pure
// state machine from context.md Sec 30 (WITHDRAWAL). Approval automation
// (DR-016) and payout rails (DR-017) are undecided and NOT implemented here;
// fund reservation/release and the ledger posting are deferred to the DB phase.
// INV-25: the funding balance can never be a withdrawal source.
package withdrawal

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 WITHDRAWAL).
const (
	StatePending    State = "pending"
	StateApproved   State = "approved"
	StateRejected   State = "rejected"
	StateCancelled  State = "cancelled"
	StateProcessing State = "processing"
	StateCompleted  State = "completed"
	StateFailed     State = "failed"
)

// Triggers.
const (
	TriggerAdminApprove  Trigger = "admin_approve"
	TriggerAdminReject   Trigger = "admin_reject"
	TriggerUserCancel    Trigger = "user_cancel"
	TriggerStartPayout   Trigger = "start_payout"
	TriggerPayoutSuccess Trigger = "payout_success"
	TriggerPayoutFailed  Trigger = "payout_failed"
	TriggerRetry         Trigger = "retry"
)

var machine = statemachine.New(
	statemachine.Transition{From: StatePending, Trigger: TriggerAdminApprove, To: StateApproved},
	statemachine.Transition{From: StatePending, Trigger: TriggerAdminReject, To: StateRejected},
	statemachine.Transition{From: StatePending, Trigger: TriggerUserCancel, To: StateCancelled},
	statemachine.Transition{From: StateApproved, Trigger: TriggerStartPayout, To: StateProcessing},
	statemachine.Transition{From: StateProcessing, Trigger: TriggerPayoutSuccess, To: StateCompleted},
	statemachine.Transition{From: StateProcessing, Trigger: TriggerPayoutFailed, To: StateFailed},
	statemachine.Transition{From: StateFailed, Trigger: TriggerRetry, To: StatePending},
)

var terminal = map[State]bool{
	StateCompleted: true,
	StateRejected:  true,
	StateCancelled: true,
}

func Machine() *statemachine.Machine { return machine }

func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}

func IsTerminal(s State) bool { return terminal[s] }
