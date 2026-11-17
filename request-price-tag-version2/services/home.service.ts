import { apiClient } from "@/services/api-client";
import type { HomeContent } from "@/types/home";
import type { BranchId } from "@/types/branch";

/** Service ของ Home: รับผิดชอบเรียก HTTP API และแปลง response เป็น HomeContent */
export function fetchHomeContent(branchId: BranchId, signal?: AbortSignal) {
  return apiClient.get<HomeContent>(`/api/home?branchId=${branchId}`, { signal });
}
