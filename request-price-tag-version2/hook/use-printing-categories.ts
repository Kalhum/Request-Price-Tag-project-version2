"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/services/api-client";
import { printingService } from "@/services/printing.service";
import { useBranch } from "@/components/BranchProvider";
import type {
  PrintingCategoriesResponse,
  PrintingJobInput,
  PrintingJobResult,
} from "@/types/printing";

// Hook จัดการข้อมูลหมวดหมู่ การอัปโหลด metadata และการสั่งสร้างงานพิมพ์
export function usePrintingCategories() {
  const { branchId, isReady } = useBranch();
  const [data, setData] = useState<PrintingCategoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    const controller = new AbortController();
    printingService
      .getCategories(branchId, controller.signal)
      .then(setData)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(cause, "โหลดหมวดหมู่ไม่สำเร็จ"));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [branchId, isReady]);

  async function createJob(
    input: Omit<PrintingJobInput, "branchId">,
  ): Promise<PrintingJobResult | null> {
    setJobLoading(true);
    setJobError(null);
    try {
      return await printingService.createJob({ ...input, branchId });
    } catch (cause) {
      setJobError(getErrorMessage(cause, "สร้างรายการพิมพ์ไม่สำเร็จ"));
      return null;
    } finally {
      setJobLoading(false);
    }
  }

  async function uploadFile(file: File) {
    setUploadLoading(true);
    setUploadMessage(null);
    setError(null);
    try {
      const result = await printingService.uploadCategories({
        fileName: file.name,
        fileSize: file.size,
      });
      setUploadMessage(result.message);
    } catch (cause) {
      setError(getErrorMessage(cause, "อัปโหลดไฟล์ไม่สำเร็จ"));
    } finally {
      setUploadLoading(false);
    }
  }

  return {
    data: data?.branchId === branchId ? data : null,
    branchId,
    loading: loading || (isReady && data?.branchId !== branchId),
    error,
    jobLoading,
    jobError,
    uploadLoading,
    uploadMessage,
    createJob,
    uploadFile,
  };
}
