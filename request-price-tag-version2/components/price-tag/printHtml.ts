/**
 * printHtml.ts
 * โมดูลสร้างเอกสารสำหรับสั่งพิมพ์ (Print) และบันทึกเป็น PDF (Save as PDF)
 * - ออกแบบตามมาตรฐาน W3C CSS Paged Media (@page A4 portrait)
 * - รองรับเอกสารหลายหน้า (Multi-page A4) โดยแบ่งหน้าละ 24 ป้าย (3x8)
 * - คำนวณความสูงแน่นหนา ไม่เกิดปัญหาหน้าว่างแทรก (No accidental blank pages)
 * - บาร์โค้ด Vector คมชัด 100% สแกนติดทุกหัวอ่าน
 */

import type { PrintingProduct, PrintingRequest } from "@/types/printing";

// ─── Code 128B Encoding Table ────────────────────────────────────────────────
const CODE128_PATTERNS: Record<number, number[]> = {
  0: [2,1,2,2,2,2], 1: [2,2,2,1,2,2], 2: [2,2,2,2,2,1],
  3: [1,2,1,2,2,3], 4: [1,2,1,3,2,2], 5: [1,3,1,2,2,2],
  6: [1,2,2,2,1,3], 7: [1,2,2,3,1,2], 8: [1,3,2,2,1,2],
  9: [2,2,1,2,1,3], 10: [2,2,1,3,1,2], 11: [2,3,1,2,1,2],
  12: [1,1,2,2,3,2], 13: [1,2,2,1,3,2], 14: [1,2,2,2,3,1],
  15: [1,1,3,2,2,2], 16: [1,2,3,1,2,2], 17: [1,2,3,2,2,1],
  18: [2,2,3,2,1,1], 19: [2,2,1,1,3,2], 20: [2,2,1,2,3,1],
  21: [2,1,3,2,1,2], 22: [2,2,3,1,1,2], 23: [3,1,2,1,3,1],
  24: [3,1,1,2,2,2], 25: [3,2,1,1,2,2], 26: [3,2,1,2,2,1],
  27: [3,1,2,2,1,2], 28: [3,2,2,1,1,2], 29: [3,2,2,2,1,1],
  30: [2,1,2,1,2,3], 31: [2,1,2,3,2,1], 32: [2,3,2,1,2,1],
  33: [1,1,1,3,2,3], 34: [1,3,1,1,2,3], 35: [1,3,1,3,2,1],
  36: [1,1,2,3,1,3], 37: [1,3,2,1,1,3], 38: [1,3,2,3,1,1],
  39: [2,1,1,3,1,3], 40: [2,3,1,1,1,3], 41: [2,3,1,3,1,1],
  42: [1,1,2,1,3,3], 43: [1,1,2,3,3,1], 44: [1,3,2,1,3,1],
  45: [1,1,3,1,2,3], 46: [1,1,3,3,2,1], 47: [1,3,3,1,2,1],
  48: [3,1,3,1,2,1], 49: [2,1,1,3,3,1], 50: [2,3,1,1,3,1],
  51: [2,1,3,1,1,3], 52: [2,1,3,3,1,1], 53: [2,1,3,1,3,1],
  54: [3,1,1,1,2,3], 55: [3,1,1,3,2,1], 56: [3,3,1,1,2,1],
  57: [3,1,2,1,1,3], 58: [3,1,2,3,1,1], 59: [3,3,2,1,1,1],
  60: [3,1,4,1,1,1], 61: [2,2,1,4,1,1], 62: [4,3,1,1,1,1],
  63: [1,1,1,2,2,4], 64: [1,1,1,4,2,2], 65: [1,2,1,1,2,4],
  66: [1,2,1,4,2,1], 67: [1,4,1,1,2,2], 68: [1,4,1,2,2,1],
  69: [1,1,2,2,1,4], 70: [1,1,2,4,1,2], 71: [1,2,2,1,1,4],
  72: [1,2,2,4,1,1], 73: [1,4,2,1,1,2], 74: [1,4,2,2,1,1],
  75: [2,4,1,2,1,1], 76: [2,2,1,1,1,4], 77: [4,1,3,1,1,1],
  78: [2,4,1,1,1,2], 79: [1,3,4,1,1,1], 80: [1,1,1,2,4,2],
  81: [1,2,1,1,4,2], 82: [1,2,1,2,4,1], 83: [1,1,4,2,1,2],
  84: [1,2,4,1,1,2], 85: [1,2,4,2,1,1], 86: [4,1,1,2,1,2],
  87: [4,2,1,1,1,2], 88: [4,2,1,2,1,1], 89: [2,1,2,1,4,1],
  90: [2,1,4,1,2,1], 91: [4,1,2,1,2,1], 92: [1,1,1,1,4,3],
  93: [1,1,1,3,4,1], 94: [1,3,1,1,4,1], 95: [1,1,4,1,1,3],
  96: [1,1,4,3,1,1], 97: [4,1,1,1,1,3], 98: [4,1,1,3,1,1],
  99: [1,1,3,1,4,1], 100: [1,1,4,1,3,1], 101: [3,1,1,1,4,1],
  102: [4,1,1,1,3,1], 103: [2,1,1,4,1,2],
  104: [2,1,1,2,1,4],
  105: [2,1,1,2,3,2],
  106: [2,3,3,1,1,1,2],
};

