import { apiClient } from "@/lib/api/client";
import type { LoginInput, RegisterInput } from "@/lib/validators/auth";
import type { User } from "@/types";

export async function registerUser(input: Omit<RegisterInput, "confirmPassword">) {
  const { data } = await apiClient.post<User>("/auth/register", input);
  return data;
}

export async function loginUser(input: LoginInput) {
  const { data } = await apiClient.post<User>("/auth/login", input);
  return data;
}

export async function logoutUser() {
  await apiClient.post("/auth/logout");
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

// REQ-008 — email verification via 6-digit OTP (documented endpoint, Sec 18.2).
export async function verifyEmail(input: { email: string; code: string }) {
  const { data } = await apiClient.post<User>("/auth/verify-email", input);
  return data;
}

export async function resendVerificationCode(email: string) {
  await apiClient.post("/auth/verify-email/resend", { email });
}

// REQ-009 — password reset. Responses are enumeration-safe by design.
export async function requestPasswordReset(email: string) {
  await apiClient.post("/auth/password/forgot", { email });
}

export async function resetPassword(input: { token: string; password: string }) {
  await apiClient.post("/auth/password/reset", input);
}
