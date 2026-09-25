// Package rbac provides pure role-based access checks.
//
// It encodes the proposed permission matrix of context.md Sec 4.1 [ASM-010].
// The final role/permission hierarchy is DR-026 (P1, undecided); this is the
// proposed matrix, not a locked decision (Rule #35).
//
// SCOPE: RBAC answers only "may this role touch this capability, and at what
// breadth". It does NOT enforce the additional per-request business gates that
// the spec layers on top, which are checked by the service/DB layer:
//   - real trading also requires users.status=active AND trading_enabled
//     (REQ-076) AND, if decided, a KYC level (DR-018);
//   - P2P post creation is gated by account age/trade count (REQ-114) or agent
//     tier + fee (REQ-116); P2P company-buy requires Level Pro (REQ-119/120);
//   - manual ledger adjustment requires dual control (DR-041);
//   - asset/market config changes use maker/approver separation [REC].
//
// Ownership scoping ("own data only" vs "all") is likewise applied by callers;
// AccessOwn vs AccessReadOnly below records the breadth, not the row filter.
package rbac

import "errors"

// ErrPermissionDenied is returned by the transport layer when a role lacks the
// required capability. It maps to HTTP 403 PERMISSION_DENIED (Sec 32).
var ErrPermissionDenied = errors.New("permission denied")

// Role is an actor's platform role (ASM-010).
type Role string

const (
	RoleGuest      Role = "guest"
	RoleUser       Role = "user"
	RoleTrader     Role = "trader" // a user with trading_enabled
	RoleSupport    Role = "support"
	RoleFinanceOp  Role = "finance_op"
	RoleAdmin      Role = "admin"
	RoleSuperAdmin Role = "super_admin"
)

// Capability is a distinct permission checked against the matrix.
type Capability string

const (
	CapViewPublic            Capability = "view_public"
	CapRegisterLogin         Capability = "register_login"
	CapProfile               Capability = "profile"
	CapWalletView            Capability = "wallet_view"
	CapDeposit               Capability = "deposit"
	CapWithdrawalRequest     Capability = "withdrawal_request"
	CapWithdrawalApprove     Capability = "withdrawal_approve"
	CapRealTrading           Capability = "real_trading"
	CapDemoTrading           Capability = "demo_trading"
	CapFundingReferralView   Capability = "funding_referral_leaderboard_view"
	CapP2PTrade              Capability = "p2p_trade"
	CapP2PCreatePost         Capability = "p2p_create_post"
	CapP2PCompanyBuy         Capability = "p2p_company_buy"
	CapSubmitListingOrTicket Capability = "submit_listing_or_ticket"
	CapReplyTickets          Capability = "reply_tickets"
	CapManageUsers           Capability = "manage_users"
	CapToggleTradingPerm     Capability = "toggle_trading_permission"
	CapManageMarketConfig    Capability = "manage_assets_markets_fees"
	CapManageAdminsRoles     Capability = "manage_admins_roles"
	CapViewAuditLog          Capability = "view_audit_log"
	CapManualLedgerAdjust    Capability = "manual_ledger_adjustment"
)

// Access is the breadth granted for a (role, capability) pair.
type Access int

const (
	// AccessNone means the role may not perform the capability ("-").
	AccessNone Access = iota
	// AccessOwn means own data only ("○").
	AccessOwn
	// AccessReadOnly means read-only ("◐"); the row scope (all vs a context
	// such as "ticket context" for Support, "finance scope" for Finance Op) is
	// enforced by the caller.
	AccessReadOnly
	// AccessFull means allowed ("✔"), subject to the business gates in the
	// package doc.
	AccessFull
)

