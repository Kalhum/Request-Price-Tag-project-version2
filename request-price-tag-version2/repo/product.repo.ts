import "server-only";
import type {
  CatalogProduct,
  CatalogUploadInput,
  ProductListFilter,
  ProductListResponse,
  UpdateCatalogProductInput,
} from "@/types/product";
import type { BranchId } from "@/types/branch";

// แหล่งข้อมูล mock ของสินค้าอยู่รวมจุดเดียว; เปลี่ยนฟังก์ชันเหล่านี้เป็น DB queries ภายหลัง
const PRODUCT_SEEDS: CatalogProduct[] = [
  { branchId: "P0000", code: "17440967", barcode: "885012309870", name: "PB มินิโดนัทแยมบลูเบอร์รี่ 60ก.", category: "Core SKU", price: 25, unit: "ชิ้น", age: 120 },
  { branchId: "P0000", code: "10830369", barcode: "885012300001", name: "โอวัลตินนมไมโลโปรตีน 225มล.(UHT)", category: "Core SKU", price: 25, unit: "กล่อง", age: 120 },
  { branchId: "P0000", code: "10038437", barcode: "885012300002", name: "มองต์เฟลอน้ำแร่ธรรมชาติชนิดมีแก๊ส 550มล.", category: "Core SKU", price: 35, unit: "ขวด", age: 210 },
  { branchId: "P0115", code: "20140658", barcode: "885012300003", name: "เลย์คลาสสิค รสมันฝรั่งแท้ 50ก.", category: "Optional SKU", price: 20, unit: "ซอง", age: 180 },
  { branchId: "P0115", code: "11094321", barcode: "885012300004", name: "ลอว์สัน เบเกอรี่ แซนด์วิชหมูหยองมายองเนส", category: "Core SKU", price: 39, unit: "ชิ้น", age: 2 },
  { branchId: "P0115", code: "18239012", barcode: "885012309871", name: "ชาเขียวอิชิตัน ไม่มีน้ำตาล 440 มล.", category: "Optional SKU", price: 30, unit: "ขวด", age: 210 },
];

let mockProducts: CatalogProduct[] = Array.from({ length: 1420 }, (_, index) => {
  const seed = PRODUCT_SEEDS[index % PRODUCT_SEEDS.length];
  if (index < PRODUCT_SEEDS.length) return seed;
  return {
    ...seed,
    code: String(Number(seed.code) + index),
    barcode: `${seed.barcode.slice(0, -4)}${String(index).padStart(4, "0")}`,
  };
});

/** ค้นหา กรอง เรียง และแบ่งหน้าสินค้า; UI ส่งเงื่อนไขมา ส่วนการ query อยู่ใน repository */
export async function listProducts(
  filter: ProductListFilter,
): Promise<ProductListResponse> {
  const query = filter.query.trim().toLocaleLowerCase();
  const matches = mockProducts
    .filter((product) => {
      const matchesQuery =
        !query ||
        product.code.toLocaleLowerCase().includes(query) ||
        product.barcode.toLocaleLowerCase().includes(query) ||
        product.name.toLocaleLowerCase().includes(query);
      const matchesCategory =
        filter.category === "all" || product.category === filter.category;
      return (
        product.branchId === filter.branchId &&
        matchesQuery &&
        matchesCategory
      );
    })
    .sort((a, b) => {
      const comparison = a[filter.sortBy].localeCompare(b[filter.sortBy], "th", {
        numeric: true,
      });
      return filter.sortOrder === "asc" ? comparison : -comparison;
    });

  const start = (filter.page - 1) * filter.pageSize;
  return {
    branchId: filter.branchId,
    items: matches.slice(start, start + filter.pageSize),
    total: matches.length,
    page: filter.page,
    pageSize: filter.pageSize,
  };
}

/** ค้นหาสินค้าด้วย barcode หรือรหัสสินค้า ใช้ในหน้า Create Request */
export async function findProduct(query: string, branchId: BranchId) {
  const normalized = query.trim().toLocaleLowerCase();
  return (
    mockProducts.find(
      (product) =>
        product.branchId === branchId &&
        (product.barcode.toLocaleLowerCase() === normalized ||
          product.code.toLocaleLowerCase() === normalized),
    ) ?? null
  );
}

/** เปลี่ยนประเภทสินค้าใน mock store; DB implementation จะใช้ UPDATE */
export async function updateProduct(
  code: string,
  branchId: BranchId,
  input: UpdateCatalogProductInput,
) {
  const index = mockProducts.findIndex(
    (product) => product.code === code && product.branchId === branchId,
  );
  if (index < 0) return null;
  mockProducts[index] = { ...mockProducts[index], category: input.category };
  return mockProducts[index];
}

/** ลบสินค้าออกจาก mock store; DB implementation จะใช้ DELETE */
export async function deleteProduct(code: string, branchId: BranchId) {
  const index = mockProducts.findIndex(
    (product) => product.code === code && product.branchId === branchId,
  );
  if (index < 0) return false;
  mockProducts = mockProducts.filter(
    (product) => product.code !== code || product.branchId !== branchId,
  );
  return true;
}

/** จำลองการรับ metadata ของไฟล์ โดยยังไม่อ่าน/บันทึกเนื้อหาไฟล์จริง */
export async function acceptCatalogUpload(input: CatalogUploadInput) {
  return {
    processed: false as const,
    fileName: input.fileName,
    uploadType: input.uploadType,
    message:
      "รับข้อมูลไฟล์สำหรับทดสอบแล้ว แต่ยังไม่ได้อัปโหลดหรือแก้ไขรายการสินค้า",
  };
}
