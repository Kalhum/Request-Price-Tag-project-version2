import "server-only";

// ระดับ log ที่รองรับใน logger กลางของระบบ
type LogLevel = "info" | "warn" | "error" | "debug";

/**
 * logger กลางของแอปพลิเคชัน
 * ปัจจุบันครอบ console ไว้ แต่สามารถขยายไปใช้บริการภายนอก
 * เช่น Sentry, Winston หรือ Datadog ได้ง่าย
 */
class Logger {
  /**
   * สร้างรูปแบบข้อความ log มาตรฐานหนึ่งรูปแบบ
   * การรวมไว้จุดเดียวช่วยให้ทุกระดับ log มีโครงเดียวกัน
   */
  private formatMessage(level: LogLevel, message: string, context?: unknown) {
    const timestamp = new Date().toISOString();
    const contextString = context
      ? ` | Context: ${JSON.stringify(context)}`
      : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextString}`;
  }

  /**
   * log ระดับ info สำหรับจุด checkpoint ใน flow ปกติ
   */
  info(message: string, context?: unknown) {
    console.info(this.formatMessage("info", message, context));
  }

  /**
   * log ระดับ warn สำหรับเหตุการณ์ผิดปกติที่คาดไว้/กู้คืนได้
   */
  warn(message: string, context?: unknown) {
    console.warn(this.formatMessage("warn", message, context));
  }

  /**
   * log ระดับ error พร้อมรองรับการ normalize Error object
   *
   * หากรับ Error instance จะเก็บฟิลด์หลัก (name/message/stack)
   * และรวม custom properties ที่เป็น enumerable เพิ่มเติมด้วย
   */
  error(message: string, error?: unknown, context?: unknown) {
    let errorDetails: unknown = error;

    if (error instanceof Error) {
      const details: Record<string, unknown> = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };

      // คัดลอก enumerable properties เพิ่มเติมจาก custom errors
      Object.keys(error).forEach((key) => {
        if (!(key in details)) {
          details[key] = (error as unknown as Record<string, unknown>)[key];
        }
      });
      errorDetails = details;
    }

    console.error(
      this.formatMessage("error", message, { error: errorDetails, context }),
    );
  }

  /**
   * log ระดับ debug จะแสดงเฉพาะนอก production
   */
  debug(message: string, context?: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatMessage("debug", message, context));
    }
  }
}

export const logger = new Logger();
