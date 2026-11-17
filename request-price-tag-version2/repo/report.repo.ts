import "server-only";
import type {
  ReportDocumentDetail,
  ReportDocumentItem,
  ReportDocumentSummary,
  ReportExportItem,
  ReportFilter,
  ReportReprintResult,
} from "@/types/report";
import type { BranchId } from "@/types/branch";

// Repository เป็นจุดรวม mock/report queries; สลับเป็นฐานข้อมูลจริงได้โดยไม่เปลี่ยน UI/API
const now = new Date();

function daysAgo(days: number) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function createItems(): ReportDocumentItem[] {
  const products = [
    { code: "29081165", name: "AIS ซิมซูเปอร์เน็ต", englishName: "AIS Sim Super Net", age: 438, price: 50 },
    { code: "88501230", name: "ชาเขียวอิชิตัน ไม่มีน้ำตาล", englishName: "Ichitan Green Tea Zero Sugar", age: 210, price: 30 },
    { code: "10830369", name: "โอวัลตินนมไมโลโปรตีน", englishName: "Ovaltine Protein Milk", age: 120, price: 25 },
  ];

  return Array.from({ length: 11 }, (_, index) => {
    const product = products[index % products.length];
    return {
      line: index + 1,
      ...product,
      quantity: index === 0 ? 4 : 1,
    };
  });
}

const documentSeeds: Array<{
  documentNumber: string;
  labels: number;
  days: number;
  user: string;
  status: ReportDocumentSummary["status"];
}> = [
  { documentNumber: "P3519L000000254", labels: 44, days: 4, user: "op108", status: "printed" },
  { documentNumber: "P3800L000000120", labels: 3, days: 4, user: "op108", status: "printed" },
  { documentNumber: "P3800L000000121", labels: 1, days: 4, user: "op108", status: "printed" },
  { documentNumber: "P3772B000001316", labels: 30, days: 4, user: "0006670", status: "pending" },
  { documentNumber: "P3650B000001213", labels: 2, days: 7, user: "op108", status: "printed" },
];

const MOCK_DOCUMENTS: ReportDocumentDetail[] = Array.from(
  { length: 142 },
  (_, index) => {
    const seed = documentSeeds[index % documentSeeds.length];
    const requestDate = daysAgo((index % 28) + 1);
    const status = seed.status;
    return {
      id: `report-doc-${index + 1}`,
      branchId: index % 2 === 0 ? "P0000" : "P0115",
      documentNumber:
        index < documentSeeds.length
          ? seed.documentNumber
          : `P${String(3650 + (index % 350)).padStart(4, "0")}B${String(index + 1).padStart(10, "0")}`,
      labels: seed.labels + (index % 4),
      requestDate,
      printDate: status === "printed" ? daysAgo(seed.days) : null,
      user: seed.user,
      status,
      items: createItems(),
    };
  },
);

/**
 * Mock repository: เปลี่ยนเฉพาะฟังก์ชันเหล่านี้เป็น query/mapping ของฐานข้อมูลจริงภายหลัง
 * โดยคง types, service, API และ hook/UI เดิมไว้ได้
 */
export async function listReportDocuments(filter: ReportFilter) {
  const normalizedQuery = filter.query.trim().toLowerCase();
  const cutoff =
    filter.period === "all"
      ? null
      : new Date(now.getTime() - Number(filter.period) * 24 * 60 * 60 * 1000);

  const filtered = MOCK_DOCUMENTS.filter((document) => {
    const matchesQuery =
      !normalizedQuery ||
      document.documentNumber.toLowerCase().includes(normalizedQuery);
    const matchesStatus =
      filter.status === "all" || document.status === filter.status;
    const matchesUser = filter.user === "all" || document.user === filter.user;
    const matchesPeriod =
      !cutoff || new Date(document.requestDate).getTime() >= cutoff.getTime();
    return (
      document.branchId === filter.branchId &&
      matchesQuery &&
      matchesStatus &&
      matchesUser &&
      matchesPeriod
    );
  }).sort((a, b) => {
    const result = a.documentNumber.localeCompare(b.documentNumber);
    return filter.sortOrder === "asc" ? result : -result;
  });

  const start = (filter.page - 1) * filter.pageSize;
  const pageItems = filtered.slice(start, start + filter.pageSize);

  return {
    branchId: filter.branchId,
    items: pageItems.map((document) => ({
      id: document.id,
      documentNumber: document.documentNumber,
      labels: document.labels,
      requestDate: document.requestDate,
      printDate: document.printDate,
      user: document.user,
      status: document.status,
    })),
    total: filtered.length,
    page: filter.page,
    pageSize: filter.pageSize,
    users: [
      ...new Set(
        MOCK_DOCUMENTS.filter(
          (document) => document.branchId === filter.branchId,
        ).map((document) => document.user),
      ),
    ].sort(),
    summary: {
      printed: filtered.filter((document) => document.status === "printed").length,
      pending: filtered.filter((document) => document.status === "pending").length,
      labels: filtered.reduce((total, document) => total + document.labels, 0),
    },
  };
}

export async function getReportDocumentById(
  id: string,
  branchId: BranchId,
): Promise<ReportDocumentDetail | null> {
  return (
    MOCK_DOCUMENTS.find(
      (document) => document.id === id && document.branchId === branchId,
    ) ?? null
  );
}

export async function exportReportDocuments(
  ids: string[],
  branchId: BranchId,
): Promise<ReportExportItem[]> {
  return ids.flatMap((id) => {
    const document = MOCK_DOCUMENTS.find(
      (item) => item.id === id && item.branchId === branchId,
    );
    if (!document) return [];
    return [{
      documentNumber: document.documentNumber,
      labels: document.labels,
      requestDate: document.requestDate,
      printDate: document.printDate,
      user: document.user,
      status: document.status,
    }];
  });
}

export async function createReportReprint(
  ids: string[],
  branchId: BranchId,
): Promise<ReportReprintResult | null> {
  const documents = ids.map((id) =>
    MOCK_DOCUMENTS.find(
      (document) => document.id === id && document.branchId === branchId,
    ),
  );
  if (documents.some((document) => !document)) return null;
  const foundDocuments = documents.filter(
    (document): document is ReportDocumentDetail => document !== undefined,
  );
  return {
    jobId: `mock-reprint-${Date.now()}`,
    documentNumbers: foundDocuments.map((document) => document.documentNumber),
    mock: true,
  };
}
