"use client";

import { UserRound, KeyRound, LogOut, CheckCircle2 } from "lucide-react";

import Navbar from "../companents/navbar/page.js";

function Sidebar() {
  return (
    <aside className="flex min-h-screen w-[182px] shrink-0 flex-col bg-gradient-to-b from-sky-500 to-blue-800 px-2 py-5 text-white">
      {/* Logo */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-white text-3xl font-bold">
          R
        </div>

        <h1 className="mt-2 text-lg font-medium leading-tight">
          Request Price Tags
        </h1>
        <p className="mt-1 text-left text-xs leading-4">
          พิมพ์ป้ายราคาจากทางเซลล์
        </p>
      </div>

      {/* User information */}
      <div className="mt-5 rounded-xl bg-white/70 p-2 text-slate-800 shadow">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-white">
            <UserRound size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] text-emerald-700">WELCOME</p>
            <p className="truncate text-[10px] font-semibold">คุณ op108</p>
          </div>

          <span className="ml-auto text-[8px] text-slate-500">
            Store Manager
          </span>
        </div>

        <button className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-white py-1 text-[9px]">
          <KeyRound size={11} />
          เปลี่ยนรหัสผ่าน (Change Password)
        </button>
      </div>

      {/* Branch information */}
      <div className="mt-5">
        <p className="text-xs font-medium">คุณกำลังเลือกสาขา</p>

        <div className="mt-2 flex items-center justify-center gap-1 rounded-lg border border-emerald-400 bg-emerald-900/70 px-1 py-2 text-[9px] shadow">
          <CheckCircle2 size={12} className="text-emerald-400" />
          P0000-ร้านบรรทัดทอง
        </div>
      </div>

      {/* Branch search */}
      <div className="mt-9">
        <p className="text-sm font-semibold">Branch Active</p>
        <p className="mt-1 text-[10px] text-white/70">สาขาที่ต้องการ</p>

        <div className="mt-2 flex gap-1">
          <input
            placeholder="พิมพ์รหัสหรือชื่อสาขา"
            className="min-w-0 flex-1 rounded-md bg-white px-2 py-1 text-[9px] text-slate-700 outline-none"
          />
          <button className="rounded-md bg-sky-500 px-2 text-xs font-medium">
            เลือก
          </button>
        </div>
      </div>

      <button className="mx-auto mt-10 w-[85%] rounded-lg bg-slate-600 px-2 py-2 text-xs font-semibold shadow-md">
        สาขาทั้งหมด 193
      </button>

      <button className="mx-auto mt-9 flex w-[85%] items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-xs font-medium shadow-md hover:bg-red-700">
        <LogOut size={14} />
        ออกจากระบบ
      </button>
    </aside>
  );
}

function headercontentBody() {
  return (
    <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <section className="rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-3 text-white shadow-sm">
        <h2 className="text-2xl font-medium">
          ส่วนของการจัดการประเภทของสินค้า
        </h2>

        <div className="container-text-body flex flex gap-2">
          <p className="mt-3 text-sm leading-6">ประเภทของสินค้ามีดังนี้:</p>

          <p className="mt-3 text-sm leading-6">C = Core SKU</p>

          <p className="mt-3 text-sm leading-6">O = Optional SKUs:</p>
        </div>
      </section>
    </section>
  );
}

export default function Homepage() {
  return (
    <main className="flex min-h-screen bg-[#f1f2f7]">
      <Sidebar />

      <div className="min-w-0 flex-1  ">
        <Navbar />
        <div className="flex w-full items-center justify-center px-6 py-5">
          {headercontentBody()}
        </div>
      </div>
    </main>
  );
}
