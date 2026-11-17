import { apiError, apiSuccess, handleApiError, parseJsonBody } from "@/libs/api-response";
import { validateIdList } from "@/libs/input-validator";
import { exportReportDocuments } from "@/repo/report.repo";
import { parseBranchId } from "@/libs/branch";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const branchId = parseBranchId(
      typeof body.branchId === "string" ? body.branchId : null,
    );
    const documents = await exportReportDocuments(
      validateIdList(body.ids),
      branchId,
    );
    if (documents.length === 0) {
      return apiError("No matching report documents", 404, "REPORTS_NOT_FOUND");
    }
    return apiSuccess(documents);
  } catch (error) {
    return handleApiError(error, "Unable to export report documents", "REPORT_EXPORT_FAILED");
  }
}
