import {
  apiError,
  apiSuccess,
  handleApiError,
  parseJsonBody,
} from "@/libs/api-response";
import { requireNumber, requireString, validateIdList } from "@/libs/input-validator";
import { createPrintingRequestJob } from "@/repo/printing.repo";
import { parseBranchId } from "@/libs/branch";

// API layer ตรวจคำร้องและค่าการพิมพ์ ก่อนส่งให้ repository สร้าง mock job
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const result = await createPrintingRequestJob({
      branchId: parseBranchId(
        typeof body.branchId === "string" ? body.branchId : null,
      ),
      requestIds: validateIdList(body.requestIds),
      copies: requireNumber(body.copies, "copies", {
        min: 1,
        max: 99,
        integer: true,
      }),
      printer: requireString(body.printer, "printer", { maxLength: 50 }),
    });
    if (!result) {
      return apiError("Printing request not found", 404, "PRINTING_REQUEST_NOT_FOUND");
    }
    return apiSuccess(result, 202);
  } catch (error) {
    return handleApiError(error, "Unable to create printing job", "PRINT_REQUEST_FAILED");
  }
}
