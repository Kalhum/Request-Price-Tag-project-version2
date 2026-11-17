import type { BranchId } from "@/types/branch";

/** ประเภทของ SKU ที่ใช้ในหน้าจัดการสินค้าและการแสดงป้าย */
export type ProductCategory = "Core SKU" | "Optional SKU";
export type ProductCategoryFilter = "all" | ProductCategory;
export type ProductSortKey = "code" | "name" | "category";
export type SortOrder = "asc" | "desc";

/** ข้อมูลสินค้า (model) ที่ repository, API, service และ UI ใช้ร่วมกัน */
export type CatalogProduct = {
  branchId: BranchId;
  code: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  age: number;
};

/** เงื่อนไขค้นหาและแบ่งหน้ารายการสินค้า */
export type ProductListFilter = {
  branchId: BranchId;
  query: string;
  category: ProductCategoryFilter;
  sortBy: ProductSortKey;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
};

/** ผลลัพธ์รายการสินค้าพร้อม metadata สำหรับ pagination */
export type ProductListResponse = {
  branchId: BranchId;
  items: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
};

/** ข้อมูลที่หน้า UI ส่งมาเมื่อขอ mock upload หรือแก้ประเภทสินค้า */
export type CatalogUploadInput = {
  fileName: string;
  fileSize: number;
  uploadType: "sku" | "function";
};

export type CatalogUploadResult = {
  processed: false;
  message: string;
};

export type UpdateCatalogProductInput = {
  category: ProductCategory;
};
