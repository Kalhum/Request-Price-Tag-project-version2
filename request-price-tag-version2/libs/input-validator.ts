/**
 * ชุดเครื่องมือ Validate ข้อมูลขาเข้าสำหรับ API Route และ Repository
 *
 * แนวคิดหลัก:
 * - ทุกฟังก์ชันจะโยน `ValidationError` ทันทีเมื่อข้อมูลไม่ถูกต้อง
 * - เมื่อใช้คู่กับ `handleApiError` ใน `libs/api-response.ts` ระบบจะแปลง `ValidationError`
 *   เป็น HTTP 400 (VALIDATION_ERROR) ให้โดยอัตโนมัติ ไม่ต้องเขียน if/else ซ้ำๆ
 */

// ความยาวสูงสุดของ ID แต่ละตัว
const MAX_ID_LENGTH = 50;

// จำนวน ID สูงสุดที่ยอมรับได้ในหนึ่งคำขอ
const MAX_ID_LIST_SIZE = 100;

// อักขระที่อนุญาตใน ID: ตัวอักษร ตัวเลข ขีดล่าง ขีดกลาง
const VALID_ID_PATTERN = /^[a-zA-Z0-9_\-]+$/;

/**
 * Error เฉพาะสำหรับการตรวจสอบข้อมูลขาเข้า (Input Validation)
 * `handleApiError` จะดักจับ Error ชนิดนี้แล้วตอบกลับด้วย HTTP 400 อัตโนมัติ
 */
export class ValidationError extends Error {
  readonly code: string;

  constructor(message: string, code = "VALIDATION_ERROR") {
    super(message);
    this.name = "ValidationError";
    this.code = code;
  }
}

/**
 * ตรวจว่าค่าที่รับมาเป็น Object ปกติ (ไม่ใช่ null และไม่ใช่ Array)
 *
 * @example
 * const body = await parseJsonBody(request); // คืนค่า Record<string, unknown>
 */
export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * ตรวจสอบฟิลด์ข้อความแบบบังคับกรอก (Required String) พร้อม trim ช่องว่างอัตโนมัติ
 *
 * @example
 * const title = requireString(body.title, "title", { maxLength: 120 });
 */
export function requireString(
  value: unknown,
  fieldName: string,
  options: { minLength?: number; maxLength?: number } = {},
): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} is required and must be a string`);
  }

  const trimmed = value.trim();
  const minLength = options.minLength ?? 1;

  if (trimmed.length < minLength) {
    throw new ValidationError(
      minLength === 1
        ? `${fieldName} cannot be empty`
        : `${fieldName} must be at least ${minLength} characters`,
    );
  }

  if (options.maxLength !== undefined && trimmed.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must not exceed ${options.maxLength} characters`,
    );
  }

  return trimmed;
}

/**
 * ตรวจสอบฟิลด์ข้อความแบบไม่บังคับ (Optional String)
 * - ถ้าเป็น undefined, null หรือข้อความว่าง ("") จะคืนค่า `undefined`
 * - ถ้ามีข้อความ จะ trim และตรวจความยาวตามที่กำหนด
 *
 * @example
 * const description = optionalString(body.description, "description", { maxLength: 500 });
 */
export function optionalString(
  value: unknown,
  fieldName: string,
  options: { maxLength?: number } = {},
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (options.maxLength !== undefined && trimmed.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must not exceed ${options.maxLength} characters`,
    );
  }

  return trimmed;
}

/**
 * ตรวจสอบฟิลด์ตัวเลขแบบบังคับ (Required Number)
 *
 * @example
 * const quantity = requireNumber(body.quantity, "quantity", { min: 1, max: 1000 });
 */
export function requireNumber(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; integer?: boolean } = {},
): number {
  const num = typeof value === "string" && value.trim() !== "" ? Number(value) : value;

  if (typeof num !== "number" || !Number.isFinite(num)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  if (options.integer && !Number.isInteger(num)) {
    throw new ValidationError(`${fieldName} must be an integer`);
  }

  if (options.min !== undefined && num < options.min) {
    throw new ValidationError(`${fieldName} must be at least ${options.min}`);
  }

  if (options.max !== undefined && num > options.max) {
    throw new ValidationError(`${fieldName} must be at most ${options.max}`);
  }

  return num;
}

/**
 * ตรวจสอบว่าค่าอยู่ในรายการที่อนุญาต (Enum / Union)
 *
 * @example
 * const status = optionalEnum(body.status, "status", ["active", "completed", "archived"] as const);
 */
export function optionalEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[],
): T | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(", ")}`,
    );
  }

  return value as T;
}

/**
 * ตรวจสอบ ID เดี่ยว (ป้องกันอักขระแปลกปลอมและจำกัดความยาว)
 * @param id - ค่า ID ที่ต้องการตรวจ
 * @throws ValidationError เมื่อค่า ID ไม่ถูกต้อง
 */
export function validateId(id: unknown, fieldName = "ID"): string {
  if (typeof id !== "string") {
    throw new ValidationError(
      `${fieldName} must be a string, received ${typeof id}`,
    );
  }

  const trimmed = id.trim();

  if (trimmed.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }

  if (trimmed.length > MAX_ID_LENGTH) {
    throw new ValidationError(
      `${fieldName} exceeds maximum length of ${MAX_ID_LENGTH} characters`,
    );
  }

  if (!VALID_ID_PATTERN.test(trimmed)) {
    throw new ValidationError(
      `${fieldName} contains invalid characters: ${trimmed}. Only alphanumeric, underscore, and hyphen allowed`,
    );
  }

  return trimmed;
}

/**
 * ตรวจสอบอาเรย์ของ ID สำหรับใช้กับ query ฐานข้อมูล (เช่น WHERE id IN (...))
 * @param idList - อาเรย์ของ ID ที่ต้องการตรวจ
 * @returns อาเรย์ ID ที่ผ่านการตรวจแล้วและลบค่าซ้ำเรียบร้อย
 * @throws ValidationError เมื่อมี ID ไม่ถูกต้องหรือจำนวนเกินกำหนด
 */
export function validateIdList(idList: unknown): string[] {
  if (!Array.isArray(idList)) {
    throw new ValidationError(
      `ID list must be an array, received ${typeof idList}`,
    );
  }

  if (idList.length === 0) {
    throw new ValidationError("ID list cannot be empty");
  }

  if (idList.length > MAX_ID_LIST_SIZE) {
    throw new ValidationError(
      `ID list exceeds maximum size of ${MAX_ID_LIST_SIZE} items`,
    );
  }

  // ตรวจทุกค่าด้วยกติกาเดียวกับ validateId
  const validatedIds = idList.map((id) => validateId(id));

  // ลบค่าซ้ำโดยยังคงลำดับเดิม
  return Array.from(new Set(validatedIds));
}
