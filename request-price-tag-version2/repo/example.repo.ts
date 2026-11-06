import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import type {
  CreateExampleInput,
  ExampleFilter,
  ExampleItem,
  ExampleStatus,
  UpdateExampleInput,
} from "@/types/example";

/**
 * ============================================================================
 * Example Repository (Template & Reference สำหรับสร้างฟีเจอร์ใหม่)
 * ============================================================================
 *
 * หน้าที่ของชั้น Repository (`repo/*.repo.ts`):
 * 1. เป็นชั้นเดียวที่คุยกับ Database (ผ่าน `@/libs/db-query` หรือ `@/libs/db-transaction`)
 * 2. แปลงข้อมูลจากโครงสร้างตาราง DB (`snake_case`) ให้เป็น Domain Type (`camelCase`) ก่อนส่งออก
 * 3. ห้ามผูกกับ HTTP Request / Response เด็ดขาด (เพื่อให้เรียกใช้ได้ทั้งจาก API Route, Server Component และ Worker)
 *
 * หมายเหตุ:
 * - โค้ดที่รันอยู่ด้านล่างใช้ In-Memory Store เพื่อให้โปรเจกต์ Template รันทดสอบได้ทันทีโดยไม่ต้องต่อ MySQL
 * - ในทุกฟังก์ชันจะมี "ตัวอย่างโค้ดเมื่อต่อ MySQL จริง" คอมเมนต์ไว้ให้สามารถก๊อปปี้ไปใช้งานได้ทันที
 */

// ----------------------------------------------------------------------------
// 1. ตัวอย่างการประกาศ Row Type และ Mapper สำหรับแปลงข้อมูลจาก MySQL
// ----------------------------------------------------------------------------

/**
 * โครงสร้างคอลัมน์ที่ได้จากตารางใน MySQL (มักเป็น snake_case)
 */
export interface ExampleRow extends RowDataPacket {
  id: string;
  title: string;
  description: string | null;
  status: ExampleStatus;
  created_at: Date | string;
  updated_at: Date | string | null;
}

/**
 * ฟังก์ชันแปลงแถวข้อมูลจาก DB (ExampleRow) -> ข้อมูลที่ใช้ในแอป (ExampleItem)
 * แนะนำให้แยกฟังก์ชันลักษณะนี้ไว้ในแต่ละ repo เพื่อไม่ต้องเขียนแปลงฟิลด์ซ้ำๆ
 */
export function mapRowToExampleItem(row: ExampleRow): ExampleItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    updatedAt: row.updated_at
      ? row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at)
      : undefined,
  };
}

// ----------------------------------------------------------------------------
// 2. In-Memory Store (สำหรับรัน Demo ใน Template โดยไม่ต้องมี DB)
// ----------------------------------------------------------------------------

declare global {
  var exampleStore: ExampleItem[] | undefined;
}

function getStore(): ExampleItem[] {
  if (!globalThis.exampleStore) {
    const now = new Date().toISOString();

    globalThis.exampleStore = [
      {
        id: "ex-welcome-001",
        title: "Welcome Example",
        description:
          "รายการเริ่มต้นจาก repo/example.repo.ts (ลองสร้าง เปลี่ยนสถานะ หรือลบรายการได้)",
        status: "active",
        createdAt: now,
      },
    ];
  }

  return globalThis.exampleStore;
}

// ----------------------------------------------------------------------------
// 3. Repository CRUD Functions (ต้นแบบสำหรับก๊อปปี้ไปสร้างโมดูลใหม่)
// ----------------------------------------------------------------------------

/**
 * อ่านรายการทั้งหมด พร้อมรองรับการค้นหา/กรองตามเงื่อนไข
 *
 * [ตัวอย่างเมื่อใช้ MySQL จริง]:
 * ```ts
 * import { query } from "@/libs/db-query";
 *
 * const rows = await query<ExampleRow[]>(
 *   `SELECT id, title, description, status, created_at, updated_at
 *    FROM examples
 *    WHERE (:status IS NULL OR status = :status)
 *      AND (:search IS NULL OR title LIKE CONCAT('%', :search, '%'))
 *    ORDER BY created_at DESC`,
 *   {
 *     status: filter.status ?? null,
 *     search: filter.search ?? null,
 *   }
 * );
 * return rows.map(mapRowToExampleItem);
 * ```
 */
