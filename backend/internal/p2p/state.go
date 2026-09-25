// Package p2p holds the P2P Marketplace & Agent System domain (context.md
// Sec 22, WA-3). This file defines the pure order state machine from Sec 30
// (P2P ORDER).
//
// DR-064 / ASM-041 (HARD BLOCKER): WA-3's §13 fraud/refund/cancellation rule is
// truncated mid-sentence in the client source. The `disputed` branch below is an
// INTERIM manual-admin-only process, NOT the client's real rule. Do NOT automate
// any transition out of `disputed` (no auto-cancel, no auto-refund) until the
// client supplies the missing text. Escrow lock timing (ASM-038) and the payment/
// release timer durations (DR-061) are DB/worker concerns, not encoded here.
package p2p

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 P2P ORDER). Order creation enters at StatePending (escrow locked).
const (
	StatePending   State = "pending"
	StatePaid      State = "paid"
	StateReleased  State = "released"
	StateCompleted State = "completed"
	StateCancelled State = "cancelled"
	StateDisputed  State = "disputed"
	StateRefunded  State = "refunded"
)

// Triggers.
const (
	TriggerMarkPaid           Trigger = "mark_paid"            // buyer marks payment made
	TriggerTimerExpire        Trigger = "timer_expire"         // worker, payment timer elapsed unpaid (REQ-130)
	TriggerRelease            Trigger = "release"              // seller verifies payment, releases escrow
	TriggerComplete           Trigger = "complete"             // release confirmed (near-atomic, ASM-039)
	TriggerDispute            Trigger = "dispute"              // payment claim disputed (fake proof etc.)
	TriggerAdminResolveBuyer  Trigger = "admin_resolve_buyer"  // interim manual: -> released
	TriggerAdminResolveSeller Trigger = "admin_resolve_seller" // interim manual: -> refunded
)

var machine = statemachine.New(
	statemachine.Transition{From: StatePending, Trigger: TriggerMarkPaid, To: StatePaid},
	statemachine.Transition{From: StatePending, Trigger: TriggerTimerExpire, To: StateCancelled},
	statemachine.Transition{From: StatePaid, Trigger: TriggerRelease, To: StateReleased},
	statemachine.Transition{From: StateReleased, Trigger: TriggerComplete, To: StateCompleted},
	statemachine.Transition{From: StatePaid, Trigger: TriggerDispute, To: StateDisputed},
	// DR-064 interim manual-admin-only exits. See package doc — not the real rule.
	statemachine.Transition{From: StateDisputed, Trigger: TriggerAdminResolveBuyer, To: StateReleased},
	statemachine.Transition{From: StateDisputed, Trigger: TriggerAdminResolveSeller, To: StateRefunded},
)

var terminal = map[State]bool{
	StateCompleted: true,
	StateCancelled: true,
	StateRefunded:  true,
}

func Machine() *statemachine.Machine { return machine }

func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}

func IsTerminal(s State) bool { return terminal[s] }
