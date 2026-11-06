import "server-only";
import mysql, { Pool } from "mysql2/promise";

/**
 * เก็บ database pool แบบ singleton ไว้บน globalThis
 *
 * ใน local development, Next.js อาจ reload module บ่อย
 * การเก็บ pool ไว้บน globalThis ช่วยป้องกันการเปิด connection มากเกินจำเป็น
 */
declare global {
  var mysqlPool: Pool | undefined;
  var authPool: Pool | undefined;
  var authPoolKey: string | undefined;
}

/**
 * สร้าง MySQL pool ได้จาก:
 * - ค่าแยก host/user/password/database
 * - หรือ URI เต็มรูปแบบ
 */
function createPool(config: {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  uri?: string;
}): Pool {
  const connectTimeout = Number(process.env.DB_CONNECT_TIMEOUT_MS ?? 5000);

  if (config.uri) {
    // ต่อ option ของ pool ให้ถูกต้องเมื่อเชื่อมต่อผ่าน URI
    const separator = config.uri.includes("?") ? "&" : "?";
    return mysql.createPool(
      config.uri +
        separator +
        "namedPlaceholders=true&decimalNumbers=true&connectTimeout=" +
        connectTimeout,
    );
  }

  return mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,

    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,

    connectTimeout,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    namedPlaceholders: true,
    decimalNumbers: true,
  });
}

/**
 * คืนค่า pool ของฐานข้อมูลหลักของแอป
 * สร้างแบบ lazy เมื่อถูกเรียกครั้งแรก
 */
export function getDb(): Pool {
  globalThis.mysqlPool ??= createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  return globalThis.mysqlPool;
}

/**
 * คืนค่า pool ของฐานข้อมูลสำหรับ auth
 *
 * พฤติกรรมของ AUTHBASE_URL:
 * - ว่าง -> fallback ไปใช้ getDb()
 * - เป็น mysql URI -> เชื่อมต่อจาก URI โดยตรง
 * - เป็นข้อความธรรมดา -> มองเป็นชื่อ database บน host เดียวกัน
 */
export function getAuthDb(): Pool {
  const authBaseRaw = process.env.AUTHBASE_URL?.trim();

  if (!authBaseRaw) {
    // fallback ไปฐานหลักเมื่อไม่ได้ตั้ง AUTHBASE_URL
    return getDb();
  }

  if (globalThis.authPool && globalThis.authPoolKey !== authBaseRaw) {
    // รีเฟรช pool เดิมเมื่อค่า env เปลี่ยน (พบบ่อยใน local dev)
    void globalThis.authPool.end().catch(() => undefined);
    globalThis.authPool = undefined;
    globalThis.authPoolKey = undefined;
  }

  if (!globalThis.authPool) {
    const authBase = authBaseRaw;

    const isUri = /^mysqls?:\/\//i.test(authBase);

    if (isUri) {
      // AUTHBASE_URL เป็น DSN/connection string เต็มรูปแบบ
      globalThis.authPool = createPool({ uri: authBase });
    } else {
      // บาง environment ใช้ AUTHBASE_URL เป็นชื่อ auth database ไม่ใช่ URI
      globalThis.authPool = createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: authBase,
      });
    }

    globalThis.authPoolKey = authBaseRaw;
  }

  // เมื่อผ่านจุดนี้จะมีค่าแน่นอน
  return globalThis.authPool;
}
