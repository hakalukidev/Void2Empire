// Package user holds the user account domain. This file defines the pure state
// machine from context.md Sec 30 (USER). `trading_enabled` is a SEPARATE flag
// (REQ-076), not part of this status machine.
package user

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 USER). Registration enters at StatePendingVerification.
const (
	StatePendingVerification State = "pending_verification"
	StateActive              State = "active"
	StateSuspended           State = "suspended"
	StateBanned              State = "banned"
)

// Triggers.
const (
	TriggerVerify   Trigger = "verify"   // system, after verification
	TriggerSuspend  Trigger = "suspend"  // admin
	TriggerActivate Trigger = "activate" // admin
	TriggerBan      Trigger = "ban"      // admin
	TriggerRestore  Trigger = "restore"  // super-admin (banned -> suspended)
)

var machine = statemachine.New(
	statemachine.Transition{From: StatePendingVerification, Trigger: TriggerVerify, To: StateActive},
	statemachine.Transition{From: StateActive, Trigger: TriggerSuspend, To: StateSuspended},
	statemachine.Transition{From: StateSuspended, Trigger: TriggerActivate, To: StateActive},
	statemachine.Transition{From: StateActive, Trigger: TriggerBan, To: StateBanned},
	statemachine.Transition{From: StateSuspended, Trigger: TriggerBan, To: StateBanned},
	statemachine.Transition{From: StatePendingVerification, Trigger: TriggerBan, To: StateBanned},
	statemachine.Transition{From: StateBanned, Trigger: TriggerRestore, To: StateSuspended},
)

// No terminal states: banned can be restored by a super-admin (Sec 30).
func Machine() *statemachine.Machine { return machine }

func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}
