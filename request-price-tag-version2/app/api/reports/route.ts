import { apiSuccess, handleApiError } from "@/libs/api-response";
import {
  optionalEnum,
  optionalString,
  requireNumber,
} from "@/libs/input-validator";
import { listReportDocuments } from "@/repo/report.repo";
import type { ReportFilter } from "@/types/report";
import { parseBranchId } from "@/libs/branch";

const PERIODS = ["7", "30", "90", "all"] as const;
const STATUSES = ["all", "printed", "pending"] as const;
const SORT_ORDERS = ["asc", "desc"] as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = requireNumber(searchParams.get("page") ?? "1", "page", {
      min: 1,
      max: 100_000,
      integer: true,
    });
    const pageSize = requireNumber(
      searchParams.get("pageSize") ?? "15",
      "pageSize",
      { min: 1, max: 100, integer: true },
    );
    const period =
      optionalEnum(searchParams.get("period"), "period", PERIODS) ?? "30";
    const status =
      optionalEnum(searchParams.get("status"), "status", STATUSES) ?? "all";
    const sortOrder =
      optionalEnum(searchParams.get("sortOrder"), "sortOrder", SORT_ORDERS) ??
      "asc";

    const filter: ReportFilter = {
      branchId: parseBranchId(searchParams.get("branchId")),
      query:
        optionalString(searchParams.get("query"), "query", { maxLength: 100 }) ??
        "",
      period,
      status,
      user:
        optionalString(searchParams.get("user"), "user", { maxLength: 50 }) ??
        "all",
      page,
      pageSize,
      sortOrder,
    };

    return apiSuccess(await listReportDocuments(filter));
  } catch (error) {
    return handleApiError(
      error,
      "Unable to load report documents",
      "REPORT_LIST_FAILED",
    );
  }
}
