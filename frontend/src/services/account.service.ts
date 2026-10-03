// Account service — profile and security settings (REQ-007). Stub shaped for the
// documented endpoint (Sec 18.2, line 1125):
//   Auth | POST /auth/password/change | user + reauth | — | 5/hour | revoke other sessions
//
// Deliberately NOT modelled here: profile field updates. Which profile fields a user may
// edit is still open (DR-032), so there is no endpoint to stub; the page shows the
// registration identity read-only instead.

import { apiClient } from "@/lib/api/client";

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  // TODO(backend): await apiClient.post("/auth/password/change", input);
  void apiClient;
  void input;
}
