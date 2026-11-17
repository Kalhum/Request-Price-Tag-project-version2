import { apiClient } from "@/services/api-client";
import type {
  CatalogProduct,
  CatalogUploadInput,
  ProductListFilter,
  ProductListResponse,
  UpdateCatalogProductInput,
} from "@/types/product";
import type { BranchId } from "@/types/branch";

/** Service ของสินค้า: รวม URL/HTTP ให้ hook ไม่ต้องรู้รูปแบบ API */
export const productService = {
  list: (filter: ProductListFilter, signal?: AbortSignal) =>
    apiClient.get<ProductListResponse>("/api/products", {
      params: filter,
      signal,
    }),
  find: (codeOrBarcode: string, branchId: BranchId) =>
    apiClient.get<CatalogProduct>(
      `/api/products/${encodeURIComponent(codeOrBarcode)}?branchId=${branchId}`,
    ),
  update: (code: string, branchId: BranchId, input: UpdateCatalogProductInput) =>
    apiClient.patch<CatalogProduct>(
      `/api/products/${encodeURIComponent(code)}?branchId=${branchId}`,
      input,
    ),
  delete: (code: string, branchId: BranchId) =>
    apiClient.delete<{ deleted: boolean }>(
      `/api/products/${encodeURIComponent(code)}?branchId=${branchId}`,
    ),
  upload: (input: CatalogUploadInput) =>
    apiClient.post<{
      processed: boolean;
      fileName: string;
      uploadType: string;
      message: string;
    }>("/api/products/upload", input),
};
