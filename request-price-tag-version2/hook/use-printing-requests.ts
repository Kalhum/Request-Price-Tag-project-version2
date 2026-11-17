"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/services/api-client";
import { printingService } from "@/services/printing.service";
import { useBranch } from "@/components/BranchProvider";
import type {
  PrintingRequestJobInput,
  PrintingRequestJobResult,
  PrintingRequestsResponse,
} from "@/types/printing";

// Hook จัดการ state ของรายการคำร้องพิมพ์และการสร้าง print job
export function usePrintingRequests() {
  const { branchId, isReady } = useBranch();
  const [data, setData] = useState<PrintingRequestsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printLoading, setPrintLoading] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    const controller = new AbortController();
    printingService
      .listRequests(branchId, controller.signal)
      .then(setData)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(cause, "โหลดรายการพิมพ์ไม่สำเร็จ"));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [branchId, isReady]);

  async function createPrintJob(
    input: Omit<PrintingRequestJobInput, "branchId">,
  ): Promise<PrintingRequestJobResult | null> {
    setPrintLoading(true);
    setPrintError(null);
    try {
      return await printingService.printRequests({ ...input, branchId });
    } catch (cause) {
      setPrintError(getErrorMessage(cause, "เตรียมพิมพ์เอกสารไม่สำเร็จ"));
      return null;
    } finally {
      setPrintLoading(false);
    }
  }

  return {
    branchId,
    isReady,
    data: data?.branchId === branchId ? data : null,
    loading: loading || (isReady && data?.branchId !== branchId),
    error,
    printLoading,
    printError,
    createPrintJob,
  };
}
