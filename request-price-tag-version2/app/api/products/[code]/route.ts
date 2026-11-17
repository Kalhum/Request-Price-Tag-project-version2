import {
  apiError,
  apiSuccess,
  handleApiError,
  parseJsonBody,
} from "@/libs/api-response";
import {
  optionalEnum,
  validateId,
  ValidationError,
} from "@/libs/input-validator";
import {
  deleteProduct,
  findProduct,
  updateProduct,
} from "@/repo/product.repo";
import { parseBranchId } from "@/libs/branch";

type RouteContext = { params: Promise<{ code: string }> };
const CATEGORIES = ["Core SKU", "Optional SKU"] as const;

// API layer ของสินค้าเดี่ยว: ตรวจ code/body และให้ repository จัดการข้อมูล
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { code } = await params;
    const branchId = parseBranchId(new URL(request.url).searchParams.get("branchId"));
    const product = await findProduct(validateId(code, "productCode"), branchId);
    if (!product) return apiError("Product not found", 404, "PRODUCT_NOT_FOUND");
    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error, "Unable to find product", "PRODUCT_LOOKUP_FAILED");
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const branchId = parseBranchId(new URL(request.url).searchParams.get("branchId"));
    const { code: rawCode } = await params;
    const code = validateId(rawCode, "productCode");
    const body = await parseJsonBody(request);
    const category = optionalEnum(body.category, "category", CATEGORIES);
    if (!category) throw new ValidationError("category is required");

    const product = await updateProduct(code, branchId, { category });
    if (!product) return apiError("Product not found", 404, "PRODUCT_NOT_FOUND");
    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error, "Unable to update product", "PRODUCT_UPDATE_FAILED");
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const branchId = parseBranchId(new URL(request.url).searchParams.get("branchId"));
    const { code: rawCode } = await params;
    const deleted = await deleteProduct(
      validateId(rawCode, "productCode"),
      branchId,
    );
    if (!deleted) return apiError("Product not found", 404, "PRODUCT_NOT_FOUND");
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error, "Unable to delete product", "PRODUCT_DELETE_FAILED");
  }
}
