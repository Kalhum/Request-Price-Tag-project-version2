import type { CatalogProduct } from "@/types/product";
import type { BranchId } from "@/types/branch";

/** ข้อมูลที่ใช้ค้นหาสินค้าและสร้างคำร้องขอป้ายราคา */
export type PriceRequestInput = {
  branchId: BranchId;
  barcode: string;
};

export type UploadedRequestInput = {
  fileName: string;
  fileSize: number;
};

/** ผลตอบกลับเมื่อสร้างคำร้อง mock สำเร็จ */
export type PriceRequestResult = {
  requestId: string;
  documentNumber: string;
  product: CatalogProduct;
  status: "pending";
  mock: true;
};
