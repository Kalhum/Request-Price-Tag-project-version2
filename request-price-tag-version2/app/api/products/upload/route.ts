import { apiSuccess, handleApiError, parseJsonBody } from "@/libs/api-response";
import {
  optionalEnum,
  requireNumber,
  requireString,
} from "@/libs/input-validator";
import { acceptCatalogUpload } from "@/repo/product.repo";

// Endpoint รับ metadata การอัปโหลดและตรวจรูปแบบ ก่อนส่งต่อให้ repository
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const result = await acceptCatalogUpload({
      fileName: requireString(body.fileName, "fileName", { maxLength: 255 }),
      fileSize: requireNumber(body.fileSize, "fileSize", {
        min: 1,
        max: 5 * 1024 * 1024,
        integer: true,
      }),
      uploadType:
        optionalEnum(body.uploadType, "uploadType", ["sku", "function"] as const) ??
        "sku",
    });
    return apiSuccess(result, 202);
  } catch (error) {
    return handleApiError(error, "Unable to accept product upload", "PRODUCT_UPLOAD_FAILED");
  }
}
