"use client";

import { useState } from "react";
import { useToast } from "@/libs/toast-provider";
import { ToastType } from "@/types/ui";

const PRESETS: { label: string; message: string; type: ToastType }[] = [
  { label: "✅ Success", message: "บันทึกข้อมูลเรียบร้อยแล้ว", type: "success" },
  { label: "❌ Error", message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", type: "error" },
  { label: "ℹ️ Info", message: "ระบบกำลังประมวลผลข้อมูลของคุณ", type: "info" },
  { label: "⚠️ Warning", message: "คุณไม่มีสิทธิ์เข้าใช้งานระบบนี้", type: "warning" },
];

export default function ToastPlayground() {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [customType, setCustomType] = useState<ToastType>("info");

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 transition-colors"
      >
        🔔 Toast
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-16 right-4 z-50 w-72 rounded-2xl border border-stone-200 bg-white p-4 shadow-2xl flex flex-col gap-3">
          <p className="text-sm font-bold text-stone-700">Toast Playground</p>

          {/* Preset buttons */}
          <div className="flex flex-col gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.type}
                onClick={() => showToast(p.message, p.type)}
                className="rounded-lg border border-stone-200 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          <hr className="border-stone-100" />

          {/* Custom message */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-stone-500">กำหนดเอง</p>
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="พิมพ์ข้อความ..."
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
            />
            <div className="flex gap-1">
              {(["success", "error", "info", "warning"] as ToastType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setCustomType(t)}
                  className={`flex-1 rounded-md py-1 text-xs font-medium transition-colors ${
                    customType === t
                      ? "bg-indigo-600 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => custom.trim() && showToast(custom.trim(), customType)}
              className="rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-40"
              disabled={!custom.trim()}
            >
              ยิง Toast
            </button>
          </div>
        </div>
      )}
    </>
  );
}
