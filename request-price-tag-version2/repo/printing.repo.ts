import "server-only";
import type {
  PrintingCategoriesResponse,
  PrintingCategoryUploadInput,
  PrintingJobInput,
  PrintingJobResult,
  PrintingProduct,
  PrintingRequest,
  PrintingRequestJobInput,
  PrintingRequestJobResult,
  PrintingRequestsResponse,
} from "@/types/printing";
import type { BranchId } from "@/types/branch";

// Mock fixtures ของงานพิมพ์/สาขา/หมวดหมู่; เป็นขอบเขตเดียวที่ต้องเปลี่ยนเมื่อเชื่อม DB
const PREVIEW_PRODUCTS: PrintingProduct[] = [
  { barcode: "8859473101316", english: "Sunshine Dairy High Protein Butter Scotch 340 ml.", name: "ซันชายน์เดรี่ นมโปรตีนกลิ่นบัตเตอร์สก็อตช์ 340มล.", price: 49, days: "14 D", itemCode: "17270144" },
  { barcode: "8859473101514", english: "V Farm Corn Milk Original 280ml.", name: "วีฟาร์ม น้ำนมข้าวโพดสูตรธรรมชาติ 280มล.", price: 35, days: "11 D", itemCode: "21410055" },
  { barcode: "8852371970046", english: "Milk Plus High Protein Choco Lactose Free 400ml.", name: "มิลค์พลัส นมพาสเจอร์ไรส์โปรตีนสูง", price: 59, days: "18 D", itemCode: "28150039" },
];

const MOCK_REQUESTS: PrintingRequest[] = Array.from(
  { length: 14 },
  (_, index) => {
    const branchId = index % 2 === 0 ? "P0115" : "P0000";
    return {
      id: `request-${index + 1}`,
      documentNumber:
        index === 0
          ? "P0115L000002679"
          : `${branchId}L000002${String(679 + index).padStart(3, "0")}`,
      quantity: index === 0 ? 319 : 1 + (index % 30),
      date: "2026-10-05T00:00:00.000Z",
      branchId,
    };
  },
);

const CATEGORY_NAMES = [
  "I-เครื่องดื่ม น้ำดื่ม",
  "J-SKUs เลิกขาย",
  "3-ขนมขบเคี้ยว",
  "6-เครื่องสำอาง ประทินโฉม",
  "L-น้ำแข็งยูนิต (DIRECT)",
  "P-พรีเมียม",
  "F-ไดโซ",
  "5-ของใช้ประจำบ้าน",
  "7-เครื่องแต่งกาย อาหารสัตว์ ยา",
  "8-สินค้ามีแอลกอฮอล์(LIQUOR)",
  "K-KONICA",
  "E-วัตถุดิบใช้ไป",
  "M-ฟาสต์ฟู้ดอินกรีเดียน",
  "1-DFL",
  "C-บุหรี่ (CIGARETTE)",
  "A-แพ็คใหญ่ซื้อกลับบ้าน",
  "B-ราคาสุดพิเศษ",
];

/** รายการคำร้องที่รอพิมพ์และสรุปภาพรวมตามสาขา */
export async function listPrintingRequests(
  branchId: BranchId,
): Promise<PrintingRequestsResponse> {
  const requests = MOCK_REQUESTS.filter(
    (request) => request.branchId === branchId,
  );
  return {
    branchId,
    requests,
    summary: {
      branches: 1,
      requests: requests.length,
      labels: requests.reduce((total, request) => total + request.quantity, 0),
    },
    previewProducts: PREVIEW_PRODUCTS,
  };
}

/** สร้าง mock print job สำหรับคำร้องที่เลือก ไม่ได้ส่งคำสั่งไปยังเครื่องพิมพ์ */
export async function createPrintingRequestJob(
  input: PrintingRequestJobInput,
): Promise<PrintingRequestJobResult | null> {
  const found = input.requestIds.every((id) =>
    MOCK_REQUESTS.some(
      (request) =>
        request.id === id && request.branchId === input.branchId,
    ),
  );
  if (!found) return null;
  return {
    jobId: `mock-print-${Date.now()}`,
    requestCount: input.requestIds.length,
    copies: input.copies,
    mock: true,
  };
}

/** รายการหมวดหมู่และตัวอย่างสินค้าเริ่มต้นสำหรับหน้าพิมพ์ตามหมวด */
export async function getPrintingCategories(
  branchId: BranchId,
): Promise<PrintingCategoriesResponse> {
  return {
    branchId,
    categories: CATEGORY_NAMES.map((name, index) => ({
      id: `category-${index + 1}`,
      name,
    })),
    defaultCategoryIds: ["category-1", "category-2", "category-4"],
    previewProducts: PREVIEW_PRODUCTS,
  };
}

/** รับ metadata ไฟล์ไว้ทดสอบเท่านั้น ยังไม่ประมวลผลไฟล์ */
export async function acceptPrintingCategoryUpload(
  input: PrintingCategoryUploadInput,
) {
  return {
    processed: false as const,
    fileName: input.fileName,
    message:
      "รับข้อมูลไฟล์สำหรับทดสอบแล้ว แต่ยังไม่ได้อัปโหลดหรือประมวลผลรายการป้าย",
  };
}

/** สร้าง mock งานพิมพ์ตามหมวดหมู่; เปลี่ยนเป็นบันทึก job ในฐานข้อมูลภายหลัง */
export async function createPrintingJob(
  input: PrintingJobInput,
): Promise<PrintingJobResult> {
  return {
    jobId: `mock-job-${Date.now()}`,
    documentNumber: `${input.branchId}L${String(Date.now()).slice(-9)}`,
    productCount: input.categoryIds.length * PREVIEW_PRODUCTS.length,
    mock: true,
  };
}
