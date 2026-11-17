import { apiError, apiSuccess, handleApiError, parseJsonBody } from "@/libs/api-response";
import { requireString } from "@/libs/input-validator";
import { createPriceRequest } from "@/repo/request.repo";
import { parseBranchId } from "@/libs/branch";

// API layer ตรวจข้อมูลคำร้องและส่งต่อการสร้างให้ request repository
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const result = await createPriceRequest({
      branchId: parseBranchId(
        typeof body.branchId === "string" ? body.branchId : null,
      ),
      barcode: requireString(body.barcode, "barcode", { maxLength: 50 }),
    });
    if (!result) {
      return apiError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }
    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error, "Unable to create price request", "REQUEST_CREATE_FAILED");
  }
}
