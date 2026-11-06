"use client";

import { UserRound, KeyRound, LogOut, CheckCircle2 } from "lucide-react";

import Navbar from "../companents/navbar/page.js";

function Sidebar() {
  return (
    <aside className="flex min-h-screen w-[182px] shrink-0 flex-col bg-linear-to-b from-secondary to-primary px-2 py-5 text-white">
      {/* Logo */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-white text-3xl font-bold">
          R
        </div>

        <h1 className="mt-2 text-lg font-medium leading-tight">
          Request Price Tags
        </h1>
        <p className="mt-1 text-left text-caption leading-4">
          พิมพ์ป้ายราคาจากทางเซลล์
        </p>
      </div>

      {/* User information */}
      <div className="mt-5 rounded-card bg-white/70 p-2 text-black shadow-card">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gray text-white">
            <UserRound size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] text-success">WELCOME</p>
            <p className="truncate text-[10px] font-semibold">คุณ op108</p>
          </div>

          <span className="ml-auto text-[8px] text-gray">Store Manager</span>
        </div>

        <button className="mt-2 flex w-full items-center justify-center gap-1 rounded-button bg-white py-1 text-[9px]">
          <KeyRound size={11} />
          เปลี่ยนรหัสผ่าน (Change Password)
        </button>
      </div>

      {/* Branch information */}
      <div className="mt-5">
        <p className="text-caption font-medium">คุณกำลังเลือกสาขา</p>

        <div className="mt-2 flex items-center justify-center gap-1 rounded-button border border-success-light bg-success/70 px-1 py-2 text-[9px] shadow-card">
          <CheckCircle2 size={12} className="text-success-light" />
          P0000-ร้านบรรทัดทอง
        </div>
      </div>

      {/* Branch search */}
      <div className="mt-9">
        <p className="text-label font-semibold">Branch Active</p>
        <p className="mt-1 text-[10px] text-white/70">สาขาที่ต้องการ</p>

        <div className="mt-2 flex gap-1">
          <input
            placeholder="พิมพ์รหัสหรือชื่อสาขา"
            className="input-default min-w-0 flex-1 px-2 py-1 text-[9px]"
          />
          <button className="btn-secondary px-2 py-1 text-caption font-medium">
            เลือก
          </button>
        </div>
      </div>

      <button className="mx-auto mt-10 w-[85%] rounded-button bg-gray px-2 py-2 text-caption font-semibold shadow-card">
        สาขาทั้งหมด 193
      </button>

      <button className="btn-danger mx-auto mt-9 flex w-[85%] items-center justify-center gap-2 py-2 text-caption font-medium shadow-card">
        <LogOut size={14} />
        ออกจากระบบ
      </button>
    </aside>
  );
}

function PriceTag({ index }) {
  return (
    <div className="w-full border-2 border-black bg-white p-2 text-black">
      <div className="flex justify-between text-[9px]">
        <span>05/01/2026</span>
        <span>P0000</span>
      </div>

      {/* Barcode */}
      <div
        className="mt-1 h-9 w-full bg-white"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #111 0px, #111 1px, transparent 1px, transparent 3px, #111 3px, #111 5px, transparent 5px, transparent 7px)",
        }}
      />

      <div className="flex justify-between text-[8px]">
        <span>438 D</span>
        <span>NR</span>
        <span>10450048</span>
        <span>885099320007</span>
      </div>

      <div className="mt-1 flex items-end justify-end">
        <span className="text-[42px] font-black leading-none">14</span>
        <span className="mb-1 text-lg font-bold">.00</span>
      </div>

      <div className="mt-1 flex items-center gap-1">
        <div className="flex h-6 w-7 items-center justify-center border-2 border-black text-caption">
          O
        </div>
      </div>

      <p className="mt-1 text-label font-medium">สิงห์น้ำดื่ม 1500มล.</p>
      <p className="text-[8px]">Singha Drinking Water 1500ml.</p>
    </div>
  );
}

function PriceTagPreview() {
  return (
    <section className="w-[220px] shrink-0">
      <h2 className="mb-6 text-center text-label font-bold">
        ตัวอย่างป้ายราคา
      </h2>

      <div className="card-default flex max-h-[470px] flex-col gap-2 overflow-hidden p-2">
        {[1, 2, 3, 4].map((item) => (
          <PriceTag key={item} index={item} />
        ))}
      </div>
    </section>
  );
}

function WelcomeBanner() {
  return (
    <section className="rounded-card bg-linear-to-r from-primary to-secondary px-4 py-3 text-white shadow-card">
      <h2 className="text-heading font-medium">
        Request Price Tags to SAHA Lawson
      </h2>

      <p className="mt-3 text-label leading-6">
        เป็นเว็บไซต์สำหรับหน้าร้านที่ต้องการร้องขอป้ายราคาจากทางสห ลอว์สัน
        <br />
        *** การจัดลำดับ Tier list เป็นข้อมูลล่าสุดของเดือน 05/2026
        <span className="text-danger-light"> (ข้อมูลที่แสดงยังไม่เป็นทางการ)</span>
      </p>
    </section>
  );
}

function WebsiteInfo() {
  return (
    <section className="card-default mt-14 w-[285px] p-6">
      <h2 className="text-subheading font-bold">ที่อยู่เว็บไซต์</h2>

      <p className="mt-4 text-subheading font-medium">
        <span className="text-danger">SAHA</span>{" "}
        <span className="text-secondary">LAWSON</span>
      </p>

      <p className="mt-5 break-all text-caption text-gray">
        http://www.chokchaipibul.com/reqpricetag
      </p>

      <p className="my-3 text-caption text-gray">หรือ</p>

      <p className="break-all text-caption text-gray">
        http://115.31.146.18/reqpricetag/
      </p>
    </section>
  );
}

export default function Homepage() {
  return (
    <main className="flex min-h-screen bg-surface">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Navbar />

        <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-layout p-layout max-lg:grid-cols-1">
          <PriceTagPreview />

          <div className="min-w-0">
            <WelcomeBanner />
            <WebsiteInfo />
          </div>
        </div>
      </div>
    </main>
  );
}