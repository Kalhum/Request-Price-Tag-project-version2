"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/services/api-client";
import { productService } from "@/services/product.service";
import { useBranch } from "@/components/BranchProvider";
import type { BranchId } from "@/types/branch";
import type {
  ProductCategoryFilter,
  ProductListFilter,
  ProductListResponse,
  ProductSortKey,
  SortOrder,
} from "@/types/product";

// Hook รวม state/การกระทำของหน้าจัดการสินค้า โดยส่งงาน HTTP ให้ productService
export function useProductCatalog() {
  const { branchId, isReady } = useBranch();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategoryFilter>("all");
  const [sortBy, setSortBy] = useState<ProductSortKey>("code");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [pagesByBranch, setPagesByBranch] = useState<
    Partial<Record<BranchId, number>>
  >({});
  const page = pagesByBranch[branchId] ?? 1;
  const setPage = useCallback(
    (value: number) =>
      setPagesByBranch((current) => ({ ...current, [branchId]: value })),
    [branchId],
  );
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mutationLoading, setMutationLoading] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    const controller = new AbortController();
    productService
      .list(
        { branchId, query, category, sortBy, sortOrder, page, pageSize: 20 } satisfies ProductListFilter,
        controller.signal,
      )
      .then(setData)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(cause, "โหลดรายการสินค้าไม่สำเร็จ"));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [branchId, category, isReady, page, query, sortBy, sortOrder, refreshKey]);

  const updateQuery = useCallback((value: string) => {
    setLoading(true);
    setError(null);
    setQuery(value);
    setPage(1);
  }, [setPage]);

  const updateCategory = useCallback((value: ProductCategoryFilter) => {
    setLoading(true);
    setError(null);
    setCategory(value);
    setPage(1);
  }, [setPage]);

  const toggleSort = useCallback((key: ProductSortKey) => {
    setLoading(true);
    setError(null);
    if (sortBy === key) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  }, [sortBy]);

  const updatePage = useCallback((value: number) => {
    setLoading(true);
    setError(null);
    setPage(value);
  }, [setPage]);

  const uploadFile = useCallback(async (file: File, uploadType: "sku" | "function") => {
    setUploadLoading(true);
    setUploadMessage(null);
    setError(null);
    try {
      const result = await productService.upload({
        fileName: file.name,
        fileSize: file.size,
        uploadType,
      });
      setUploadMessage(result.message);
    } catch (cause) {
      setError(getErrorMessage(cause, "อัปโหลดไฟล์ไม่สำเร็จ"));
    } finally {
      setUploadLoading(false);
    }
  }, []);

  const updateProduct = useCallback(
    async (code: string, nextCategory: "Core SKU" | "Optional SKU") => {
      setMutationLoading(true);
      setError(null);
      try {
        await productService.update(code, branchId, { category: nextCategory });
        setRefreshKey((current) => current + 1);
        return true;
      } catch (cause) {
        setError(getErrorMessage(cause, "แก้ไขประเภทสินค้าไม่สำเร็จ"));
        return false;
      } finally {
        setMutationLoading(false);
      }
    },
    [branchId],
  );

  const deleteProduct = useCallback(async (code: string) => {
    setMutationLoading(true);
    setError(null);
    try {
      await productService.delete(code, branchId);
      setRefreshKey((current) => current + 1);
      return true;
    } catch (cause) {
      setError(getErrorMessage(cause, "ลบสินค้าไม่สำเร็จ"));
      return false;
    } finally {
      setMutationLoading(false);
    }
  }, [branchId]);

  return {
    query,
    category,
    sortBy,
    sortOrder,
    page,
    data: data?.branchId === branchId ? data : null,
    loading: loading || (!error && data?.branchId !== branchId),
    error,
    uploadLoading,
    uploadMessage,
    mutationLoading,
    updateQuery,
    updateCategory,
    toggleSort,
    updatePage,
    uploadFile,
    updateProduct,
    deleteProduct,
  };
}
