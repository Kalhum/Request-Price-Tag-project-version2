/**
 * สถานะของรายการตัวอย่าง
 * ใช้เป็นตัวอย่างการกำหนด Union Type สำหรับฟิลด์ที่มีค่าจำกัด (Enum-like)
 */
export type ExampleStatus = "active" | "completed" | "archived";

/**
 * ข้อมูลตัวอย่างที่ส่งกลับจาก API และใช้ในฝั่ง UI (Domain / DTO Model)
 */
export type ExampleItem = {
  /** UUID ของรายการ */
  id: string;

  /** หัวข้อหลัก (required) */
  title: string;

  /** รายละเอียดเพิ่มเติม (optional) */
  description?: string;

  /** สถานะของรายการ (default: "active") */
  status: ExampleStatus;

  /** เวลาสร้างข้อมูลในรูป ISO 8601 string */
  createdAt: string;

  /** เวลาแก้ไขข้อมูลล่าสุดในรูป ISO 8601 string */
  updatedAt?: string;
};

/**
 * เงื่อนไขสำหรับค้นหา/กรองรายการ (ใช้ส่งเป็น Query Params ใน GET /api/example)
 */
export type ExampleFilter = {
  search?: string;
  status?: ExampleStatus;
};

/**
 * รูปแบบ payload สำหรับสร้างรายการใหม่ (POST /api/example)
 */
export type CreateExampleInput = {
  /** ต้องมีค่า ความยาว 1-120 ตัวอักษร */
  title: string;

  /** รายละเอียดเพิ่มเติม ไม่เกิน 500 ตัวอักษร (optional) */
  description?: string;

  /** สถานะเริ่มต้น ถ้าไม่ส่งจะใช้ค่า "active" (optional) */
  status?: ExampleStatus;
};

/**
 * รูปแบบ payload สำหรับแก้ไขรายการ (PATCH /api/example/[id])
 */
export type UpdateExampleInput = {
  title?: string;
  description?: string;
  status?: ExampleStatus;
};
