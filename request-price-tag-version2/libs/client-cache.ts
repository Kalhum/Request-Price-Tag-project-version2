/**
 * แคชแบบ in-memory ขนาดเล็กสำหรับฝั่ง client
 *
 * หมายเหตุ:
 * - อยู่เฉพาะใน process ปัจจุบัน (หายเมื่อ refresh/restart)
 * - เหมาะกับแคชอายุสั้นใน runtime เดียวกัน
 * - ไม่ใช่ตัวแทนของแคชถาวรหรือแคชแบบแชร์ข้ามเครื่อง
 */
type CacheEntry<T> = {
  // ข้อมูลที่ถูกแคช
  data: T;

  // เวลาหมดอายุแบบ absolute timestamp หน่วยมิลลิวินาที
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * อ่านค่าจากแคชเมื่อมีคีย์และยังไม่หมดอายุ
 */
export function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  // ลบคีย์ที่หมดอายุเมื่อมีการเข้าถึง (lazy expiration)
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * เก็บค่าในแคชพร้อม TTL (มิลลิวินาที)
 */
export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * ลบแคชตาม prefix ของคีย์
 * เหมาะเมื่อ resource ที่เกี่ยวข้องตั้งชื่อคีย์เป็นกลุ่มเดียวกัน
 */
export function cacheInvalidate(keyPrefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) {
      cache.delete(key);
    }
  }
}

/**
 * ล้างแคชทั้งหมด
 */
export function cacheClear(): void {
  cache.clear();
}
