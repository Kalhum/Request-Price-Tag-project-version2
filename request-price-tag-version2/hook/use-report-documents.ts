"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/services/api-client";
import { reportService } from "@/services/report.service";
import { useBranch } from "@/components/BranchProvider";
import { DEFAULT_BRANCH_ID } from "@/types/branch";
import type { BranchId } from "@/types/branch";
import type {
  ReportDocumentDetail,
  ReportFilter,
  ReportListResponse,
} from "@/types/report";

const INITIAL_FILTER: ReportFilter = {
  branchId: DEFAULT_BRANCH_ID,
  query: "",
  period: "30",
  status: "all",
  user: "all",
  page: 1,
  pageSize: 15,
  sortOrder: "asc",
};

// Hook ประสาน filters, loading/error และ actions ของหน้า Report ผ่าน reportService
export function useReportDocuments() {
  const { branchId, isReady } = useBranch();
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [data, setData] = useState<ReportListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedByBranch, setSelectedByBranch] = useState<
    Partial<Record<BranchId, string[]>>
  >({});
  const selectedIds = selectedByBranch[branchId] ?? [];
  const setSelectedIds = useCallback(
    (update: string[] | ((current: string[]) => string[])) => {
      setSelectedByBranch((current) => {
        const currentIds = current[branchId] ?? [];
        return {
          ...current,
          [branchId]:
            typeof update === "function" ? update(currentIds) : update,
        };
      });
    },
    [branchId],
  );
  const [activeByBranch, setActiveByBranch] = useState<
    Partial<Record<BranchId, ReportDocumentDetail | null>>
  >({});
  const activeDocument = activeByBranch[branchId] ?? null;
  const setActiveDocument = useCallback(
    (document: ReportDocumentDetail | null) =>
      setActiveByBranch((current) => ({ ...current, [branchId]: document })),
    [branchId],
  );
  const [detailLoadingByBranch, setDetailLoadingByBranch] = useState<
    Partial<Record<BranchId, boolean>>
  >({});
  const detailLoading = detailLoadingByBranch[branchId] ?? false;
  const setDetailLoading = useCallback(
    (loading: boolean) =>
      setDetailLoadingByBranch((current) => ({
        ...current,
        [branchId]: loading,
      })),
    [branchId],
  );
  const [detailErrorsByBranch, setDetailErrorsByBranch] = useState<
    Partial<Record<BranchId, string | null>>
  >({});
  const detailError = detailErrorsByBranch[branchId] ?? null;
  const setDetailError = useCallback(
    (message: string | null) =>
      setDetailErrorsByBranch((current) => ({
        ...current,
        [branchId]: message,
      })),
    [branchId],
  );
  const detailController = useRef<AbortController | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    const controller = new AbortController();

    reportService
      .list({ ...filter, branchId }, controller.signal)
      .then((result) => {
        setData(result);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(cause, "โหลดรายการเอกสารไม่สำเร็จ"));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [branchId, filter, isReady]);

  const updateFilter = useCallback(
    <K extends keyof ReportFilter>(key: K, value: ReportFilter[K]) => {
      setLoading(true);
      setError(null);
      setFilter((current) => ({
        ...current,
        [key]: value,
        page: key === "page" && typeof value === "number" ? value : 1,
      }));
      if (key !== "page") setSelectedIds([]);
    },
    [setSelectedIds],
  );

  const resetFilters = useCallback(() => {
    setLoading(true);
    setError(null);
    setFilter(INITIAL_FILTER);
    setSelectedIds([]);
  }, [setSelectedIds]);

  const openDetails = useCallback(async (id: string) => {
    detailController.current?.abort();
    const controller = new AbortController();
    detailController.current = controller;
    setActiveDocument(null);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const document = await reportService.getById(
        id,
        branchId,
        controller.signal,
      );
      if (!controller.signal.aborted) setActiveDocument(document);
    } catch (cause) {
      if (!controller.signal.aborted) {
        setDetailError(
          getErrorMessage(cause, "โหลดรายละเอียดเอกสารไม่สำเร็จ"),
        );
      }
    } finally {
      if (!controller.signal.aborted) setDetailLoading(false);
    }
  }, [branchId, setActiveDocument, setDetailError, setDetailLoading]);

  const closeDetails = useCallback(() => {
    detailController.current?.abort();
    detailController.current = null;
    setActiveDocument(null);
    setDetailLoading(false);
    setDetailError(null);
  }, [setActiveDocument, setDetailError, setDetailLoading]);

  const exportSelected = useCallback(async (ids: string[]) => {
    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);
    try {
      return await reportService.export(ids, branchId);
    } catch (cause) {
      setActionError(getErrorMessage(cause, "ส่งออกเอกสารไม่สำเร็จ"));
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [branchId]);

  const reprintSelected = useCallback(async (ids: string[]) => {
    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const result = await reportService.reprint(ids, branchId);
      setActionMessage(`สร้างงานพิมพ์ซ้ำตัวอย่าง ${result.jobId} แล้ว`);
      return result;
    } catch (cause) {
      setActionError(getErrorMessage(cause, "สร้างงานพิมพ์ซ้ำไม่สำเร็จ"));
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [branchId]);

  return {
    filter,
    updateFilter,
    resetFilters,
    data: data?.branchId === branchId ? data : null,
    loading: loading || (!error && data?.branchId !== branchId),
    error,
    selectedIds,
    setSelectedIds,
    activeDocument,
    detailLoading,
    detailError,
    actionLoading,
    actionError,
    actionMessage,
    openDetails,
    closeDetails,
    exportSelected,
    reprintSelected,
  };
}
