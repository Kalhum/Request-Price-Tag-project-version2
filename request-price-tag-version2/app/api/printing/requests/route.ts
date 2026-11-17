import { apiSuccess, handleApiError } from "@/libs/api-response";
import { listPrintingRequests } from "@/repo/printing.repo";
import { parseBranchId } from "@/libs/branch";

// API layer อ่านตัวกรองสาขาและส่งต่อ query ไปยัง printing repository
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = parseBranchId(searchParams.get("branchId"));
    return apiSuccess(await listPrintingRequests(branchId));
  } catch (error) {
    return handleApiError(
      error,
      "Unable to load printing requests",
      "PRINTING_REQUESTS_LOAD_FAILED",
    );
  }
}
