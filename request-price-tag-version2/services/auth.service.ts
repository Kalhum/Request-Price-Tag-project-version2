import { apiClient } from "@/services/api-client";
import type { LoginInput, LoginUser } from "@/types/auth";

/** Service ของการยืนยันตัวตน; จัดการการเรียก login API เท่านั้น */
export function authenticate(input: LoginInput) {
  return apiClient.post<LoginUser>("/api/auth/login", input);
}
