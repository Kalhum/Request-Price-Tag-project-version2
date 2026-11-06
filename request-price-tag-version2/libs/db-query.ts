import "server-only";
import { getAuthDb, getDb } from "./db";
import type {
  ExecuteValues,
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { logger } from "./logger";

/**
 * ชุดตัวช่วย Query ฐานข้อมูลกลางของโปรเจกต์
 *
 * กฎการใช้งานสำหรับทีม:
 * - ในไฟล์ `repo/*.repo.ts` ให้เรียกใช้ `query`, `queryOne`, `execute` จากไฟล์นี้เสมอ
 * - ไม่ต้องจัดการ Pool หรือเขียน try/catch เพื่อ log SQL เอง เพราะฟังก์ชันเหล่านี้จัดการให้แล้ว
 * - ใช้ `?` หรือ `:namedParam` สำหรับส่งค่าพารามิเตอร์เสมอ (ห้ามต่อ string SQL โดยตรงเพื่อป้องกัน SQL Injection)
 */

export type Queryable = Pool | PoolConnection;

/**
 * รัน SQL ที่คาดว่าจะคืนค่าเป็นแถวข้อมูล (เช่น SELECT)
 */
export async function runQuery<T>(
  executor: Queryable,
  sql: string,
  params: ExecuteValues = {},
): Promise<T> {
  try {
    const [rows] = await executor.execute(sql, params);
    return rows as T;
  } catch (error) {
    // บันทึก SQL context ที่จุดเดียว เพื่อลดการ log ซ้ำในผู้เรียก
    logger.error("Database query error", error, { sql, params });
    throw error;
  }
}

/**
 * รัน SQL ที่ต้องการผลลัพธ์เพียงแถวเดียว (เช่น SELECT ... WHERE id = ? LIMIT 1)
 * คืนค่าแถวแรก หรือ `null` หากไม่พบข้อมูล
 */
export async function runQueryOne<T>(
  executor: Queryable,
  sql: string,
  params: ExecuteValues = {},
): Promise<T | null> {
  const rows = await runQuery<T[]>(executor, sql, params);
  return rows[0] ?? null;
}

/**
 * รัน SQL สำหรับคำสั่งเขียนข้อมูล (INSERT / UPDATE / DELETE)
 * คืนค่า ResultSetHeader (เช่น `result.insertId`, `result.affectedRows`)
 */
export async function runExecute(
  executor: Queryable,
  sql: string,
  params: ExecuteValues = {},
): Promise<ResultSetHeader> {
  try {
    const [result] = await executor.execute(sql, params);
    return result as ResultSetHeader;
  } catch (error) {
    logger.error("Database execute error", error, { sql, params });
    throw error;
  }
}

/**
 * ดึงข้อมูลหลายแถวจากฐานข้อมูลหลัก (SELECT)
 *
 * @example
 * const rows = await query<ExampleRow[]>(
 *   "SELECT id, title FROM examples WHERE status = :status",
 *   { status: "active" }
 * );
 */
export async function query<T = RowDataPacket[]>(
  sql: string,
  params: ExecuteValues = {},
): Promise<T> {
  return runQuery<T>(getDb(), sql, params);
}

/**
 * ดึงข้อมูลแถวเดียวจากฐานข้อมูลหลัก (SELECT ... LIMIT 1)
 * คืนค่า `T | null` ช่วยลดการเช็ค `rows.length === 0` ซ้ำๆ ใน repo
 *
 * @example
 * const row = await queryOne<ExampleRow>(
 *   "SELECT id, title FROM examples WHERE id = ? LIMIT 1",
 *   [id]
 * );
 * if (!row) return null;
 */
export async function queryOne<T = RowDataPacket>(
  sql: string,
  params: ExecuteValues = {},
): Promise<T | null> {
  return runQueryOne<T>(getDb(), sql, params);
}

/**
 * รันคำสั่งเขียนข้อมูลลงฐานข้อมูลหลัก (INSERT / UPDATE / DELETE)
 *
 * @example
 * const result = await execute(
 *   "UPDATE examples SET title = ? WHERE id = ?",
 *   [title, id]
 * );
 * const isUpdated = result.affectedRows > 0;
 */
export async function execute(
  sql: string,
  params: ExecuteValues = {},
): Promise<ResultSetHeader> {
  return runExecute(getDb(), sql, params);
}

/**
 * ดึงข้อมูลหลายแถวจากฐานข้อมูล Auth (SELECT)
 */
export async function authQuery<T = RowDataPacket[]>(
  sql: string,
  params: ExecuteValues = {},
): Promise<T> {
  return runQuery<T>(getAuthDb(), sql, params);
}

/**
 * ดึงข้อมูลแถวเดียวจากฐานข้อมูล Auth (SELECT ... LIMIT 1)
 */
export async function authQueryOne<T = RowDataPacket>(
  sql: string,
  params: ExecuteValues = {},
): Promise<T | null> {
  return runQueryOne<T>(getAuthDb(), sql, params);
}

/**
 * รันคำสั่งเขียนข้อมูลลงฐานข้อมูล Auth (INSERT / UPDATE / DELETE)
 */
export async function authExecute(
  sql: string,
  params: ExecuteValues = {},
): Promise<ResultSetHeader> {
  return runExecute(getAuthDb(), sql, params);
}
