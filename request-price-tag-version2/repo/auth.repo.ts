import "server-only";
import { authQueryOne } from "@/libs/db-query";
import { logger } from "@/libs/logger";
import type { RowDataPacket } from "mysql2/promise";

/**
 * Auth Repository
 *
 * ตัวอย่าง Repository ที่เชื่อมต่อกับฐานข้อมูลจริงผ่าน `authQueryOne`
 * ใช้ตาราง:
 * - `m_user`: ตรวจสอบชื่อผู้ใช้และรหัสผ่าน
 * - `m_user_per`: ตรวจสอบสิทธิ์การเข้าถึงโปรเจกต์
 */

export interface IAuth {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  user_group: string;
}

interface UserRow extends RowDataPacket {
  user_id: string;
  user_name2: string;
  user_group: string;
}

interface PermissionRow extends RowDataPacket {
  emp_id: string;
}

/**
 * แปลงแถวจากตาราง `m_user` ให้เป็นโครงสร้าง `AuthUser` ที่ใช้ในระบบ
 */
function mapRowToAuthUser(row: UserRow): AuthUser {
  return {
    id: row.user_id,
    username: row.user_id,
    name: row.user_name2,
    user_group: row.user_group,
  };
}

/**
 * ตรวจสอบข้อมูลเข้าสู่ระบบจากตาราง `m_user`
 * คืนค่า `AuthUser` หากถูกต้อง หรือ `null` หากไม่พบหรือฐานข้อมูลยังไม่พร้อม
 */
export async function validateUser(
  username: string,
  password: string,
): Promise<AuthUser | null> {
  try {
    const row = await authQueryOne<UserRow>(
      `
        SELECT user_id, user_name2, user_group
        FROM m_user
        WHERE user_id = ? AND user_password = ?
        LIMIT 1
      `,
      [username, password],
    );

    return row ? mapRowToAuthUser(row) : null;
  } catch (error) {
    logger.warn("[auth] validateUser database unavailable", {
      username,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * ตรวจสอบสิทธิ์ผู้ใช้งานจากตาราง `m_user_per`
 */
export async function validatePermissions(
  userId: string,
  projectId = "AJIS1",
): Promise<boolean> {
  try {
    const row = await authQueryOne<PermissionRow>(
      `
        SELECT emp_id
        FROM m_user_per
        WHERE emp_id = ? AND proj_id = ?
        LIMIT 1
      `,
      [userId, projectId],
    );

    return row !== null;
  } catch (error) {
    logger.warn("[auth] validatePermissions database unavailable", {
      userId,
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
