// Package futures holds the futures trading domain. This file defines the pure
// position state machine from context.md Sec 30 (FUTURES POSITION). Margin,
// PnL, mark-price and the liquidation formula are DR-007/008/009/010-blocked
// and are NOT implemented here (Rule #35).
package futures

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 FUTURES POSITION). A fill enters at StateOpen.
const (
	StateOpen       State = "open"
	StateClosed     State = "closed"
	StateLiquidated State = "liquidated"
)

// Triggers.
const (
	TriggerAdd          Trigger = "add"           // increase position
	TriggerReduce       Trigger = "reduce"        // decrease position
	TriggerMarginChange Trigger = "margin_change" // adjust margin
	TriggerClose        Trigger = "close"         // user close / reduce to zero
	TriggerLiquidate    Trigger = "liquidate"     // worker, on breach
)

// machine: open self-loops on add/reduce/margin_change; open -> closed (user
// close); open -> liquidated (worker). Sec 30: whichever process locks the row
// first wins the close-vs-liquidate race; the loser sees a non-open state and
// no-ops (enforced at the DB layer, not here).
var machine = statemachine.New(
	statemachine.Transition{From: StateOpen, Trigger: TriggerAdd, To: StateOpen},
	statemachine.Transition{From: StateOpen, Trigger: TriggerReduce, To: StateOpen},
	statemachine.Transition{From: StateOpen, Trigger: TriggerMarginChange, To: StateOpen},
	statemachine.Transition{From: StateOpen, Trigger: TriggerClose, To: StateClosed},
	statemachine.Transition{From: StateOpen, Trigger: TriggerLiquidate, To: StateLiquidated},
)

var terminal = map[State]bool{
	StateClosed:     true,
	StateLiquidated: true,
}

func Machine() *statemachine.Machine { return machine }

func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}

func IsTerminal(s State) bool { return terminal[s] }
