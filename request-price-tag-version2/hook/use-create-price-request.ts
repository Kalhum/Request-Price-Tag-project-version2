"use client";

import { useState } from "react";
import { ApiClientError, getErrorMessage } from "@/services/api-client";
import { productService } from "@/services/product.service";
import { requestService } from "@/services/request.service";
import { useBranch } from "@/components/BranchProvider";
import type { BranchId } from "@/types/branch";
import type { CatalogProduct } from "@/types/product";
import type { PriceRequestResult } from "@/types/request";

// Hook ประสานการค้นหาสินค้าและสร้างคำร้องระหว่าง UI กับ services ของแต่ละโดเมน
export function useCreatePriceRequest() {
  const { branchId } = useBranch();
  const [productState, setProductState] = useState<{
    branchId: BranchId;
    product: CatalogProduct | null;
  } | null>(null);
  const product =
    productState?.branchId === branchId ? productState.product : null;
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function searchProduct(barcode: string) {
    setSearchLoading(true);
    setError(null);
    setMessage(null);
    try {
      setProductState({
        branchId,
        product: await productService.find(barcode, branchId),
      });
    } catch (cause) {
      setProductState({ branchId, product: null });
      if (!(cause instanceof ApiClientError && cause.status === 404)) {
        setError(getErrorMessage(cause, "ค้นหาสินค้าไม่สำเร็จ"));
      }
    } finally {
      setSearchLoading(false);
    }
  }

  async function submitRequest(barcode: string): Promise<PriceRequestResult | null> {
    setRequestLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await requestService.create({ barcode, branchId });
      setMessage(`สร้างคำร้องตัวอย่าง ${result.documentNumber} แล้ว`);
      return result;
    } catch (cause) {
      setError(getErrorMessage(cause, "สร้างคำร้องไม่สำเร็จ"));
      return null;
    } finally {
      setRequestLoading(false);
    }
  }

  async function uploadFile(file: File) {
    setRequestLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await requestService.upload({
        fileName: file.name,
        fileSize: file.size,
      });
      setMessage(result.message);
    } catch (cause) {
      setError(getErrorMessage(cause, "อัปโหลดไฟล์ไม่สำเร็จ"));
    } finally {
      setRequestLoading(false);
    }
  }

  return {
    product,
    searchLoading,
    requestLoading,
    error,
    message,
    searchProduct,
    submitRequest,
    uploadFile,
  };
}
