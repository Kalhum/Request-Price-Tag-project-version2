/**
 * ไฟล์นี้ Re-export จาก `@/services/api-client` เพื่อความเข้ากันได้ย้อนหลัง (Backward Compatibility)
 *
 * คำแนะนำสำหรับทีม:
 * - ในโค้ดใหม่ แนะนำให้ import `apiClient`, `apiFetch`, `getErrorMessage` จาก `@/services/api-client` ที่เดียวได้เลย
 */
export {
  ApiClient,
  ApiClientError,
  apiClient,
  apiFetch,
  buildUrlWithParams,
  getErrorMessage,
  getFullPath,
  type ApiClientOptions,
  type ApiClientRequestInit,
  type QueryParams,
  type QueryParamValue,
} from "./api-client";
