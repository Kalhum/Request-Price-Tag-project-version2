import "server-only";
import type { HomeContent } from "@/types/home";
import type { BranchId } from "@/types/branch";

// Mock เนื้อหาคงที่ที่ใช้แสดงหน้า Home; เปลี่ยนเป็นการอ่าน config/CMS ได้ในชั้นนี้
const HOME_CONTENT: HomeContent = {
  title: "Request Price Tag",
  description:
    "ระบบสำหรับหน้าร้านในการสร้างคำร้อง พิมพ์ป้ายราคา และติดตามรายการเอกสารได้ในที่เดียว",
  tierListMonth: "05/2026",
  tierListDisclaimer: "ข้อมูลที่แสดงยังไม่เป็นทางการ",
  websites: [
    "http://www.chokchaipibul.com/reqpricetag",
    "http://115.31.146.18/reqpricetag/",
  ],
  priceTag: {
    branch: "P0000",
    date: "05/01/2026",
    days: 438,
    itemCode: "10450048",
    barcode: "885099320007",
    price: 14,
    category: "Core SKU",
    name: "สิงห์น้ำดื่ม 1500 มล.",
    englishName: "Singha Drinking Water 1500ml.",
  },
};

/** คืนข้อมูลที่หน้า Home ต้องใช้ โดยไม่ให้ UI ผูกกับแหล่งเก็บข้อมูล */
export async function getHomeContent(branchId: BranchId) {
  return {
    ...HOME_CONTENT,
    priceTag: { ...HOME_CONTENT.priceTag, branch: branchId },
  };
}
