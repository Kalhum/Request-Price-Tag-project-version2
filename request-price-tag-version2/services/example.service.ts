import { cacheInvalidate } from "@/libs/client-cache";
import { apiClient } from "@/services/api-client";
import type {
  CreateExampleInput,
  ExampleFilter,
  ExampleItem,
  UpdateExampleInput,
} from "@/types/example";

/**
 * ============================================================================
 * Example Service (Template & Reference สำหรับสร้าง Service ของฟีเจอร์ใหม่)
 * ============================================================================
 *
 * หน้าที่ของชั้น Service (`services/*.service.ts`):
 * 1. เป็นตัวกลางระหว่างฝั่ง UI / Custom Hook กับ API Route (`/api/...`)
 * 2. ซ่อนรายละเอียดของ URL, HTTP Method, Query Params และการทำ JSON.stringify
 * 3. ผูก Return Type ที่ชัดเจน (เช่น `Promise<ExampleItem[]>`) เพื่อให้ฝั่ง UI ได้รับ Type Safety อัตโนมัติ
 *
 * แนวปฏิบัติสำหรับทีม:
 * - ห้ามเรียก `fetch()` โดยตรงใน Component หรือ Hook ให้เรียกผ่านฟังก์ชันใน `services/` เสมอ
 * - กำหนด `ENDPOINT` ไว้ด้านบนสุดของไฟล์เพื่อง่ายต่อการแก้ไขในอนาคต
 */

const ENDPOINT = "/api/example";

/**
 * ดึงรายการ Example ทั้งหมด (รองรับการค้นหาและกรองสถานะผ่าน Query Params)
 *
 * @example
 * const items = await fetchExampleData({ search: "welcome", status: "active" });
 */
export function fetchExampleData(filter?: ExampleFilter) {
  return apiClient.get<ExampleItem[]>(ENDPOINT, {
    params: filter,
  });
}

/**
 * ดึงข้อมูล Example รายการเดียวตาม ID
 *
 * @example
 * const item = await fetchExampleById("ex-welcome-001");
 */
export function fetchExampleById(id: string) {
  return apiClient.get<ExampleItem>(`${ENDPOINT}/${encodeURIComponent(id)}`);
}

/**
 * สร้างรายการ Example ใหม่ผ่าน POST `/api/example`
 * พร้อมล้าง Client Cache ของ Endpoint นี้เพื่อให้การดึงข้อมูลรอบถัดไปได้ข้อมูลล่าสุดเสมอ
 */
export async function postExampleData(data: CreateExampleInput) {
  const created = await apiClient.post<ExampleItem>(ENDPOINT, data);
  cacheInvalidate(ENDPOINT);
  return created;
}

/**
 * แก้ไขข้อมูล Example ตาม ID ผ่าน PATCH `/api/example/[id]`
 */
export async function updateExampleData(id: string, data: UpdateExampleInput) {
  const updated = await apiClient.patch<ExampleItem>(
    `${ENDPOINT}/${encodeURIComponent(id)}`,
    data,
  );
  cacheInvalidate(ENDPOINT);
  return updated;
}

/**
 * ลบรายการ Example ตาม ID ผ่าน DELETE `/api/example/[id]`
 */
export async function deleteExampleData(id: string) {
  const result = await apiClient.delete<{ id: string; deleted: boolean }>(
    `${ENDPOINT}/${encodeURIComponent(id)}`,
  );
  cacheInvalidate(ENDPOINT);
  return result;
}

/**
 * รวมฟังก์ชันทั้งหมดไว้ใน Object เดียวเผื่อกรณีที่ต้องการเรียกแบบ Namespace
 * เช่น `exampleService.list()`, `exampleService.create(input)`
 */
export const exampleService = {
  list: fetchExampleData,
  getById: fetchExampleById,
  create: postExampleData,
  update: updateExampleData,
  remove: deleteExampleData,
};
