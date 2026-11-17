"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Barcode,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Download,
  Edit2,
  FileSpreadsheet,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import Button from "@/components/Button";
import Footer from "../../../components/Footer";
import Table from "@/components/Table";
import type { TableColumn } from "@/components/Table";
import { useBranch } from "@/components/BranchProvider";
import { useProductCatalog } from "@/hook/use-product-catalog";
import type { CatalogProduct, ProductCategory } from "@/types/product";

export default function ManageCategoryPage() {
  const { branchId } = useBranch();
  const [uploadType, setUploadType] = useState<"sku" | "function">("sku");
  const [file, setFile] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [editCategory, setEditCategory] = useState<ProductCategory>("Core SKU");
  const {
    query,
    category,
    sortBy,
    sortOrder,
    page,
    data,
    loading,
    error,
    uploadLoading,
    uploadMessage,
    mutationLoading,
    updateQuery,
    updateCategory,
    toggleSort,
    updatePage,
    uploadFile: uploadProductFile,
    updateProduct,
    deleteProduct,
  } = useProductCatalog();
  const visibleProducts = data?.items ?? [];
  const totalProducts = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalProducts / 20));

  function exportCsv() {
    const csvRows = [
      ["รหัสสินค้า", "ชื่อสินค้า", "ประเภท"],
      ...visibleProducts.map((product) => [
        product.code,
        product.name,
        product.category,
      ]),
    ];
    const csv = `\uFEFF${csvRows
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
      .join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "product-categories.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const rangeStart = totalProducts ? (page - 1) * 20 + 1 : 0;
  const rangeEnd = Math.min(page * 20, totalProducts);

  function submitUpload() {
    if (file) void uploadProductFile(file, uploadType);
  }

  const productColumns: TableColumn<CatalogProduct>[] = [
    {
      key: "index",
      header: "ลำดับ",
      align: "center",
      width: "3.5rem",
      render: (_product, index) => index + 1,
      className: "text-center text-slate-500",
      headerClassName: "text-center",
    },
    {
      key: "code",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("code")}
          className="inline-flex items-center gap-1"
        >
          รหัสสินค้า
          {sortBy === "code" &&
            (sortOrder === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            ))}
        </button>
      ),
      accessor: "code",
      align: "center",
      width: "18%",
      className: "text-center font-bold",
      headerClassName: "text-center",
    },
    {
      key: "name",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("name")}
          className="inline-flex items-center gap-1"
        >
          ชื่อสินค้า
          {sortBy === "name" &&
            (sortOrder === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            ))}
        </button>
      ),
      accessor: "name",
      align: "center",
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "category",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("category")}
          className="inline-flex items-center gap-1"
        >
          ประเภท
          {sortBy === "category" &&
            (sortOrder === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            ))}
        </button>
      ),
      align: "center",
      width: "18%",
      headerClassName: "text-center",
      render: (product) => (
        <span
          className={`inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold ${
            product.category === "Core SKU"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          <Check className="mr-1 h-3 w-3" />
          {product.category}
        </span>
      ),
    },
    {
      key: "actions",
      header: "การจัดการ",
      align: "center",
      width: "24%",
      headerClassName: "text-center",
      render: (product) => (
        <div className="flex justify-center gap-2">
          <Button
            aria-label={`แก้ไข ${product.code}`}
            disabled={mutationLoading}
            onClick={() => {
              setEditingProduct(product);
              setEditCategory(product.category);
            }}
            variant="outline"
            size="sm"
            leftIcon={<Edit2 className="h-3.5 w-3.5" />}
            className="rounded-md border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700 hover:bg-amber-100"
          >
            แก้ไข
          </Button>
          <Button
            aria-label={`ลบ ${product.code}`}
            disabled={mutationLoading}
            onClick={() => {
              if (
                window.confirm(
                  `ต้องการลบสินค้า ${product.code} จากข้อมูล mock หรือไม่?`,
                )
              ) {
                void deleteProduct(product.code);
              }
            }}
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-600 hover:bg-rose-100"
          >
            ลบ
          </Button>
        </div>
      ),
    },
  ];

  async function saveCategory() {
    if (!editingProduct || editingProduct.branchId !== branchId) return;
    const saved = await updateProduct(editingProduct.code, editCategory);
    if (saved) setEditingProduct(null);
  }

  return (
    <div className="flex min-h-full flex-col gap-4 bg-surface p-4 sm:p-6">
      <header className="rounded-card bg-gradient-to-r from-primary to-secondary px-4 py-4 text-white shadow-card sm:px-6">
        <h1 className="text-xl font-bold leading-tight sm:text-3xl">
          ส่วนของการจัดการประเภทของสินค้า
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/85">
          <span>ประเภทของสินค้ามีดังนี้:</span>
          <span className="rounded bg-white/20 px-2 py-0.5 font-semibold">
            C = Core SKUs
          </span>
          <span className="rounded bg-white/20 px-2 py-0.5 font-semibold">
            O = Optional SKUs
          </span>
        </div>
      </header>

      <section className="card-default min-w-0 p-4 sm:p-6">
        <div className="mb-5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-subheading font-bold text-primary">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            จัดการประเภทสินค้า
          </div>
          <p className="ml-7 text-caption text-gray">
            ค้นหารายการ หรืออัปโหลดไฟล์ข้อมูลสินค้าใหม่เข้าระบบ
          </p>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <fieldset className="min-w-0 space-y-3 lg:border-r lg:border-slate-100 lg:pr-6">
            <legend className="mb-3 flex items-center gap-2 text-label font-bold text-primary">
              <CloudUpload className="h-4 w-4 text-primary" />
              ประเภทการอัปโหลด :
            </legend>
            <label className="flex cursor-pointer items-center gap-2 rounded-input border border-slate-200 px-3 py-2.5 text-label font-semibold text-gray hover:bg-slate-50">
              <input
                type="radio"
                name="uploadType"
                checked={uploadType === "sku"}
                onChange={() => setUploadType("sku")}
                className="accent-primary"
              />
              ประเภท 1 : Core SKUs / Optional SKUs
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-input border border-slate-200 px-3 py-2.5 text-label font-semibold text-gray hover:bg-slate-50">
              <input
                type="radio"
                name="uploadType"
                checked={uploadType === "function"}
                onChange={() => setUploadType("function")}
                className="accent-primary"
              />
              ประเภท 2 : Function
            </label>
          </fieldset>

          <div className="space-y-3">
            <label htmlFor="product-search" className="flex flex-wrap items-center gap-2 text-label font-bold text-primary">
              <Barcode className="h-4 w-4 text-primary" />
              รหัสสินค้า / บาร์โค้ด :
            </label>
            <div className="flex gap-2">
              <input
                id="product-search"
                type="search"
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder="ระบุรหัสสินค้า 8 หลัก เช่น 17440967"
                className="input-default h-10 min-w-0 flex-1 py-2"
              />
              <Button
                className="btn-secondary inline-flex h-10 shrink-0 items-center gap-2 px-4 py-2"
                variant="secondary"
                size="md"
                leftIcon={<Search className="h-4 w-4" />}
              >
                ค้นหา
              </Button>
            </div>
            <div>
              <label htmlFor="product-file" className="mb-1 block text-label text-gray">
                อัปโหลด{uploadType === "sku" ? "ประเภท 1" : "ประเภท 2"} (แนบไฟล์เอกสาร) :
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="input-default flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-2 border-dashed border-slate-300 py-2 text-label text-gray hover:bg-slate-50">
                  <FileSpreadsheet className="h-4 w-4 shrink-0 text-success" />
                  <span className="truncate">
                    {file?.name ?? "เลือกไฟล์ หรือ ลากไฟล์มาวางที่นี่"}
                  </span>
                  <input
                    id="product-file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </label>
                <Button
                  onClick={submitUpload}
                  disabled={!file || uploadLoading}
                  variant="primary"
                  size="md"
                  isLoading={uploadLoading}
                  leftIcon={<CloudUpload className="h-4 w-4" />}
                  className="h-10 shrink-0 px-4 py-2"
                >
                  อัปโหลด (Upload)
                </Button>
              </div>
              <p className="mt-1 text-caption text-gray">
                รองรับไฟล์ CSV และ Excel
              </p>
              {uploadMessage && (
                <p role="status" className="mt-1 text-xs text-warning">
                  {uploadMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="card-default overflow-hidden p-0">
        <div className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="font-bold text-primary">
              รายการของสินค้าที่จัดประเภทแล้ว
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                {totalProducts.toLocaleString("th-TH")} รายการ
              </span>
            </h2>
            <p className="mt-1 text-caption text-gray">
              ตารางแสดงรายการจัดหมวดหมู่สินค้าสำหรับการสั่งซื้อและกระจายสินค้าหน้าร้าน
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex max-w-full flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-1">
              {(
                [
                  ["all", "ทั้งหมด"],
                  ["Core SKU", "Core SKUs"],
                  ["Optional SKU", "Optional SKUs"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateCategory(value)}
                  aria-pressed={category === value}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                    category === value
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-600 hover:text-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Button
              onClick={exportCsv}
              variant="secondary"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export .csv
            </Button>
          </div>
        </div>

        <Table
          columns={productColumns}
          data={error ? [] : visibleProducts}
          rowKey={(product) => product.code}
          size="md"
          striped
          isLoading={loading && !error}
          emptyMessage={
            error ? (
              <span role="alert" className="text-danger">
                {error}
              </span>
            ) : (
              "ไม่พบรายการสินค้าที่ตรงกับการค้นหา"
            )
          }
          className="rounded-none border-0"
          tableClassName="min-w-[760px] text-sm"
          headerClassName="bg-primary text-white"
          headerCellClassName="text-white"
          rowClassName="hover:bg-sky-50/50"
        />

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            แสดง {rangeStart} ถึง {rangeEnd} จากทั้งหมด{" "}
            <strong className="text-slate-700">{totalProducts.toLocaleString("th-TH")}</strong> รายการ
          </p>
          <nav aria-label="เปลี่ยนหน้ารายการสินค้า" className="flex items-center gap-1">
            <button
              type="button"
              aria-label="หน้าก่อนหน้า"
              disabled={page === 1 || loading}
              onClick={() => updatePage(Math.max(1, page - 1))}
              className="rounded-md border border-slate-200 bg-white p-1.5 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[1, 2, 3].map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => updatePage(pageNumber)}
                aria-current={page === pageNumber ? "page" : undefined}
                className={`min-w-8 rounded-md border px-2 py-1.5 ${
                  page === pageNumber
                    ? "border-primary bg-primary font-bold text-white"
                    : "border-slate-200 bg-white hover:bg-slate-100"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <span className="px-1">…</span>
            <button
              type="button"
              onClick={() => updatePage(totalPages)}
              aria-current={page === totalPages ? "page" : undefined}
              className={`rounded-md border px-2 py-1.5 ${
                page === totalPages
                  ? "border-primary bg-primary font-bold text-white"
                  : "border-slate-200 bg-white hover:bg-slate-100"
              }`}
            >
              {totalPages}
            </button>
            <button
              type="button"
              aria-label="หน้าถัดไป"
              disabled={page === totalPages || loading}
              onClick={() => updatePage(Math.min(totalPages, page + 1))}
              className="rounded-md border border-slate-200 bg-white p-1.5 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </section>

      <Footer />
      {editingProduct?.branchId === branchId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="edit-product-title" className="text-lg font-bold text-slate-900">
                  แก้ไขประเภทสินค้า
                </h2>
                <p className="mt-1 text-sm text-gray">
                  {editingProduct.code} — {editingProduct.name}
                </p>
              </div>
              <button
                type="button"
                aria-label="ปิด"
                onClick={() => setEditingProduct(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-5 block text-sm font-semibold text-slate-700">
              ประเภท
              <select
                value={editCategory}
                onChange={(event) => {
                  if (
                    event.target.value === "Core SKU" ||
                    event.target.value === "Optional SKU"
                  ) {
                    setEditCategory(event.target.value);
                  }
                }}
                className="input-default mt-2"
              >
                <option value="Core SKU">Core SKU</option>
                <option value="Optional SKU">Optional SKU</option>
              </select>
            </label>
            {error && (
              <p role="alert" className="mt-3 text-sm text-danger">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-gray"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={mutationLoading}
                onClick={() => void saveCategory()}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
              >
                {mutationLoading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
