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
