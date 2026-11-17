import "server-only";
import { findProduct } from "@/repo/product.repo";
import type {
  PriceRequestInput,
  PriceRequestResult,
  UploadedRequestInput,
} from "@/types/request";

/**
 * Repository ของคำร้องขอราคา
 * ตอนนี้สร้างผลลัพธ์ mock จากสินค้าใน product repository; ต่อไปเปลี่ยนเป็น INSERT/query DB ที่นี่
 */
export async function createPriceRequest(
  input: PriceRequestInput,
): Promise<PriceRequestResult | null> {
  const product = await findProduct(input.barcode, input.branchId);
  if (!product) return null;
  return {
    requestId: `mock-request-${Date.now()}`,
    documentNumber: `${input.branchId}L${String(Date.now()).slice(-9)}`,
    product,
    status: "pending",
    mock: true,
  };
}

/** รับข้อมูลกำกับไฟล์เท่านั้น; ไม่ได้อัปโหลดหรือ parse binary ใน mock mode */
export async function acceptRequestUpload(input: UploadedRequestInput) {
  return {
    accepted: false,
    mock: true as const,
    fileName: input.fileName,
    message:
      "ได้รับข้อมูลไฟล์สำหรับทดสอบแล้ว แต่ยังไม่ได้ประมวลผลไฟล์หรือบันทึกคำร้อง",
  };
}
