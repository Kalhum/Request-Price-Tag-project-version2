"use client";

import React from "react";
import BarcodeSvg from "./BarcodeSvg";
import type { PrintingProduct } from "@/types/printing";

export interface PriceTagProps {
  product: PrintingProduct;
  branchId?: string;
  date?: string;
  tierLetter?: string;
  className?: string;
}

/**
 * คอมโพเนนต์ป้ายราคาสินค้าตามแบบฟอร์มมาตรฐาน
 * ปรับปรุงขนาดและระยะ Margin/Padding ไม่ให้ตัวอักษรหรือตัวเลขราคาชน/ล้นกรอบ
 */
export default function PriceTag({
  product,
  branchId = "P0000",
  date = "05/01/2026",
  tierLetter = "C",
  className = "",
}: PriceTagProps) {
  // แยกส่วนจำนวนเต็มและทศนิยมของราคา (เช่น 49.00 => "49", "00")
  const numericPrice = Number(product.price) || 0;
  const formattedPrice = numericPrice.toFixed(2);
  const [priceInteger, priceDecimal] = formattedPrice.split(".");

  return (
    <article
      className={`print-price-tag relative flex flex-col justify-between overflow-hidden border-[1.5px] border-black bg-white px-2.5 py-1.5 text-black select-none box-border ${className}`}
      style={{
        width: "64mm",
        height: "34mm",
        boxSizing: "border-box",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      {/* 1. แถวบนสุด: วันที่ (ซ้าย) - รหัสสาขา/เครื่อง (ขวา) */}
      <div className="flex items-center justify-between text-[9px] font-semibold leading-none">
        <span>{date}</span>
        <span className="font-bold tracking-tight pr-0.5">{branchId}</span>
      </div>

      {/* 2. แถบบาร์โค้ด คมชัด ไม่ชิดขอบ */}
      <div className="my-0.5 w-full px-0.5">
        <BarcodeSvg
          value={product.barcode || "885099320007"}
          className="h-5 w-full"
          height={20}
        />
      </div>

      {/* 3. แถวใต้บาร์โค้ด: 4 คอลัมน์ (Days, NR, ItemCode, Barcode) */}
      <div className="flex items-center justify-between text-[7.5px] font-semibold leading-none tracking-tight">
        <span className="w-10 text-left">{product.days || "14 D"}</span>
        <span className="text-center">NR</span>
        <span className="text-center">{product.itemCode || "17270144"}</span>
        <span className="text-right font-bold pr-0.5 tracking-tighter">
          {product.barcode || "885099320007"}
        </span>
      </div>

      {/* 4. ส่วนตรงกลาง: ป้ายตัวอักษรย่อ (ซ้าย) และตัวเลขราคา (ขวา) เว้นระยะห่างจากขอบขวา */}
      <div className="mt-0.5 flex items-center justify-between pr-1">
        {/* กล่องสี่เหลี่ยมตัวอักษร C */}
        <div className="flex h-4.5 w-4.5 items-center justify-center border-[1.5px] border-black text-[10px] font-black leading-none">
          {tierLetter}
        </div>

        {/* ตัวเลขราคาแบบยกลอย ไม่เบียดขอบ */}
        <div className="flex items-start font-black leading-none tracking-tight">
          <span className="text-[26px] font-black leading-none">
            {priceInteger}
          </span>
          <span className="ml-0.5 text-[13px] font-black leading-none">
            .{priceDecimal}
          </span>
        </div>
      </div>

      {/* 5. ส่วนล่างสุด: ชื่อสินค้าภาษาไทย และภาษาอังกฤษ เว้นระยะขอบขวา */}
      <div className="mt-0.5 pr-0.5">
        <p className="truncate text-[10px] font-bold leading-tight text-black">
          {product.name || "ซันชายน์เดรี่ นมโปรตีนกลิ่นบัตเตอร์สก็อตช์ 340มล."}
        </p>
        <p className="truncate text-[8px] font-medium leading-tight text-black/80 mt-0.5">
          {product.english || "Sunshine Dairy High Protein Butter Scotch 340 ml."}
        </p>
      </div>
    </article>
  );
}
