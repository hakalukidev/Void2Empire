// Package funding holds the Void2Empire Funding System domain (context.md
// Sec 23, WA-1). This file defines the pure funding-position state machine from
// Sec 30 (FUNDING POSITION).
//
// Rule #35 / INV-25: the Funding Balance is a restricted ledger account that can
// never be a withdrawal/transfer/spot/binary/P2P source. Milestone math
// (DR-051/052/056) and the funding-futures parameters (DR-053) are undecided and
// NOT implemented here — only the state transitions from Sec 30 are encoded.
package funding

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 FUNDING POSITION). A purchase enters at StateActive.
const (
	StateActive              State = "active"
	StateClosedByUser        State = "closed_by_user"
	StateClosedLossThreshold State = "closed_loss_threshold"
)

// Triggers.
const (
	TriggerMilestone          Trigger = "milestone"            // achieved; no balance change ("Continue Trading")
	TriggerCloseByUser        Trigger = "close_by_user"        // user market-closes; reward computed & credited
	TriggerCloseLossThreshold Trigger = "close_loss_threshold" // worker detects 50% loss; balance -> 0, no reward
)

// machine: active self-loops on milestone; active -> closed_by_user;
// active -> closed_loss_threshold. Sec 30: both closed states are terminal and a
// closed purchase can never be reopened (a new funding_purchases row is created
// instead). The close-vs-loss race is resolved by whichever process locks the
// rows first (DB layer, not here).
var machine = statemachine.New(
	statemachine.Transition{From: StateActive, Trigger: TriggerMilestone, To: StateActive},
	statemachine.Transition{From: StateActive, Trigger: TriggerCloseByUser, To: StateClosedByUser},
	statemachine.Transition{From: StateActive, Trigger: TriggerCloseLossThreshold, To: StateClosedLossThreshold},
)

var terminal = map[State]bool{
	StateClosedByUser:        true,
	StateClosedLossThreshold: true,
}

func Machine() *statemachine.Machine { return machine }

func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}

func IsTerminal(s State) bool { return terminal[s] }
