// Package payment holds the payment-intent domain. This file defines the pure
// state machine from context.md Sec 30 (PAYMENT intent). The provider itself
// (SSLCOMMERZ vs Stripe) is DR-024/045-blocked; webhook signature verification
// and crediting are DB/provider-phase concerns. Rule #39: a redirect/frontend
// callback is never proof of payment.
package payment

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 PAYMENT intent).
const (
	StateCreated           State = "created"
	StatePending           State = "pending"
	StateSucceeded         State = "succeeded"
	StateFailed            State = "failed"
	StateCancelled         State = "cancelled"
	StateExpired           State = "expired"
	StateRequiresReview    State = "requires_review"
	StateRefunded          State = "refunded"
	StatePartiallyRefunded State = "partially_refunded"
)

// Triggers.
const (
	TriggerInitiate      Trigger = "initiate"       // created -> pending
	TriggerSucceed       Trigger = "succeed"        // pending -> succeeded
	TriggerFail          Trigger = "fail"           // pending -> failed
	TriggerCancel        Trigger = "cancel"         // pending -> cancelled
	TriggerExpire        Trigger = "expire"         // pending -> expired
	TriggerReview        Trigger = "review"         // pending -> requires_review
	TriggerRefund        Trigger = "refund"         // succeeded -> refunded
	TriggerPartialRefund Trigger = "partial_refund" // succeeded -> partially_refunded
)

// machine: created -> pending -> succeeded|failed|cancelled|expired;
// pending -> requires_review; succeeded -> refunded|partially_refunded.
// Sec 30 lists no exit from requires_review, so none is encoded (any transition
// out of it is invalid until the client defines one).
var machine = statemachine.New(
	statemachine.Transition{From: StateCreated, Trigger: TriggerInitiate, To: StatePending},
	statemachine.Transition{From: StatePending, Trigger: TriggerSucceed, To: StateSucceeded},
	statemachine.Transition{From: StatePending, Trigger: TriggerFail, To: StateFailed},
	statemachine.Transition{From: StatePending, Trigger: TriggerCancel, To: StateCancelled},
	statemachine.Transition{From: StatePending, Trigger: TriggerExpire, To: StateExpired},
	statemachine.Transition{From: StatePending, Trigger: TriggerReview, To: StateRequiresReview},
	statemachine.Transition{From: StateSucceeded, Trigger: TriggerRefund, To: StateRefunded},
	statemachine.Transition{From: StateSucceeded, Trigger: TriggerPartialRefund, To: StatePartiallyRefunded},
)

var terminal = map[State]bool{
	StateFailed:            true,
	StateCancelled:         true,
	StateExpired:           true,
	StateRefunded:          true,
	StatePartiallyRefunded: true,
}

func Machine() *statemachine.Machine { return machine }

func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}

func IsTerminal(s State) bool { return terminal[s] }
