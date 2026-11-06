import "server-only";
import { getDb } from "./db";
import { runExecute, runQuery, runQueryOne } from "./db-query";
import type {
  ExecuteValues,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

/**
 * Helper สำหรับรันคำสั่ง SQL ภายใน Transaction เดียวกัน
 * มีรูปแบบการใช้งานเหมือน `query`, `queryOne`, `execute` ใน `libs/db-query.ts` ทุกประการ
 */
export type TransactionHelper = {
  query: <T = RowDataPacket[]>(
    sql: string,
    params?: ExecuteValues,
  ) => Promise<T>;
  queryOne: <T = RowDataPacket>(
    sql: string,
    params?: ExecuteValues,
  ) => Promise<T | null>;
  execute: (
    sql: string,
    params?: ExecuteValues,
  ) => Promise<ResultSetHeader>;
};

/**
 * สร้าง TransactionHelper ที่ผูกกับ Connection ของ Transaction นั้นๆ
 */
export function createTransactionHelper(
  conn: PoolConnection,
): TransactionHelper {
  return {
    query: <T = RowDataPacket[]>(sql: string, params: ExecuteValues = {}) =>
      runQuery<T>(conn, sql, params),
    queryOne: <T = RowDataPacket>(sql: string, params: ExecuteValues = {}) =>
      runQueryOne<T>(conn, sql, params),
    execute: (sql: string, params: ExecuteValues = {}) =>
      runExecute(conn, sql, params),
  };
}

/**
 * ตัวช่วยจัดการ Database Transaction อย่างปลอดภัย
 *
 * ทำไมควรใช้ฟังก์ชันนี้:
 * - จัดการลำดับ `beginTransaction -> commit -> rollback -> release` ให้อัตโนมัติ
 * - ป้องกันปัญหาลืม `conn.release()` เมื่อเกิด Exception (Connection Leak)
 * - มีพารามิเตอร์ตัวที่สอง `tx` (`tx.query`, `tx.queryOne`, `tx.execute`) ให้เรียกใช้ง่ายเหมือน `db-query`
 *
 * @example
 * await withTransaction(async (_conn, tx) => {
 *   await tx.execute("INSERT INTO orders (id, total) VALUES (?, ?)", [orderId, total]);
 *   await tx.execute("UPDATE stock SET qty = qty - ? WHERE item_id = ?", [qty, itemId]);
 * });
 */
export async function withTransaction<T>(
  callback: (conn: PoolConnection, tx: TransactionHelper) => Promise<T>,
): Promise<T> {
  const conn = await getDb().getConnection();
  const tx = createTransactionHelper(conn);

  try {
    await conn.beginTransaction();

    const result = await callback(conn, tx);

    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
