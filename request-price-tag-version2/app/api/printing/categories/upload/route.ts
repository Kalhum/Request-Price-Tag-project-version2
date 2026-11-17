import { apiSuccess, handleApiError, parseJsonBody } from "@/libs/api-response";
import { requireNumber, requireString } from "@/libs/input-validator";
import { acceptPrintingCategoryUpload } from "@/repo/printing.repo";

// Endpoint ตรวจและส่งต่อ metadata เท่านั้น; mock repository ยังไม่ประมวลผลไฟล์
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const result = await acceptPrintingCategoryUpload({
      fileName: requireString(body.fileName, "fileName", { maxLength: 255 }),
      fileSize: requireNumber(body.fileSize, "fileSize", {
        min: 1,
        max: 5 * 1024 * 1024,
        integer: true,
      }),
    });
    return apiSuccess(result, 202);
  } catch (error) {
    return handleApiError(
      error,
      "Unable to accept printing category upload",
      "PRINTING_CATEGORY_UPLOAD_FAILED",
    );
  }
}
