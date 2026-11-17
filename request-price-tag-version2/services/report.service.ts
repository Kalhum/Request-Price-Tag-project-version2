import { apiClient } from "@/services/api-client";
import type {
  ReportDocumentDetail,
  ReportExportItem,
  ReportFilter,
  ReportListResponse,
  ReportReprintResult,
} from "@/types/report";
import type { BranchId } from "@/types/branch";

const ENDPOINT = "/api/reports";

export function fetchReportDocuments(
  filter: ReportFilter,
  signal?: AbortSignal,
) {
  return apiClient.get<ReportListResponse>(ENDPOINT, {
    params: filter,
    signal,
  });
}

export function fetchReportDocumentById(
  id: string,
  branchId: BranchId,
  signal?: AbortSignal,
) {
  return apiClient.get<ReportDocumentDetail>(
    `${ENDPOINT}/${encodeURIComponent(id)}?branchId=${branchId}`,
    { signal },
  );
}

export function exportReportDocuments(ids: string[], branchId: BranchId) {
  return apiClient.post<ReportExportItem[]>("/api/reports/export", {
    ids,
    branchId,
  });
}

export function createReportReprint(ids: string[], branchId: BranchId) {
  return apiClient.post<ReportReprintResult>("/api/reports/reprint", {
    ids,
    branchId,
  });
}

export const reportService = {
  list: fetchReportDocuments,
  getById: fetchReportDocumentById,
  export: exportReportDocuments,
  reprint: createReportReprint,
};
