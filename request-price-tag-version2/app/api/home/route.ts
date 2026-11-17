import { apiSuccess, handleApiError } from "@/libs/api-response";
import { getHomeContent } from "@/repo/home.repo";
import { parseBranchId } from "@/libs/branch";

// API layer ของ Home: รับคำขอ HTTP แล้วส่งต่อให้ repository จัดหาข้อมูล
export async function GET(request: Request) {
  try {
    const branchId = parseBranchId(new URL(request.url).searchParams.get("branchId"));
    return apiSuccess(await getHomeContent(branchId));
  } catch (error) {
    return handleApiError(error, "Unable to load home content", "HOME_LOAD_FAILED");
  }
}
