import { apiSuccess, handleApiError } from "@/libs/api-response";
import {
  optionalEnum,
  optionalString,
  requireNumber,
} from "@/libs/input-validator";
import { listProducts } from "@/repo/product.repo";
import type { ProductListFilter } from "@/types/product";
import { parseBranchId } from "@/libs/branch";

const CATEGORIES = ["all", "Core SKU", "Optional SKU"] as const;
const SORT_KEYS = ["code", "name", "category"] as const;
const SORT_ORDERS = ["asc", "desc"] as const;

// API layer ตรวจและแปลง query params ก่อนส่ง filter ไปยัง product repository
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter: ProductListFilter = {
      branchId: parseBranchId(searchParams.get("branchId")),
      query: optionalString(searchParams.get("query"), "query", {
        maxLength: 100,
      }) ?? "",
      category:
        optionalEnum(searchParams.get("category"), "category", CATEGORIES) ??
        "all",
      sortBy:
        optionalEnum(searchParams.get("sortBy"), "sortBy", SORT_KEYS) ?? "code",
      sortOrder:
        optionalEnum(searchParams.get("sortOrder"), "sortOrder", SORT_ORDERS) ??
        "asc",
      page: requireNumber(searchParams.get("page") ?? "1", "page", {
        min: 1,
        max: 100_000,
        integer: true,
      }),
      pageSize: requireNumber(
        searchParams.get("pageSize") ?? "20",
        "pageSize",
        { min: 1, max: 100, integer: true },
      ),
    };
    return apiSuccess(await listProducts(filter));
  } catch (error) {
    return handleApiError(error, "Unable to load products", "PRODUCTS_LOAD_FAILED");
  }
}
