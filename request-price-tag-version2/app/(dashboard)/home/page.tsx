"use client";

import Link from "next/link";
import {
  ClipboardList,
  FilePlus2,
  PackageCheck,
  Printer,
} from "lucide-react";
import { useHomeContent } from "@/hook/use-home-content";
import { useBranch } from "@/components/BranchProvider";
import type { HomeContent } from "@/types/home";
import Footer from "../../../components/Footer";

const QUICK_LINKS = [
  {
    href: "/createRequest",
    label: "สร้างคำร้องขอ",
    description: "ค้นหาสินค้าและส่งคำร้องขอป้ายราคา",
    icon: FilePlus2,
  },
  {
    href: "/printingCategory",
    label: "พิมพ์ป้ายตามหมวดหมู่",
    description: "เลือกหมวดหมู่และสาขาที่ต้องการ",
    icon: Printer,
  },
  {
    href: "/printtingRequest",
    label: "รายการรอพิมพ์",
    description: "ตรวจสอบคำร้องที่สร้างไว้",
    icon: ClipboardList,
  },
  {
    href: "/report",
    label: "รายงานและพิมพ์ซ้ำ",
    description: "ดูประวัติและรายละเอียดเอกสาร",
    icon: PackageCheck,
  },
];

function PriceTag({ priceTag }: { priceTag: HomeContent["priceTag"] }) {
  return (
    <div className="w-full border-2 border-black bg-white p-2 text-black">
      <div className="flex justify-between text-[9px]">
        <span>{priceTag.date}</span>
        <span>{priceTag.branch}</span>
      </div>

      <div
        aria-label="ตัวอย่างบาร์โค้ด"
        className="mt-1 h-9 w-full bg-white"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #111 0px, #111 1px, transparent 1px, transparent 3px, #111 3px, #111 5px, transparent 5px, transparent 7px)",
        }}
      />

      <div className="flex justify-between text-[8px]">
        <span>{priceTag.days} D</span>
        <span>NR</span>
        <span>{priceTag.itemCode}</span>
        <span>{priceTag.barcode}</span>
      </div>

      <div className="mt-1 flex items-end justify-end">
        <span className="text-[42px] font-black leading-none">
          {Math.floor(priceTag.price)}
        </span>
        <span className="mb-1 text-lg font-bold">.00</span>
      </div>

      <div className="mt-1 flex items-center gap-1">
        <div className="flex h-6 w-7 items-center justify-center border-2 border-black text-caption">
          {priceTag.category === "Core SKU" ? "C" : "O"}
        </div>
      </div>

      <p className="mt-1 text-label font-medium">{priceTag.name}</p>
      <p className="text-[8px]">{priceTag.englishName}</p>
    </div>
  );
}

function PriceTagPreview({
  priceTag,
}: {
  priceTag: HomeContent["priceTag"];
}) {
  return (
    <section className="card-default p-5">
      <h2 className="mb-4 text-subheading font-bold text-primary">
        ตัวอย่างป้ายราคา
      </h2>
      <div className="mx-auto max-w-sm rounded-card border border-slate-200 bg-surface p-3">
        <PriceTag priceTag={priceTag} />
      </div>
    </section>
  );
}

function WelcomeBanner({
  content,
}: {
  content: HomeContent;
}) {
  return (
    <section className="rounded-card bg-linear-to-r from-primary to-secondary p-6 text-white shadow-card sm:p-8">
      <p className="text-sm font-medium text-white/80">SAHA LAWSON</p>
      <h1 className="mt-1 text-heading font-semibold sm:text-3xl">
        Request Price Tags to SAHA Lawson
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/90 sm:text-base">
        {content.description}
      </p>
      <p className="mt-5 inline-flex flex-wrap items-center gap-x-1 gap-y-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white">
        <span>Tier list เดือน {content.tierListMonth}</span>
        <span className="text-white/75">({content.tierListDisclaimer})</span>
      </p>
    </section>
  );
}

function WebsiteInfo({ websites }: { websites: string[] }) {
  return (
    <section className="card-default p-5">
      <h2 className="text-subheading font-bold text-primary">ที่อยู่เว็บไซต์</h2>
      <p className="mt-1 text-sm text-gray">SAHA LAWSON Request Price Tag</p>
      <ul className="mt-4 space-y-3">
        {websites.map((website) => (
          <li key={website}>
            <a
              href={website}
              className="break-all text-sm text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
            >
              {website}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Homepage() {
  const { data, error } = useHomeContent();
  const { branchId } = useBranch();
  const content: HomeContent = data ?? {
    title: "Request Price Tags to SAHA Lawson",
    description:
      "เป็นเว็บไซต์สำหรับหน้าร้านที่ต้องการร้องขอป้ายราคาจากทางสห ลอว์สัน",
    tierListMonth: "05/2026",
    tierListDisclaimer: "ข้อมูลที่แสดงยังไม่เป็นทางการ",
    websites: [
      "http://www.chokchaipibul.com/reqpricetag",
      "http://115.31.146.18/reqpricetag/",
    ],
    priceTag: {
      branch: branchId,
      date: "05/01/2026",
      days: 438,
      itemCode: "10450048",
      barcode: "885099320007",
      price: 14,
      category: "Optional SKU",
      name: "สิงห์น้ำดื่ม 1500มล.",
      englishName: "Singha Drinking Water 1500ml.",
    },
  };

  return (
    <div className="flex min-h-full flex-col gap-6 p-layout">
      <div className="flex-1 space-y-6">
        {error && (
          <p
            role="alert"
            className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <WelcomeBanner content={content} />

        <section aria-labelledby="quick-links-heading">
          <div className="mb-3">
            <h2
              id="quick-links-heading"
              className="text-subheading font-bold text-primary"
            >
              เมนูเริ่มต้นใช้งาน
            </h2>
            <p className="mt-1 text-sm text-gray">
              เลือกเมนูเพื่อเริ่มทำรายการ
            </p>
          </div>
          <nav
            aria-label="เมนูหลัก"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="card-default group flex min-h-28 items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-primary group-hover:underline">
                    {label}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-gray">
                    {description}
                  </span>
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <PriceTagPreview priceTag={content.priceTag} />
          <WebsiteInfo websites={content.websites} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