function encodeCode128B(text: string): number[] {
  const codes: number[] = [104];
  let checksum = 104;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    const v = c >= 32 && c <= 126 ? c - 32 : 0;
    codes.push(v);
    checksum += v * (i + 1);
  }
  codes.push(checksum % 103);
  codes.push(106);
  return codes;
}

function barcodeSvgString(value: string, height = 20): string {
  const clean = value.trim() || "885099320007";
  const codes = encodeCode128B(clean);
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  for (const code of codes) {
    const pat = CODE128_PATTERNS[code] || CODE128_PATTERNS[0];
    for (let j = 0; j < pat.length; j++) {
      if (j % 2 === 0) bars.push({ x, w: pat[j] });
      x += pat[j];
    }
  }
  const rects = bars.map((b) => `<rect x="${b.x}" y="0" width="${b.w}" height="${height}"/>`).join("");
  return `<svg viewBox="0 0 ${x} ${height}" preserveAspectRatio="none" fill="#000" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:${height}px;display:block">${rects}</svg>`;
}

// ─── สร้าง HTML สำหรับป้ายราคา 1 ชิ้น (64mm x 34mm) ─────────────────────────
function priceTagHtml(
  product: PrintingProduct,
  branchId: string,
  date: string,
  tierLetter = "C",
  showCutGuides = true,
): string {
  const price = Number(product.price) || 0;
  const [pi, pd] = price.toFixed(2).split(".");
  const name = (product.name || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const eng = (product.english || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const days = (product.days || "14 D").replace(/</g, "&lt;");
  const itemCode = (product.itemCode || "17270144").replace(/</g, "&lt;");
  const barcode = (product.barcode || "885099320007").replace(/</g, "&lt;");
  const svg = barcodeSvgString(barcode, 20);

  const cutGuideStyle = showCutGuides
    ? "outline: 1px dashed #cbd5e1; outline-offset: 1px;"
    : "";

  return `
<article style="
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1.5px solid #000;
  background: #fff;
  color: #000;
  width: 64mm;
  height: 34mm;
  padding: 1.5mm 2.2mm;
  box-sizing: border-box;
  page-break-inside: avoid;
  break-inside: avoid;
  overflow: hidden;
  user-select: none;
  ${cutGuideStyle}
">
  <!-- แถว 1: วันที่ (ซ้าย) | สาขา (ขวา) -->
  <div style="display:flex;justify-content:space-between;align-items:center;font-size:9px;font-weight:700;line-height:1;">
    <span>${date}</span>
    <span style="font-weight:800;letter-spacing:-0.2px;">${branchId}</span>
  </div>

  <!-- แถว 2: บาร์โค้ด Vector SVG -->
  <div style="margin: 0.8mm 0; width: 100%;">
    ${svg}
  </div>

  <!-- แถว 3: รายละเอียดใต้บาร์โค้ด -->
  <div style="display:flex;justify-content:space-between;align-items:center;font-size:7.5px;font-weight:700;line-height:1;letter-spacing:-0.2px;">
    <span style="width:12mm;">${days}</span>
    <span>NR</span>
    <span>${itemCode}</span>
    <span style="font-weight:800;">${barcode}</span>
  </div>

  <!-- แถว 4: กรอบตัวอักษร [C] และ ตัวเลขราคา -->
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:0.5mm;">
    <div style="border:1.5px solid #000;width:4.6mm;height:4.6mm;display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:900;line-height:1;">
      ${tierLetter}
    </div>
    <div style="display:flex;align-items:flex-start;font-weight:900;line-height:1;letter-spacing:-0.5px;">
      <span style="font-size:25px;line-height:0.9;">${pi}</span>
      <span style="font-size:13px;line-height:0.9;margin-left:0.5mm;">.${pd}</span>
    </div>
  </div>

  <!-- แถว 5: ชื่อสินค้าไทย และอังกฤษ -->
  <div style="margin-top:0.6mm;overflow:hidden;">
    <div style="font-size:9.5px;font-weight:700;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
      ${name}
    </div>
    <div style="font-size:7.5px;font-weight:500;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#222;margin-top:0.3mm;">
      ${eng}
    </div>
  </div>
</article>`;
}

// ─── สร้าง HTML ของหน้า A4 แต่ละหน้า (3 คอลัมน์ x 8 แถว) ─────────────────────
function pageHtml(
  products: PrintingProduct[],
  pageNumber: number,
  totalPages: number,
  branchId: string,
  documentNumber: string,
  date: string,
  showCutGuides: boolean,
): string {
  const tagCells = Array.from({ length: TAGS_PER_PAGE }, (_, index) => {
    const product = products[index];
    if (product) {
      return priceTagHtml(product, branchId, date, "C", showCutGuides);
    }
    if (showCutGuides) {
      return `<div style="width: 64mm; height: 34mm; border: 1px dashed #cbd5e1; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid;"></div>`;
    }
    return `<div style="width: 64mm; height: 34mm;"></div>`;
  }).join("\n");

  const isLastPage = pageNumber === totalPages;

  return `
<section class="a4-sheet ${isLastPage ? 'last-page' : 'page-break'}">
  <!-- Header ของหน้า A4 -->
  <header style="display:flex;justify-content:space-between;align-items:center;border-bottom:0.8px dashed #aaa;padding-bottom:1.5mm;font-size:8.5px;color:#555;line-height:1;">
    <span style="font-weight:800;color:#000;">LAWSON 108 STANDARD PRICE TAG TEMPLATE (3x8 A4 SHEET)</span>
    <span>
      สาขา: <strong style="color:#000;">${branchId}</strong> |
      เลขที่: <strong style="color:#000;">${documentNumber}</strong> |
      วันที่: ${date}
    </span>
  </header>

  <!-- Grid ป้ายราคา: 3 คอลัมน์ x 8 แถว -->
  <div style="display:grid;grid-template-columns:repeat(3, 64mm);grid-auto-rows:34mm;row-gap:0.8mm;column-gap:3mm;justify-content:center;margin: 1mm 0;">
    ${tagCells}
  </div>

  <!-- Footer ของหน้า A4 -->
  <footer style="display:flex;justify-content:space-between;align-items:center;border-top:0.8px solid #ddd;padding-top:1.5mm;font-size:8px;color:#777;line-height:1;">
    <span>* ป้ายราคานี้พิมพ์จากระบบ Request Price Tag System</span>
    <span>แผ่นที่ <strong>${pageNumber}</strong> จากทั้งหมด <strong>${totalPages}</strong> แผ่น</span>
  </footer>
</section>`;
}

export interface GeneratePrintHtmlOptions {
  printingRequest: PrintingRequest;
  products: PrintingProduct[];
  branchId: string;
  totalQuantity: number;
  showCutGuides?: boolean;
}

const TAGS_PER_PAGE = 24;

export function generatePrintHtml(opts: GeneratePrintHtmlOptions): string {
  const { printingRequest, products, branchId, totalQuantity, showCutGuides = true } = opts;

  const effectiveProducts =
    products.length > 0
      ? products
      : [{
          barcode: "885099320007",
          english: "Singha Drinking Water 1500ml.",
          name: "สิงห์น้ำดื่ม 1500 มล.",
          price: 14,
          days: "438 D",
          itemCode: "10450048",
        }];

  const totalTags = Math.max(1, totalQuantity);
  const totalPages = Math.max(1, Math.ceil(totalTags / TAGS_PER_PAGE));

  const date = new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(printingRequest.date || Date.now()));

  const pagesHtml = Array.from({ length: totalPages }, (_, idx) => {
    const start = idx * TAGS_PER_PAGE;
    const count = Math.min(TAGS_PER_PAGE, totalTags - start);
    const pageProducts = Array.from({ length: count }, (_, i) =>
      effectiveProducts[(start + i) % effectiveProducts.length]
    );
    return pageHtml(
      pageProducts,
      idx + 1,
      totalPages,
      branchId,
      printingRequest.documentNumber,
      date,
      showCutGuides,
    );
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${printingRequest.documentNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700;800;900&display=swap');

    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: 'Prompt', 'Sarabun', 'Tahoma', 'Leelawadee', sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color: #000;
    }

    /* ── A4 Sheet Container ── */
    .a4-sheet {
      width: 210mm;
      height: 295mm; /* เผื่อ 2mm เพื่อไม่ให้เบราว์เซอร์ปัดเศษจนเกิดหน้าว่าง */
      max-height: 295mm;
      padding: 4mm 5mm 3mm 5mm;
      margin: 0 auto;
      box-sizing: border-box;
      background: #ffffff;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .last-page {
      page-break-after: auto;
      break-after: auto;
    }

    /* ── Print Media Query ── */
    @page {
      size: A4 portrait;
      margin: 0;
    }

    @media print {
      html, body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .a4-sheet {
        margin: 0 !important;
        padding: 4mm 5mm 3mm 5mm !important;
        width: 210mm !important;
        height: 295mm !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .page-break {
        page-break-after: always !important;
        break-after: page !important;
      }
      .last-page {
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }
  </style>
</head>
<body>
${pagesHtml}
</body>
</html>`;
}

/**
 * สั่งพิมพ์เอกสารผ่าน Hidden iframe โดยตรง
 * - ไม่เปิดแท็บ about:blank
 * - ป้องกัน Popup Blocker
 * - เรียกหน้าต่างพิมพ์ของเบราว์เซอร์ทันที
 */
export function printDocumentDirectly(html: string): void {
  const iframeId = "hidden-print-iframe";
  let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
  if (iframe) {
    iframe.remove();
  }

  iframe = document.createElement("iframe");
  iframe.id = iframeId;
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) return;

  doc.open();
  doc.write(html);
  doc.close();

  // ให้เวลาโหลด DOM & Font สักครู่ แล้วสั่งพิมพ์
  setTimeout(() => {
    try {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch (e) {
      console.error("Print error:", e);
    }
  }, 350);
}
