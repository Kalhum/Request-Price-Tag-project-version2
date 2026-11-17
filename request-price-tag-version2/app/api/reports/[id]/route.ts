import { apiError, apiSuccess, handleApiError } from "@/libs/api-response";
import { validateId } from "@/libs/input-validator";
import { getReportDocumentById } from "@/repo/report.repo";
import { parseBranchId } from "@/libs/branch";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id: rawId } = await params;
    const id = validateId(rawId, "reportId");
    const branchId = parseBranchId(new URL(request.url).searchParams.get("branchId"));
    const document = await getReportDocumentById(id, branchId);

    if (!document) {
      return apiError("Report document not found", 404, "REPORT_NOT_FOUND");
    }

    return apiSuccess(document);
  } catch (error) {
    return handleApiError(
      error,
      "Unable to load report document",
      "REPORT_DETAIL_FAILED",
    );
  }
}
