import { apiClient } from "@/services/api-client";
import type {
  PriceRequestInput,
  PriceRequestResult,
  UploadedRequestInput,
} from "@/types/request";

/** Service ของคำร้อง: ใช้โดยหน้า Create Request และซ่อน HTTP/API response ไว้ */
export const requestService = {
  create: (input: PriceRequestInput) =>
    apiClient.post<PriceRequestResult>("/api/requests", input),
  upload: (input: UploadedRequestInput) =>
    apiClient.post<{
      accepted: boolean;
      mock: boolean;
      fileName: string;
      message: string;
    }>("/api/requests/upload", input),
};
