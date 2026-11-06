import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ตัวช่วยประกอบค่า className
 *
 * - clsx: รองรับการประกอบ class แบบเงื่อนไข/array/object
 * - twMerge: จัดการ class ของ Tailwind ที่ชนกัน (เช่น p-2 กับ p-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