// matrix is the Sec 4.1 permission table. Any (role, capability) absent from it
// is treated as AccessNone (default-deny).
var matrix = map[Role]map[Capability]Access{
	RoleGuest: {
		CapViewPublic:    AccessFull,
		CapRegisterLogin: AccessFull,
	},
	RoleUser: {
		CapViewPublic:            AccessFull,
		CapProfile:               AccessOwn,
		CapWalletView:            AccessOwn,
		CapDeposit:               AccessOwn,
		CapWithdrawalRequest:     AccessOwn,
		CapDemoTrading:           AccessOwn,
		CapFundingReferralView:   AccessOwn,
		CapP2PTrade:              AccessFull,
		CapP2PCreatePost:         AccessOwn, // conditional gate REQ-114
		CapSubmitListingOrTicket: AccessOwn,
	},
	RoleTrader: {
		CapViewPublic:            AccessFull,
		CapProfile:               AccessOwn,
		CapWalletView:            AccessOwn,
		CapDeposit:               AccessOwn,
		CapWithdrawalRequest:     AccessOwn,
		CapRealTrading:           AccessOwn, // + status/trading_enabled/KYC gates
		CapDemoTrading:           AccessOwn,
		CapFundingReferralView:   AccessOwn,
		CapP2PTrade:              AccessFull,
		CapP2PCreatePost:         AccessFull, // fee-gated, no age/history req (REQ-116)
		CapP2PCompanyBuy:         AccessOwn,  // Level Pro only (REQ-119/120)
		CapSubmitListingOrTicket: AccessOwn,
	},
	RoleSupport: {
		CapViewPublic:    AccessFull,
		CapProfile:       AccessOwn,
		CapWalletView:    AccessReadOnly, // ticket context only
		CapP2PCompanyBuy: AccessFull,     // facilitates (REQ-123)
		CapReplyTickets:  AccessFull,
		CapManageUsers:   AccessReadOnly,
	},
	RoleFinanceOp: {
		CapViewPublic:         AccessFull,
		CapProfile:            AccessOwn,
		CapWalletView:         AccessReadOnly, // all
		CapWithdrawalApprove:  AccessFull,
		CapP2PCompanyBuy:      AccessFull,     // verifies payment
		CapViewAuditLog:       AccessReadOnly, // finance scope
		CapManualLedgerAdjust: AccessFull,     // dual control (DR-041)
	},
	RoleAdmin: {
		CapViewPublic:          AccessFull,
		CapProfile:             AccessOwn,
		CapWalletView:          AccessReadOnly, // all
		CapWithdrawalApprove:   AccessFull,     // DR-016
		CapFundingReferralView: AccessFull,
		CapP2PCompanyBuy:       AccessFull,
		CapReplyTickets:        AccessFull,
		CapManageUsers:         AccessFull,
		CapToggleTradingPerm:   AccessFull,
		CapManageMarketConfig:  AccessFull, // maker
		CapViewAuditLog:        AccessFull,
	},
	RoleSuperAdmin: {
		CapViewPublic:          AccessFull,
		CapProfile:             AccessOwn,
		CapWalletView:          AccessReadOnly, // all
		CapWithdrawalApprove:   AccessFull,
		CapFundingReferralView: AccessFull,
		CapP2PCompanyBuy:       AccessFull,
		CapReplyTickets:        AccessFull,
		CapManageUsers:         AccessFull,
		CapToggleTradingPerm:   AccessFull,
		CapManageMarketConfig:  AccessFull, // approver [REC]
		CapManageAdminsRoles:   AccessFull,
		CapViewAuditLog:        AccessFull,
		CapManualLedgerAdjust:  AccessFull,
	},
}

// AccessFor returns the breadth a role has for a capability. Unknown roles or
// capabilities default to AccessNone (default-deny).
func AccessFor(role Role, cap Capability) Access {
	if m, ok := matrix[role]; ok {
		if a, ok := m[cap]; ok {
			return a
		}
	}
	return AccessNone
}

// Can reports whether a role has any access (beyond none) to a capability.
// Callers needing breadth-specific checks (own vs read-only vs full) should use
// AccessFor directly.
func Can(role Role, cap Capability) bool {
	return AccessFor(role, cap) != AccessNone
}
