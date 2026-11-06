
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  UserRound,
  KeyRound,
  LogOut,
  CheckCircle2,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace("/login");
  };

  return (
    <aside
      style={{
        background: "linear-gradient(180deg, #318CE0 0%, #1761A8 50%, #123B75 100%)",
        color: "#FFFFFF",
      }}
      className="
        flex min-h-0 w-[20%]
        flex-col overflow-y-auto
        px-[9px] py-5
      "
    >
      {/* BRAND */}
      <div className="mb-8 text-center">
        <Image
          src="/images/logo-new.png"
          alt="Lawson Station"
          width={210}
          height={210}
          priority
          className="mx-auto h-[10rem] w-[10rem] object-contain"
        />

        <h1 className="mt-1 whitespace-nowrap text-[23px] font-normal leading-tight">
          Request Price Tags
        </h1>

        <p className="mt-1 whitespace-nowrap text-[15px] font-medium">
          ขอป้ายราคาจากทางหลวง สวอว์สัน
        </p>
      </div>

      {/* USER INFORMATION */}
      <div
        className="
          rounded-[14px] border border-white/50
          bg-white/65 p-[11px] text-primary shadow-md
        "
      >
        <div className="flex items-center gap-2">
          <div className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] bg-primary text-white">
            <UserRound size={23} strokeWidth={2} />

            <span className="absolute -bottom-1 -right-1 h-[12px] w-[12px] rounded-full border-2 border-white bg-success" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wide text-success">
              WELCOME
            </p>

            <p className="mt-0.5 whitespace-nowrap text-[12px] font-bold text-slate-800">
              คุณ op108
            </p>
          </div>

          <span className="whitespace-nowrap text-[10px] text-slate-600">
            Store Manager
          </span>
        </div>

        <div className="my-2.5 border-t border-white/50" />

        <button
          type="button"
          className="
            flex w-full items-center justify-center gap-1.5
            rounded-[7px] bg-white px-2 py-1.5
            text-[11px] font-medium text-slate-700
            transition hover:bg-slate-100
          "
        >
          <KeyRound size={14} />
          เปลี่ยนรหัสผ่าน (Change Password)
        </button>
      </div>

      {/* SELECTED BRANCH */}
      <section className="mt-7">
        <h2 className="mb-2 text-[16px] font-bold">
          คุณกำลังเลือกสาขา
        </h2>

        <div
          className="
            mx-1 flex min-h-[37px] items-center justify-center gap-2
            rounded-[9px] border border-green-400
            bg-emerald-700 px-2 py-2
            text-[12px] font-bold text-emerald-100
            shadow-[0_0_8px_rgba(34,197,94,0.45)]
          "
        >
          <CheckCircle2 size={15} className="shrink-0 text-emerald-300" />
          P0000-ร้านแรกทดลอง
        </div>
      </section>

      {/* BRANCH ACTIVE */}
      <section className="mt-12">
        <h2 className="text-[18px] font-bold leading-tight">
          Branch Active
        </h2>

        <p className="mb-2 mt-1 text-[13px]">
          สาขาที่ใช้งาน
        </p>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="พิมพ์รหัสหรือชื่อสาขา"
            className="
              h-[35px] min-w-0 flex-1 rounded-[7px]
              bg-white px-2.5 text-[12px] text-slate-800
              placeholder:text-slate-400 outline-none
              focus:ring-2 focus:ring-secondary
            "
          />

          <button
            type="button"
            className="
              h-[35px] shrink-0 rounded-[8px]
              bg-secondary px-4 text-[13px] font-bold
              text-white transition hover:opacity-90
            "
          >
            เลือก
          </button>
        </div>
      </section>

      {/* TOTAL BRANCH */}
      <section className="mt-12 px-4">
        <button
          type="button"
          className="
            flex h-[44px] w-full items-center justify-center
            rounded-[12px] bg-slate-600
            text-[15px] font-bold text-white shadow-md
            transition hover:bg-slate-700
          "
        >
          สาขาทั้งหมด 193
        </button>
      </section>

      {/* LOGOUT */}
      <div className="mt-auto px-4 pb-5 pt-10">
        <button
          type="button"
          onClick={handleLogout}
          className="
            flex h-[43px] w-full items-center justify-center gap-2
            rounded-[11px]
            bg-red-600 hover:bg-red-700
            text-[15px] font-bold text-white shadow-md
            transition active:scale-[0.98]
          "
        >
          <LogOut size={18} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
