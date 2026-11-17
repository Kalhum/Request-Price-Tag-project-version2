import { apiError, apiSuccess, handleApiError, parseJsonBody } from "@/libs/api-response";
import { validateIdList } from "@/libs/input-validator";
import { createReportReprint } from "@/repo/report.repo";
import { parseBranchId } from "@/libs/branch";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const branchId = parseBranchId(
      typeof body.branchId === "string" ? body.branchId : null,
    );
    const result = await createReportReprint(
      validateIdList(body.ids),
      branchId,
    );
    if (!result) {
      return apiError("One or more report documents were not found", 404, "REPORTS_NOT_FOUND");
    }
    return apiSuccess(result, 202);
  } catch (error) {
    return handleApiError(error, "Unable to create report reprint job", "REPORT_REPRINT_FAILED");
  }
}
