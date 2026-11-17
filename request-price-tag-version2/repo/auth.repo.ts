import "server-only";
import { authQueryOne } from "@/libs/db-query";
import { logger } from "@/libs/logger";
import type { RowDataPacket } from "mysql2/promise";

/**
 * Auth Repository
 *
 * เก็บการตรวจสอบบัญชีทดสอบสำหรับ Login และการตรวจสิทธิ์จากฐานข้อมูล
 * เมื่อเชื่อมต่อระบบจริง ให้เปลี่ยน `validateUser` มาอ่านตาราง `m_user`
 * ส่วน `validatePermissions` ใช้ตาราง `m_user_per`
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

interface PermissionRow extends RowDataPacket {
  emp_id: string;
}

// บัญชีทดสอบชั่วคราว; เปลี่ยนเฉพาะ repository นี้เป็นการ query ฐานข้อมูลภายหลัง
const MOCK_USER = {
  id: "demo",
  username: "demo",
  password: "password123",
  name: "ผู้ใช้ทดสอบ",
  user_group: "demo",
};

/**
 * ตรวจสอบข้อมูลรับเข้ากับบัญชี mock; เปลี่ยนเป็น query `m_user` ได้เมื่อพร้อมใช้ฐานข้อมูลจริง
 */
export async function validateUser(
  username: string,
  password: string,
): Promise<AuthUser | null> {
  if (username !== MOCK_USER.username || password !== MOCK_USER.password) {
    return null;
  }
  return {
    id: MOCK_USER.id,
    username: MOCK_USER.username,
    name: MOCK_USER.name,
    user_group: MOCK_USER.user_group,
  };
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
    logger.error("[auth] validatePermissions database unavailable", error);
    throw error;
  }
}
