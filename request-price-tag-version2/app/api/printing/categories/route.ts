import { apiSuccess, handleApiError } from "@/libs/api-response";
import { getPrintingCategories } from "@/repo/printing.repo";
import { parseBranchId } from "@/libs/branch";

// API layer สำหรับโหลดหมวดหมู่ โดยไม่ผูก route เข้ากับแหล่งเก็บข้อมูล
export async function GET(request: Request) {
  try {
    const branchId = parseBranchId(new URL(request.url).searchParams.get("branchId"));
    return apiSuccess(await getPrintingCategories(branchId));
  } catch (error) {
    return handleApiError(
      error,
      "Unable to load printing categories",
      "PRINTING_CATEGORIES_LOAD_FAILED",
    );
  }
}
