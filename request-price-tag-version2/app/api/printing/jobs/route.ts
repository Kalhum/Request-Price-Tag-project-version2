import {
  apiSuccess,
  handleApiError,
  parseJsonBody,
} from "@/libs/api-response";
import {
  optionalEnum,
  optionalString,
  validateIdList,
  ValidationError,
} from "@/libs/input-validator";
import { createPrintingJob } from "@/repo/printing.repo";
import { parseBranchId } from "@/libs/branch";

// API layer ตรวจตัวเลือกและหมวดหมู่ก่อนขอให้ repository สร้าง print job
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const branchMode = optionalEnum(body.branchMode, "branchMode", [
      "none",
      "branch",
    ] as const);
    if (typeof body.englishEnabled !== "boolean") {
      throw new ValidationError("englishEnabled must be a boolean");
    }
    const result = await createPrintingJob({
      branchId: parseBranchId(
        typeof body.branchId === "string" ? body.branchId : null,
      ),
      categoryIds: validateIdList(body.categoryIds),
      branchMode: branchMode ?? "none",
      branchCode: optionalString(body.branchCode, "branchCode", {
        maxLength: 50,
      }),
      englishEnabled: body.englishEnabled,
      englishText: optionalString(body.englishText, "englishText", {
        maxLength: 200,
      }),
    });
    return apiSuccess(result, 202);
  } catch (error) {
    return handleApiError(error, "Unable to create printing job", "PRINTING_JOB_CREATE_FAILED");
  }
}
