"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Download,
  Maximize2,
  Menu,
  Minimize2,
  Minus,
  Plus,
  Printer,
  RotateCw,
  Scissors,
  X,
} from "lucide-react";
import PriceTag from "./PriceTag";
import type { PrintingProduct, PrintingRequest } from "@/types/printing";

export interface PrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  printingRequest: PrintingRequest | null;
  products: PrintingProduct[];
  branchId: string;
  onConfirmPrint: (copies: number, printer: string) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
  totalQuantity?: number;
}

const TAGS_PER_PAGE = 24; // 3 col × 8 row per A4

// ─── Mini barcode strip (pure CSS, จำลอง barcode) ───────────────────────────
function MiniBarcode() {
  return (
    <div
      style={{
        height: "3.5px",
        width: "100%",
        background:
          "repeating-linear-gradient(90deg,#000 0px,#000 0.4px,transparent 0.4px,transparent 0.8px)",
        marginBottom: "0.4px",
      }}
    />
  );
}

// ─── Thumbnail ของป้ายราคา 1 ใบ (ใช้ใน sidebar page thumbnail) ──────────────
function MiniPriceTag({ product }: { product: PrintingProduct }) {
  const price = Number(product.price) || 0;
  const [priceInt, priceDec] = price.toFixed(2).split(".");
  return (
    <div
      style={{
        border: "0.6px solid #111",
        background: "#fff",
        width: "100%",
        height: "17px",
        lineHeight: 1,
        padding: "1.2px 1.4px",
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "0.6px",
      }}
    >
      {/* แถววันที่ + สาขา */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "2.2px",
          fontWeight: 700,
          color: "#000",
        }}
      >
        <span>05/10/2569</span>
        <span>P0000</span>
      </div>

      {/* Barcode */}
      <MiniBarcode />

      {/* Sub info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "1.8px",
          color: "#000",
          gap: "1px",
        }}
      >
        <span style={{ fontWeight: 700 }}>14 D</span>
        <span style={{ fontWeight: 700 }}>NR</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {product.itemCode || "17270144"}
        </span>
      </div>

      {/* ราคา (ขวา) + กล่อง C (ซ้าย) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flex: 1 }}>
        <div
          style={{
            border: "0.6px solid #000",
            width: "4px",
            height: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.4px",
            fontWeight: 900,
            color: "#000",
          }}
        >
          C
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", fontWeight: 900 }}>
          <span style={{ fontSize: "6px", lineHeight: 1, color: "#000" }}>{priceInt}</span>
          <span style={{ fontSize: "2.6px", lineHeight: 1, color: "#000" }}>.{priceDec}</span>
        </div>
      </div>

      {/* ชื่อสินค้า */}
      <div
        style={{
          fontSize: "2px",
          fontWeight: 700,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "#000",
        }}
      >
        {product.name || "สิงห์น้ำดื่ม 1500 มล."}
      </div>
    </div>
  );
}

