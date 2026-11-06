import "server-only";
import mysql, { Pool, type PoolOptions } from "mysql2/promise";

type PoolConfig = {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  uri?: string;
};

declare global {
  var dbManagerInstance: DatabaseManager | undefined;
}

/**
 * OOP version ของตัวจัดการ Database Pools
 *
 * คำแนะนำสำหรับทีม:
 * - ในการเขียนฟีเจอร์ทั่วไป ให้เรียกใช้ `query`, `queryOne`, `execute` จาก `@/libs/db-query` เป็นหลัก
 * - คลาส `DatabaseManager` นี้มีไว้สำหรับกรณีที่ต้องการจัดการหลาย Datasource หรือต้องการสั่ง `closeAll()` ใน background script/worker
 */
export class DatabaseManager {
  private primaryPool?: Pool;
  private authPool?: Pool;
  private authPoolKey?: string;
  private readonly connectTimeout: number;

  constructor(
    connectTimeout = Number(process.env.DB_CONNECT_TIMEOUT_MS ?? 5000),
  ) {
    this.connectTimeout = connectTimeout;
  }

  getPrimaryPool(): Pool {
    if (!this.primaryPool) {
      this.primaryPool = this.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
    }

    return this.primaryPool;
  }

  getAuthPool(): Pool {
    const authBaseRaw = process.env.AUTHBASE_URL?.trim();

    if (!authBaseRaw) {
      return this.getPrimaryPool();
    }

    if (this.authPool && this.authPoolKey !== authBaseRaw) {
      void this.authPool.end().catch(() => undefined);
      this.authPool = undefined;
      this.authPoolKey = undefined;
    }

    if (!this.authPool) {
      const isUri = /^mysqls?:\/\//i.test(authBaseRaw);

      this.authPool = isUri
        ? this.createPool({ uri: authBaseRaw })
        : this.createPool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: authBaseRaw,
          });

      this.authPoolKey = authBaseRaw;
    }

    return this.authPool;
  }

  /**
   * ปิดทุก pool (เหมาะกับ script/job หรือ graceful shutdown)
   */
  async closeAll(): Promise<void> {
    const tasks: Promise<unknown>[] = [];

    if (this.primaryPool) {
      tasks.push(this.primaryPool.end());
      this.primaryPool = undefined;
    }

    if (this.authPool) {
      tasks.push(this.authPool.end());
      this.authPool = undefined;
      this.authPoolKey = undefined;
    }

    await Promise.all(tasks);
  }

  private createPool(config: PoolConfig): Pool {
    if (config.uri) {
      const separator = config.uri.includes("?") ? "&" : "?";
      return mysql.createPool(
        config.uri +
          separator +
          "namedPlaceholders=true&decimalNumbers=true&connectTimeout=" +
          this.connectTimeout,
      );
    }

    const options: PoolOptions = {
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

      connectTimeout: this.connectTimeout,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,

      namedPlaceholders: true,
      decimalNumbers: true,
    };

    return mysql.createPool(options);
  }
}

/**
 * เก็บ singleton instance บน globalThis เพื่อไม่ให้สร้าง Pool ซ้ำเมื่อ Next.js HMR reload
 */
export const dbManager =
  globalThis.dbManagerInstance ??
  (globalThis.dbManagerInstance = new DatabaseManager());

export function getDbOOP(): Pool {
  return dbManager.getPrimaryPool();
}

export function getAuthDbOOP(): Pool {
  return dbManager.getAuthPool();
}
