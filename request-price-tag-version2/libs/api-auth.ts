import { apiError } from "@/libs/api-response";

/**
 * ตัวช่วยตรวจ API key ที่ใช้ร่วมกันใน route handlers
 *
 * รูปแบบการใช้งานใน route:
 * const unauthorized = validateApiKeyHeader(request);
 * if (unauthorized) return unauthorized;
 */
const API_KEY_HEADER = "x-api-key";

/**
 * ปรับรูปแบบค่า API key ก่อนนำไปเปรียบเทียบ
 * ครอบคลุมกรณี:
 * - proxy/ระบบกลางส่ง header ซ้ำแบบคั่นด้วย comma
 * - ค่าใน env/config ถูกครอบด้วยเครื่องหมาย quote โดยไม่ตั้งใจ
 */
function normalizeApiKey(value: string) {
  // รองรับ quote ที่ติดมาและ header ซ้ำหลายค่า
  const first = value.split(",")[0]?.trim() ?? "";
  return first.replace(/^['\"]|['\"]$/g, "").trim();
}

/**
 * อ่าน API key จาก environment และ fail fast หากไม่ได้ตั้งค่า
 * เพื่อป้องกัน route รับคำขอโดยไม่มีนโยบาย key โดยไม่รู้ตัว
 */
function getExpectedApiKey() {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return apiKey;
}

/**
 * ตรวจสอบ API key จากคำขอ
 *
 * ข้อตกลงค่าที่คืนกลับ:
 * - null: ผ่านการยืนยันตัวตน
 * - Response: ไม่ผ่าน และพร้อม return ออกจาก route ได้ทันที
 */
export function validateApiKeyHeader(request: Request) {
  const rawApiKey = request.headers.get(API_KEY_HEADER);
  const apiKey = rawApiKey ? normalizeApiKey(rawApiKey) : "";
  const expectedApiKey = normalizeApiKey(getExpectedApiKey());

  if (!apiKey) {
    // ไม่มี auth header ส่งมาเลย
    return apiError("Missing x-api-key header", 401, "API_KEY_MISSING");
  }

  if (apiKey !== expectedApiKey) {
    // มี header แต่ค่าไม่ตรงกับ key ที่กำหนดไว้
    return apiError("Invalid API key", 401, "API_KEY_INVALID");
  }

  // ผู้เรียกสามารถทำงานของ route ต่อได้ตามปกติ
  return null;
}
