"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const MINIMUM_REMAINING_DAYS = 5;

type ModalType = "expire" | "remain" | null;

export default function PasswordValidate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ModalType>(null);

  const modalContent = useMemo(() => {
    if (type === "expire") {
      return {
        title: "รหัสผ่านหมดอายุ",
        detail: "รหัสผ่านของคุณหมดอายุแล้ว กรุณาเปลี่ยนรหัสผ่านเพื่อใช้งานระบบต่อ",
        confirmText: "ไปหน้าเปลี่ยนรหัสผ่าน",
        cancelText: "",
        allowCancel: false,
      };
    }

    return {
      title: "แจ้งเตือนรหัสผ่านใกล้หมดอายุ",
      detail: "รหัสผ่านของคุณใกล้หมดอายุ กรุณาเปลี่ยนรหัสผ่านเพื่อป้องกันการเข้าใช้งานไม่ได้",
      confirmText: "เปลี่ยนรหัสผ่าน",
      cancelText: "ภายหลัง",
      allowCancel: true,
    };
  }, [type]);

  useEffect(() => {
    if (status !== "authenticated") {
      setOpen(false);
      setType(null);
      return;
    }

    const branchGroup = String(session?.user?.branchGroup ?? "");
    if (branchGroup !== "SLC") {
      setOpen(false);
      setType(null);
      return;
    }

    const remainingDays = Number(session?.user?.remaining_days ?? 999);
    const isExpired = Boolean(session?.user?.is_expire);

    if (isExpired) {
      setType("expire");
      setOpen(true);
      return;
    }

    if (remainingDays <= MINIMUM_REMAINING_DAYS) {
      setType("remain");
      setOpen(true);
      return;
    }

    setOpen(false);
    setType(null);
  }, [session, status]);

  if (!open || !type) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className={`text-xl font-bold ${type === "expire" ? "text-red-600" : "text-amber-600"}`}>
          {modalContent.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{modalContent.detail}</p>

        <div className="mt-6 flex justify-end gap-2">
          {modalContent.allowCancel ? (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {modalContent.cancelText}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/password");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
              type === "expire" ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {modalContent.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