export async function listExampleItems(
  filter: ExampleFilter = {},
): Promise<ExampleItem[]> {
  const searchKeyword = filter.search?.trim().toLowerCase();

  return [...getStore()]
    .filter((item) => {
      if (filter.status && item.status !== filter.status) {
        return false;
      }

      if (searchKeyword) {
        const matchTitle = item.title.toLowerCase().includes(searchKeyword);
        const matchDesc =
          item.description?.toLowerCase().includes(searchKeyword) ?? false;
        return matchTitle || matchDesc;
      }

      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * อ่านข้อมูลรายการเดียวจาก ID (คืนค่า `null` หากไม่พบ)
 *
 * [ตัวอย่างเมื่อใช้ MySQL จริง]:
 * ```ts
 * import { queryOne } from "@/libs/db-query";
 *
 * const row = await queryOne<ExampleRow>(
 *   `SELECT id, title, description, status, created_at, updated_at
 *    FROM examples
 *    WHERE id = ?
 *    LIMIT 1`,
 *   [id]
 * );
 * return row ? mapRowToExampleItem(row) : null;
 * ```
 */
export async function getExampleItemById(
  id: string,
): Promise<ExampleItem | null> {
  const found = getStore().find((item) => item.id === id);
  return found ? { ...found } : null;
}

/**
 * สร้างรายการใหม่จาก Input ที่ผ่านการ Validate มาแล้ว
 *
 * [ตัวอย่างเมื่อใช้ MySQL จริง]:
 * ```ts
 * import { execute } from "@/libs/db-query";
 *
 * const id = crypto.randomUUID();
 * await execute(
 *   `INSERT INTO examples (id, title, description, status, created_at)
 *    VALUES (:id, :title, :description, :status, NOW())`,
 *   {
 *     id,
 *     title: input.title,
 *     description: input.description ?? null,
 *     status: input.status ?? "active",
 *   }
 * );
 * return (await getExampleItemById(id))!;
 * ```
 */
export async function createExampleItem(
  input: CreateExampleInput,
): Promise<ExampleItem> {
  const item: ExampleItem = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    status: input.status ?? "active",
    createdAt: new Date().toISOString(),
  };

  const store = getStore();
  store.unshift(item);

  return { ...item };
}

/**
 * แก้ไขข้อมูลรายการตาม ID (คืนค่า `null` หากไม่พบรายการที่ต้องการแก้ไข)
 *
 * [ตัวอย่างเมื่อใช้ MySQL จริง]:
 * ```ts
 * import { execute } from "@/libs/db-query";
 *
 * const existing = await getExampleItemById(id);
 * if (!existing) return null;
 *
 * await execute(
 *   `UPDATE examples
 *    SET title = :title,
 *        description = :description,
 *        status = :status,
 *        updated_at = NOW()
 *    WHERE id = :id`,
 *   {
 *     id,
 *     title: input.title ?? existing.title,
 *     description: input.description !== undefined ? input.description : (existing.description ?? null),
 *     status: input.status ?? existing.status,
 *   }
 * );
 * return getExampleItemById(id);
 * ```
 */
export async function updateExampleItem(
  id: string,
  input: UpdateExampleInput,
): Promise<ExampleItem | null> {
  const store = getStore();
  const index = store.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const current = store[index];
  const updated: ExampleItem = {
    ...current,
    title: input.title !== undefined ? input.title.trim() : current.title,
    description:
      input.description !== undefined
        ? input.description.trim() || undefined
        : current.description,
    status: input.status ?? current.status,
    updatedAt: new Date().toISOString(),
  };

  store[index] = updated;
  return { ...updated };
}

/**
 * ลบรายการตาม ID (คืนค่า `true` หากลบสำเร็จ, `false` หากไม่พบ ID)
 *
 * [ตัวอย่างเมื่อใช้ MySQL จริง]:
 * ```ts
 * import { execute } from "@/libs/db-query";
 *
 * const result = await execute("DELETE FROM examples WHERE id = ?", [id]);
 * return result.affectedRows > 0;
 * ```
 *
 * [ตัวอย่างกรณีต้องลบหลายตารางพร้อมกันด้วย Transaction]:
 * ```ts
 * import { withTransaction } from "@/libs/db-transaction";
 *
 * return withTransaction(async (_conn, tx) => {
 *   await tx.execute("DELETE FROM example_logs WHERE example_id = ?", [id]);
 *   const result = await tx.execute("DELETE FROM examples WHERE id = ?", [id]);
 *   return result.affectedRows > 0;
 * });
 * ```
 */
export async function deleteExampleItem(id: string): Promise<boolean> {
  const store = getStore();
  const index = store.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  store.splice(index, 1);
  return true;
}
