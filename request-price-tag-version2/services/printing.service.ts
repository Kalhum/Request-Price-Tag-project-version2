import { apiClient } from "@/services/api-client";
import type {
  PrintingCategoriesResponse,
  PrintingCategoryUploadInput,
  PrintingJobInput,
  PrintingJobResult,
  PrintingRequestJobInput,
  PrintingRequestJobResult,
  PrintingRequestsResponse,
} from "@/types/printing";
import type { BranchId } from "@/types/branch";

/** Service ของการพิมพ์: เรียก API สำหรับคำร้องพิมพ์ หมวดหมู่ และ print job */
export const printingService = {
  listRequests: (branchId: BranchId, signal?: AbortSignal) =>
    apiClient.get<PrintingRequestsResponse>("/api/printing/requests", {
      params: { branchId },
      signal,
    }),
  printRequests: (input: PrintingRequestJobInput) =>
    apiClient.post<PrintingRequestJobResult>(
      "/api/printing/requests/print",
      input,
    ),
  getCategories: (branchId: BranchId, signal?: AbortSignal) =>
    apiClient.get<PrintingCategoriesResponse>(`/api/printing/categories?branchId=${branchId}`, {
      signal,
    }),
  uploadCategories: (input: PrintingCategoryUploadInput) =>
    apiClient.post<{
      processed: boolean;
      fileName: string;
      message: string;
    }>("/api/printing/categories/upload", input),
  createJob: (input: PrintingJobInput) =>
    apiClient.post<PrintingJobResult>("/api/printing/jobs", input),
};
