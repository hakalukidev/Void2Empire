package rbac

import "testing"

func TestAccessFor(t *testing.T) {
	cases := []struct {
		role Role
		cap  Capability
		want Access
	}{
		// Guest: public + register only.
		{RoleGuest, CapViewPublic, AccessFull},
		{RoleGuest, CapRegisterLogin, AccessFull},
		{RoleGuest, CapWalletView, AccessNone},
		{RoleGuest, CapRealTrading, AccessNone},

		// User: own wallet, demo, P2P trade; cannot approve withdrawals or trade real.
		{RoleUser, CapWalletView, AccessOwn},
		{RoleUser, CapDemoTrading, AccessOwn},
		{RoleUser, CapP2PTrade, AccessFull},
		{RoleUser, CapRealTrading, AccessNone},
		{RoleUser, CapWithdrawalApprove, AccessNone},

		// Trader: real trading is own-scope (gated further at service layer).
		{RoleTrader, CapRealTrading, AccessOwn},
		{RoleTrader, CapP2PCreatePost, AccessFull},

		// Support: read-only wallet, replies tickets, cannot toggle trading perm.
		{RoleSupport, CapWalletView, AccessReadOnly},
		{RoleSupport, CapReplyTickets, AccessFull},
		{RoleSupport, CapManageUsers, AccessReadOnly},
		{RoleSupport, CapToggleTradingPerm, AccessNone},
		{RoleSupport, CapWithdrawalApprove, AccessNone},

		// Finance Op: approves withdrawals, manual ledger adjust, no user management.
		{RoleFinanceOp, CapWithdrawalApprove, AccessFull},
		{RoleFinanceOp, CapManualLedgerAdjust, AccessFull},
		{RoleFinanceOp, CapViewAuditLog, AccessReadOnly},
		{RoleFinanceOp, CapManageUsers, AccessNone},
		{RoleFinanceOp, CapToggleTradingPerm, AccessNone},

		// Admin: manages users/config, approves withdrawals, but NOT manual ledger
		// adjustment (matrix gives that to Finance Op + Super Admin only) and NOT
		// admin/role management.
		{RoleAdmin, CapManageUsers, AccessFull},
		{RoleAdmin, CapToggleTradingPerm, AccessFull},
		{RoleAdmin, CapManageMarketConfig, AccessFull},
		{RoleAdmin, CapWithdrawalApprove, AccessFull},
		{RoleAdmin, CapManualLedgerAdjust, AccessNone},
		{RoleAdmin, CapManageAdminsRoles, AccessNone},

		// Super Admin: everything including admin/role management + ledger adjust.
		{RoleSuperAdmin, CapManageAdminsRoles, AccessFull},
		{RoleSuperAdmin, CapManualLedgerAdjust, AccessFull},

		// Unknown role/capability default-deny.
		{Role("unknown"), CapViewPublic, AccessNone},
		{RoleAdmin, Capability("unknown_cap"), AccessNone},
	}
	for _, tc := range cases {
		if got := AccessFor(tc.role, tc.cap); got != tc.want {
			t.Errorf("AccessFor(%q,%q) = %d, want %d", tc.role, tc.cap, got, tc.want)
		}
	}
}

func TestCan(t *testing.T) {
	if !Can(RoleUser, CapWalletView) {
		t.Error("user should have some wallet access")
	}
	if Can(RoleUser, CapWithdrawalApprove) {
		t.Error("user must not approve withdrawals")
	}
	if Can(RoleGuest, CapRealTrading) {
		t.Error("guest must not trade")
	}
	if Can(RoleAdmin, CapManualLedgerAdjust) {
		t.Error("admin must not have manual ledger adjustment (finance/super only)")
	}
}
