import type { BranchId } from "@/types/branch";

/** โมเดลที่เกี่ยวข้องกับคำร้องรอพิมพ์และงานพิมพ์ */
export type PrintingRequest = {
  id: string;
  documentNumber: string;
  quantity: number;
  date: string;
  branchId: BranchId;
};

export type PrintingSummary = {
  branches: number;
  requests: number;
  labels: number;
};

export type PrintingProduct = {
  barcode: string;
  english: string;
  name: string;
  price: number;
  days: string;
  itemCode: string;
};

export type PrintingRequestsResponse = {
  branchId: BranchId;
  requests: PrintingRequest[];
  summary: PrintingSummary;
  previewProducts: PrintingProduct[];
};

export type PrintingRequestJobInput = {
  branchId: BranchId;
  requestIds: string[];
  copies: number;
  printer: string;
};

export type PrintingRequestJobResult = {
  jobId: string;
  requestCount: number;
  copies: number;
  mock: true;
};

export type PrintingCategory = {
  id: string;
  name: string;
};

export type PrintingCategoriesResponse = {
  branchId: BranchId;
  categories: PrintingCategory[];
  defaultCategoryIds: string[];
  previewProducts: PrintingProduct[];
};

export type PrintingCategoryUploadInput = {
  fileName: string;
  fileSize: number;
};

export type PrintingJobInput = {
  branchId: BranchId;
  categoryIds: string[];
  branchMode: "none" | "branch";
  branchCode?: string;
  englishEnabled: boolean;
  englishText?: string;
};

export type PrintingJobResult = {
  jobId: string;
  documentNumber: string;
  productCount: number;
  mock: true;
};
