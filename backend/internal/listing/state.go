// Package listing holds the coin-listing-application domain. This file defines
// the pure state machine from context.md Sec 30 (LISTING APPLICATION). The
// review workflow, criteria and fee are DR-031 (P2); whether approval
// auto-creates an asset is undecided and NOT implemented here.
package listing

import "void2empire/internal/statemachine"

type State = statemachine.State
type Trigger = statemachine.Trigger

// States (Sec 30 LISTING APPLICATION).
const (
	StateSubmitted   State = "submitted"
	StateUnderReview State = "under_review"
	StateApproved    State = "approved"
	StateRejected    State = "rejected"
	StateNeedsInfo   State = "needs_info"
	StateListed      State = "listed"
)

// Triggers.
const (
	TriggerReview      Trigger = "review"       // submitted -> under_review
	TriggerApprove     Trigger = "approve"      // under_review -> approved
	TriggerReject      Trigger = "reject"       // under_review -> rejected
	TriggerRequestInfo Trigger = "request_info" // under_review -> needs_info
	TriggerResubmit    Trigger = "resubmit"     // needs_info -> under_review
	TriggerList        Trigger = "list"         // approved -> listed
)

// machine: submitted -> under_review -> approved|rejected|needs_info;
// needs_info -> under_review; approved -> listed. rejected is terminal
// (re-applying creates a new application).
var machine = statemachine.New(
	statemachine.Transition{From: StateSubmitted, Trigger: TriggerReview, To: StateUnderReview},
	statemachine.Transition{From: StateUnderReview, Trigger: TriggerApprove, To: StateApproved},
	statemachine.Transition{From: StateUnderReview, Trigger: TriggerReject, To: StateRejected},
	statemachine.Transition{From: StateUnderReview, Trigger: TriggerRequestInfo, To: StateNeedsInfo},
	statemachine.Transition{From: StateNeedsInfo, Trigger: TriggerResubmit, To: StateUnderReview},
	statemachine.Transition{From: StateApproved, Trigger: TriggerList, To: StateListed},
)

var terminal = map[State]bool{
	StateRejected: true,
	StateListed:   true,
}

func Machine() *statemachine.Machine { return machine }

func Transition(from State, trigger Trigger) (State, error) {
	return machine.Transition(from, trigger)
}

func IsTerminal(s State) bool { return terminal[s] }
