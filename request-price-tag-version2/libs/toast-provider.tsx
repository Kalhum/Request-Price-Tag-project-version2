"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Toast, ToastType } from "@/types/ui";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/libs/utils";

/**
 * สัญญาการใช้งานที่ component ฝั่ง UI เรียกผ่าน useToast()
 */
interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

/**
 * ตั้งค่าเริ่มต้นเป็น undefined โดยตั้งใจ
 * เพื่อให้ useToast โยน error ชัดเจนเมื่อไม่มี provider ครอบอยู่
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook สำหรับแสดง toast จาก component ลูกใดๆ ภายใต้ provider
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

/**
 * Global toast provider
 *
 * สรุปพฤติกรรม:
 * - เก็บ toasts ที่กำลังแสดงไว้ใน local state
 * - รองรับทั้งการปิดเองและปิดอัตโนมัติ
 * - render เป็น overlay ชั้นบนสุดของหน้าจอ
 */
export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ลบ toast รายการเดียวตาม id
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * เพิ่ม toast ใหม่
   * duration === Infinity คือค้างไว้จนผู้ใช้กดปิดเอง
   */
  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      // id แบบเบาๆ สำหรับใช้เป็น React key ของ list
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration !== Infinity) {
        // ปิดอัตโนมัติตามเวลาที่กำหนด
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Overlay กลางจอสำหรับแสดง toasts ที่ active ทั้งหมด */}
      <div className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * คอมโพเนนต์แสดงผลการ์ด toast
 * วาง icon/color mapping ไว้ใกล้ JSX เพื่อปรับแต่งได้ง่าย
 */
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-200",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-6 rounded-3xl border px-12 py-8 shadow-2xl transition-all animate-in fade-in zoom-in-95 min-w-120 max-w-2xl",
        bgColors[toast.type],
      )}
      role="alert"
    >
      <div className="shrink-0 [&>svg]:h-12 [&>svg]:w-12">
        {icons[toast.type]}
      </div>
      <div className="text-xl font-semibold text-stone-800">
        {toast.message}
      </div>
      <button
        // ปิดเองได้เสริมจาก auto-dismiss และรองรับ duration = Infinity
        onClick={onClose}
        className="ml-auto shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
}
