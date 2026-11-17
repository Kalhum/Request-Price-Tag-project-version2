/**
 * ข้อมูลสำหรับส่วนแนะนำระบบในหน้า Home
 * เป็นข้อมูลนำเสนอ ไม่ใช่ข้อมูลรายการสินค้า/คำร้องในระบบ
 */
export type HomeContent = {
  title: string;
  description: string;
  tierListMonth: string;
  tierListDisclaimer: string;
  websites: string[];
  priceTag: {
    branch: string;
    date: string;
    days: number;
    itemCode: string;
    barcode: string;
    price: number;
    category: "Core SKU" | "Optional SKU";
    name: string;
    englishName: string;
  };
};
