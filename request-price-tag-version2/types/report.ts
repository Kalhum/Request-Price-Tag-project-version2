import type { BranchId } from "@/types/branch";

export type ReportDocumentStatus = "printed" | "pending";
export type ReportStatusFilter = "all" | ReportDocumentStatus;
export type ReportPeriod = "7" | "30" | "90" | "all";
export type ReportSortOrder = "asc" | "desc";

export type ReportDocumentSummary = {
  id: string;
  documentNumber: string;
  labels: number;
  requestDate: string;
  printDate: string | null;
  user: string;
  status: ReportDocumentStatus;
};

export type ReportDocumentItem = {
  line: number;
  code: string;
  name: string;
  englishName: string;
  age: number;
  price: number;
  quantity: number;
};

export type ReportDocumentDetail = ReportDocumentSummary & {
  branchId: BranchId;
  items: ReportDocumentItem[];
};

export type ReportFilter = {
  branchId: BranchId;
  query: string;
  period: ReportPeriod;
  status: ReportStatusFilter;
  user: string;
  page: number;
  pageSize: number;
  sortOrder: ReportSortOrder;
};

export type ReportListResponse = {
  branchId: BranchId;
  items: ReportDocumentSummary[];
  total: number;
  page: number;
  pageSize: number;
  users: string[];
  summary: {
    printed: number;
    pending: number;
    labels: number;
  };
};

export type ReportExportItem = Omit<ReportDocumentSummary, "id">;

export type ReportReprintResult = {
  jobId: string;
  documentNumbers: string[];
  mock: true;
};
