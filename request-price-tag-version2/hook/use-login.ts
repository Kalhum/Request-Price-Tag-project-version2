"use client";

import { useState } from "react";
import { getErrorMessage } from "@/services/api-client";
import { authenticate } from "@/services/auth.service";
import type { LoginUser } from "@/types/auth";

// Hook เก็บสถานะฟอร์ม login และผลการยืนยันตัวตนที่ได้จาก authService
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<LoginUser | null>(null);
  const clearError = () => setError(null);

  async function login(username: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const authenticatedUser = await authenticate({
        username,
        password,
      });
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (cause) {
      setError(getErrorMessage(cause, "เข้าสู่ระบบไม่สำเร็จ"));
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, user, login, clearError };
}