// ─── Thumbnail หน้า A4 1 แผ่นใน sidebar ─────────────────────────────────────
function PageThumbnail({
  page,
  isActive,
  onClick,
}: {
  page: { pageNumber: number; products: PrintingProduct[] };
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 focus:outline-none"
    >
      {/* แผ่นกระดาษ A4 ย่อส่วน */}
      <div
        className={`bg-white transition-all ${
          isActive
            ? "ring-2 ring-sky-400 shadow-lg"
            : "ring-1 ring-black/20 group-hover:ring-slate-400"
        }`}
        style={{
          width: "120px",
          height: "170px",
          padding: "5px 4px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Header บนสุด */}
        <div
          style={{
            borderBottom: "0.5px dashed #aaa",
            marginBottom: "2.5px",
            paddingBottom: "1.5px",
            fontSize: "2.6px",
            color: "#000",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "0.1px",
          }}
        >
          LAWSON PRICE TAG
        </div>

        {/* Grid 3 × 8 ป้ายราคา */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "2px",
          }}
        >
          {Array.from({ length: TAGS_PER_PAGE }, (_, idx) => {
            const product = page.products[idx % Math.max(page.products.length, 1)];
            if (!product) return <div key={idx} style={{ height: "17px" }} />;
            return <MiniPriceTag key={idx} product={product} />;
          })}
        </div>

        {/* Footer ล่างสุด */}
        <div
          style={{
            borderTop: "0.5px solid #e5e7eb",
            marginTop: "2px",
            paddingTop: "1px",
            fontSize: "2px",
            color: "#9ca3af",
            lineHeight: 1,
          }}
        >
          Request Price Tag System
        </div>
      </div>

      {/* เลขหน้า */}
      <span
        className={`text-[12px] transition-colors ${
          isActive
            ? "font-bold text-sky-400"
            : "text-slate-400 group-hover:text-slate-200"
        }`}
      >
        {page.pageNumber}
      </span>
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PrintSheetModal({
  isOpen,
  onClose,
  printingRequest,
  products,
  branchId,
  onConfirmPrint,
  isLoading = false,
  errorMessage = null,
  totalQuantity,
}: PrintSheetModalProps) {
  // ⚠️ ALL hooks must be declared BEFORE any early return (React Rules of Hooks)
  const [zoom, setZoom] = useState<number>(120);
  const [showCutGuides, setShowCutGuides] = useState<boolean>(true);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [activePageIndex, setActivePageIndex] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFitWidth, setIsFitWidth] = useState<boolean>(false);
  const [printer, setPrinter] = useState<string>("zebra");
  const [copies, setCopies] = useState<number>(1);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pageRefMap = useRef<Record<number, HTMLDivElement | null>>({});

  // Scroll spy — ตรวจจับหน้าปัจจุบันเมื่อ scroll
  const handleMainScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top;

    // วน loop จากหน้าสุดท้ายถึงหน้าแรก หาหน้าที่ scroll ผ่านไปแล้ว
    const pageIds = Object.keys(pageRefMap.current)
      .map(Number)
      .sort((a, b) => a - b);

    let detectedPage = pageIds[0] ?? 1;
    for (const pageNum of pageIds) {
      const el = pageRefMap.current[pageNum];
      if (el) {
        const { top } = el.getBoundingClientRect();
        if (top - containerTop <= 60) {
          detectedPage = pageNum;
        }
      }
    }

    setActivePageIndex((prev) => {
      if (prev === detectedPage) return prev; // ไม่ re-render ถ้าไม่เปลี่ยน
      // scroll sidebar thumbnail ให้ติดตาม
      const sidebar = sidebarRef.current;
      if (sidebar) {
        const thumbEl = sidebar.querySelector(
          `[data-page-thumb="${detectedPage}"]`
        ) as HTMLElement | null;
        thumbEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
      return detectedPage;
    });
  }, []);

  // ───── Early return หลัง hooks ทุกตัว ─────
  if (!isOpen || !printingRequest) return null;

  // ───── Derived values ─────
  const effectiveProducts =
    products.length > 0
      ? products
      : [
          {
            barcode: "885099320007",
            english: "Singha Drinking Water 1500ml.",
            name: "สิงห์น้ำดื่ม 1500 มล.",
            price: 14,
            days: "438 D",
            itemCode: "10450048",
          },
        ];

  const totalTags = Math.max(1, totalQuantity ?? printingRequest.quantity ?? 1);
  const totalPages = Math.max(1, Math.ceil(totalTags / TAGS_PER_PAGE));

  const pages = Array.from({ length: totalPages }, (_, pageIdx) => {
    const startIndex = pageIdx * TAGS_PER_PAGE;
    const countThisPage = Math.min(TAGS_PER_PAGE, totalTags - startIndex);
    const pageItems = Array.from({ length: countThisPage }, (_, idx) => {
      const itemIndex = (startIndex + idx) % effectiveProducts.length;
      return effectiveProducts[itemIndex];
    });
    return { pageNumber: pageIdx + 1, products: pageItems };
  });

  const formattedDate = new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(printingRequest.date || Date.now()));

  const fileName = `${printingRequest.documentNumber || "Price_Tag_Sheet"}.pdf`;
  const currentZoom = isFitWidth ? 130 : zoom;

  const handlePrint = async () => await onConfirmPrint(copies, printer);

  const scrollToPage = (pageNum: number) => {
    setActivePageIndex(pageNum);
    const el = pageRefMap.current[pageNum];
    if (el && scrollContainerRef.current) {
      const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      scrollContainerRef.current.scrollBy({
        top: elTop - containerTop - 48,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="print-modal-backdrop fixed inset-0 z-[1000] flex flex-col bg-[#323639] font-sans text-slate-100 select-none"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if ((e.ctrlKey || e.metaKey) && e.key === "p") {
          e.preventDefault();
          handlePrint();
        }
      }}
    >
      {/* =====================================================================
          1. TOP TOOLBAR — Chrome PDF Viewer style
      ===================================================================== */}
      <header className="print-modal-controls relative z-10 flex h-11 shrink-0 items-center justify-between border-b border-[#1a1b1e] bg-[#1f2022] px-3 text-sm shadow-md">
        {/* Left: Hamburger + File Name */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSidebar((v) => !v)}
            className={`rounded p-1.5 transition ${
              showSidebar
                ? "bg-white/15 text-white"
                : "text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
            title="เปิด/ปิด แถบตัวอย่างหน้า"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="max-w-[180px] truncate text-xs text-slate-300 sm:max-w-[280px]">
            {fileName}
          </span>
        </div>

        {/* Center: Page input + Zoom + Rotate + Cut guides */}
        <div className="flex items-center gap-1.5">
          {/* Page counter */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <input
              type="text"
              value={activePageIndex}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1 && v <= totalPages) scrollToPage(v);
              }}
              className="h-5.5 w-7 rounded border border-slate-600 bg-[#141516] text-center text-xs text-white outline-none focus:border-sky-500"
            />
            <span>/ {totalPages}</span>
          </div>

          <div className="mx-0.5 h-4 w-px bg-slate-700" />

          {/* Zoom */}
          <button
            type="button"
            onClick={() => { setIsFitWidth(false); setZoom((z) => Math.max(50, z - 10)); }}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            title="ย่อ"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => { setIsFitWidth(false); setZoom(100); }}
            className="w-10 text-center text-xs text-slate-300 hover:text-white"
          >
            {currentZoom}%
          </button>
          <button
            type="button"
            onClick={() => { setIsFitWidth(false); setZoom((z) => Math.min(160, z + 10)); }}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            title="ขยาย"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>

          <div className="mx-0.5 h-4 w-px bg-slate-700" />

          {/* Fit width */}
          <button
            type="button"
            onClick={() => setIsFitWidth((v) => !v)}
            className={`rounded p-1.5 transition ${isFitWidth ? "bg-white/15 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
            title="พอดีความกว้าง"
          >
            {isFitWidth ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Rotate */}
          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            title="หมุน 90°"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          <div className="mx-0.5 h-4 w-px bg-slate-700" />

          {/* Cut guides toggle */}
          <button
            type="button"
            onClick={() => setShowCutGuides((v) => !v)}
            className={`flex items-center gap-1 rounded px-1.5 py-1 text-xs transition ${
              showCutGuides
                ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/50"
                : "text-slate-400 hover:bg-white/10 hover:text-slate-200"
            }`}
            title="เส้นประช่วยตัด"
          >
            <Scissors className="h-3 w-3" />
            <span className="hidden lg:inline">เส้นประช่วยตัด</span>
          </button>
        </div>

        {/* Right: Download + Print + Close */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrint}
            className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            title="ดาวน์โหลด"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handlePrint}
            className="flex items-center gap-1 rounded bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>พิมพ์</span>
          </button>
          <div className="mx-0.5 h-4 w-px bg-slate-700" />
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          2. BODY — Sidebar Thumbnails + PDF Canvas
      ===================================================================== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR THUMBNAILS ── */}
        {showSidebar && (
          <aside
            ref={sidebarRef}
            className="print-modal-controls flex w-[300px] shrink-0 flex-col overflow-y-auto border-r border-[#141516] bg-[#1f2022] pb-6 pt-3 shadow-inner"
          >
            <p className="mb-2.5 px-3 text-[9px] font-semibold tracking-widest text-slate-500 uppercase">
              ตัวอย่างหน้า ({totalPages})
            </p>
            <div className="flex flex-col items-center gap-4 px-2">
              {pages.map((p) => (
                <div
                  key={p.pageNumber}
                  data-page-thumb={p.pageNumber}
                >
                  <PageThumbnail
                    page={p}
                    isActive={activePageIndex === p.pageNumber}
                    onClick={() => scrollToPage(p.pageNumber)}
                  />
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* ── MAIN PDF CANVAS ── */}
        <main
          ref={scrollContainerRef}
          onScroll={handleMainScroll}
          className="relative flex-1 overflow-auto bg-[#525659] p-5 sm:p-8"
        >
          <div
            className="mx-auto flex flex-col items-center gap-8 pb-16 origin-top transition-transform duration-150"
            style={{
              transform: `scale(${currentZoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: "top center",
            }}
          >
            {pages.map((page) => (
              <div
                key={page.pageNumber}
                id={`print-sheet-page-${page.pageNumber}`}
                ref={(el) => { pageRefMap.current[page.pageNumber] = el; }}
                className="flex w-full flex-col items-center"
              >
                {/* แผ่นกระดาษ A4 */}
                <div
                  className="print-page print-price-tag-sheet bg-white text-black shadow-[0_2px_20px_rgba(0,0,0,0.5)]"
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    padding: "7mm 6mm",
                    boxSizing: "border-box",
                  }}
                >
                  {/* Header */}
                  <div className="mb-2 flex items-center justify-between border-b border-dashed border-slate-300 pb-1.5 text-[9px] text-slate-500">
                    <span className="font-semibold">
                      LAWSON 108 STANDARD PRICE TAG TEMPLATE (3x8 A4 SHEET)
                    </span>
                    <span>
                      สาขา: <strong className="text-black">{branchId}</strong> |
                      เลขที่:{" "}
                      <strong className="text-black">{printingRequest.documentNumber}</strong> |
                      วันที่: {formattedDate}
                    </span>
                  </div>

                  {/* Grid ป้ายราคา 3 × 8 */}
                  <div className="grid grid-cols-3 gap-x-2.5 gap-y-2 justify-items-center">
                    {page.products.map((product, index) => (
                      <div
                        key={`${product.barcode}-${page.pageNumber}-${index}`}
                        className={`relative ${
                          showCutGuides
                            ? "p-[1px] border border-dashed border-slate-300 rounded-[2px]"
                            : ""
                        }`}
                      >
                        <PriceTag
                          product={product}
                          branchId={branchId}
                          date={formattedDate}
                          tierLetter="C"
                        />
                        {showCutGuides && (
                          <span className="absolute -top-1 -left-1 text-[8px] text-slate-400 select-none leading-none">
                            +
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex justify-between border-t border-slate-200 pt-1.5 text-[8px] text-slate-400">
                    <span>* ป้ายราคานี้พิมพ์จากระบบ Request Price Tag System</span>
                    <span>แผ่นที่ {page.pageNumber} จากทั้งหมด {totalPages} แผ่น</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* =====================================================================
          3. BOTTOM STATUS BAR
      ===================================================================== */}
      <footer className="print-modal-controls flex shrink-0 items-center justify-between border-t border-[#141516] bg-[#1f2022] px-4 py-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            เครื่องพิมพ์:
            <select
              value={printer}
              onChange={(e) => setPrinter(e.target.value)}
              className="h-6 rounded border border-slate-700 bg-[#141516] px-2 text-xs text-white outline-none focus:border-sky-500"
            >
              <option value="zebra">Zebra ZD420 (สติกเกอร์บาร์โค้ด) [แนะนำ]</option>
              <option value="default">เครื่องพิมพ์เริ่มต้น (A4)</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            จำนวน:
            <input
              type="number"
              min={1}
              max={99}
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))}
              className="h-6 w-12 rounded border border-slate-700 bg-[#141516] text-center text-xs text-white outline-none focus:border-sky-500"
            />
            ชุด
          </label>
        </div>

        {errorMessage && <p role="alert" className="text-red-400">{errorMessage}</p>}

        <div>
          รวมป้าย: <strong className="text-white">{totalTags}</strong> ป้าย ({totalPages} แผ่น)
        </div>
      </footer>
    </div>
  );
}
