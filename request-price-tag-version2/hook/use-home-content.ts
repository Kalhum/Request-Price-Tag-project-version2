"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/services/api-client";
import { fetchHomeContent } from "@/services/home.service";
import type { HomeContent } from "@/types/home";
import { useBranch } from "@/components/BranchProvider";

// Hook ดูแล loading/error ของหน้า Home และเรียก service เพื่อโหลดข้อมูล
export function useHomeContent() {
  const { branchId, isReady } = useBranch();
  const [data, setData] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    const controller = new AbortController();
    fetchHomeContent(branchId, controller.signal)
      .then(setData)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(cause, "โหลดหน้า Home ไม่สำเร็จ"));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [branchId, isReady]);

  return {
    data: data?.priceTag.branch === branchId ? data : null,
    loading,
    error,
  };
}
