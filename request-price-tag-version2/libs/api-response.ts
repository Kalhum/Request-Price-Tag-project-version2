import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";
import { isPlainObject, ValidationError } from "./input-validator";
import { logger } from "./logger";

/**
 * สร้างโครง success response มาตรฐานที่ใช้ร่วมกันทุก API route
 *
 * รูปแบบ response:
 * {
 *   success: true,
 *   code: <status>,
 *   data: <payload>
 * }
 *
 * @example
 * return apiSuccess(items); // 200 OK
 * return apiSuccess(createdItem, 201); // 201 Created
 */
export function apiSuccess<T>(data: T, status = 200) {
  // 204 (No Content) ต้องไม่มี JSON body
  if (status === 204) {
    return new Response(null, { status });
  }

  const payload: ApiSuccessResponse<T> = {
    success: true,
    code: status,
    data,
  };

  return Response.json(payload, { status });
}

/**
 * สร้างโครง error response มาตรฐานที่ใช้ร่วมกันทุก API route
 *
 * รูปแบบ response:
 * {
 *   success: false,
 *   code: <status>,
 *   error: { message, code?, details? }
 * }
 *
 * @example
 * return apiError("Item not found", 404, "NOT_FOUND");
 */
export function apiError(
  message: string,
  status = 500,
  code?: string,
  details?: unknown,
) {
  const payload: ApiErrorResponse = {
    success: false,
    code: status,
    error: {
      message,
      code,
      details,
    },
  };

  return Response.json(payload, { status });
}

/**
 * อ่านและแปลง JSON body จาก Request อย่างปลอดภัย
 * - หากไม่ใช่ JSON ที่ถูกต้อง หรือไม่ใช่ Object จะโยน `ValidationError`
 * - เมื่อใช้คู่กับ `handleApiError` ใน catch block จะตอบ HTTP 400 อัตโนมัติ
 *
 * @example
 * const body = await parseJsonBody(request);
 * const title = requireString(body.title, "title", { maxLength: 120 });
 */
export async function parseJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new ValidationError("Invalid JSON body", "INVALID_JSON");
  }

  if (!isPlainObject(payload)) {
    throw new ValidationError(
      "Request body must be a JSON object",
      "INVALID_JSON_OBJECT",
    );
  }

  return payload;
}

/**
 * ตัวช่วยมาตรฐานสำหรับใช้ใน catch block ของ API route
 *
 * หน้าที่:
 * 1) หากเป็น `ValidationError` -> ตอบกลับ 400 Bad Request พร้อมข้อความที่ชัดเจนทันที
 * 2) หากเป็น Error อื่นๆ -> บันทึก log ผ่าน `logger.error` และตอบกลับ 500 (ไม่เปิดเผย stack trace ให้ client)
 */
export function handleApiError(
  error: unknown,
  customMessage: string,
  errorCode: string,
  status = 500,
) {
  if (error instanceof ValidationError) {
    return apiError(error.message, 400, error.code);
  }

  logger.error(customMessage, error, { errorCode });
  return apiError(customMessage, status, errorCode);
}
