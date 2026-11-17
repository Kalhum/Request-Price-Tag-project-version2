import { apiSuccess, handleApiError, parseJsonBody } from "@/libs/api-response";
import { requireNumber, requireString } from "@/libs/input-validator";
import { acceptRequestUpload } from "@/repo/request.repo";

// Endpoint นี้รับและตรวจ metadata เท่านั้น ไม่ได้อ่านเนื้อหาไฟล์จริง
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const result = await acceptRequestUpload({
      fileName: requireString(body.fileName, "fileName", { maxLength: 255 }),
      fileSize: requireNumber(body.fileSize, "fileSize", {
        min: 1,
        max: 5 * 1024 * 1024,
        integer: true,
      }),
    });
    return apiSuccess(result, 202);
  } catch (error) {
    return handleApiError(error, "Unable to accept uploaded request", "REQUEST_UPLOAD_FAILED");
  }
}
