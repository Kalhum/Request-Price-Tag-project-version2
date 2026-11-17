"use client";

import { useState } from "react";
import {
  ArrowRight,
  Barcode,
  Check,
  FileSpreadsheet,
  Folder,
  Package,
  Search,
  Upload,
  X,
} from "lucide-react";
import Button from "@/components/Button";
import Footer from "../../../components/Footer";
import { useCreatePriceRequest } from "@/hook/use-create-price-request";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function CreateRequestPage() {
  const [barcode, setBarcode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const {
    product,
    searchLoading,
    requestLoading,
    error,
    message,
    searchProduct,
    submitRequest,
    uploadFile: submitUpload,
  } = useCreatePriceRequest();

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSearched(true);
    await searchProduct(barcode);
  }

  function selectFile(selectedFile?: File) {
    setFileError("");
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(extension ?? "")) {
      setFile(null);
      setFileError("กรุณาเลือกไฟล์ Excel หรือ CSV");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setFileError("ไฟล์ต้องมีขนาดไม่เกิน 5 MB");
      return;
    }

    setFile(selectedFile);
  }

  function uploadFile() {
    if (file) void submitUpload(file);
  }

  return (
    <div className="flex min-h-full flex-col gap-4 bg-surface p-4 sm:p-6">
      <section className="flex flex-col gap-6 rounded-card bg-gradient-to-r from-primary to-secondary p-5 text-white shadow-card sm:min-h-44 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h1 className="text-heading font-bold sm:text-3xl">
            สร้างคำร้องขอ
          </h1>
          <p className="mt-1 text-label">
            ระบบพิมพ์ป้ายแสดงราคาบาร์โค้ดสินค้าและป้ายส่งเสริมการขายหน้าร้าน
          </p>
        </div>
        <Button
          onClick={() =>
            document.getElementById("barcode-search")?.focus()
          }
          variant="danger"
          size="lg"
          rightIcon={<ArrowRight className="h-5 w-5" />}
          className="shrink-0 font-bold shadow-md sm:min-w-72"
        >
          ต้องการพิมพ์ป้ายราคาขายแพ็ค กดปุ่มนี้
        </Button>
      </section>

      <section className="card-default overflow-hidden p-0">
        <h2 className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 text-subheading font-bold text-slate-800 sm:px-5">
          <span className="mr-2 text-secondary">•</span>
          รายละเอียดคำร้องขอพิมพ์ป้ายราคา (Price Tag Request)
        </h2>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="min-w-0 lg:border-r lg:border-slate-100 lg:pr-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="barcode-search"
                className="flex items-center gap-2 text-label font-bold text-slate-700"
              >
                <Barcode className="h-4 w-4 text-primary" />
                ค้นหาด้วยรหัสสินค้า / บาร์โค้ด
                <span className="text-danger">*</span>
              </label>
              <span className="text-caption text-slate-400">
                รองรับเครื่องสแกน Barcode 1D/2D
              </span>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="barcode-search"
                  type="search"
                  value={barcode}
                  onChange={(event) => setBarcode(event.target.value)}
                  placeholder="กรอกรหัสสินค้าหรือบาร์โค้ด"
                  className="input-default h-10 pl-10 py-2"
                />
              </div>
              <Button
                type="submit"
                disabled={searchLoading || !barcode.trim()}
                variant="secondary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="h-10 shrink-0 px-4 py-2"
              >
                ค้นหา
              </Button>
            </form>

            {product ? (
              <div className="mt-3 flex gap-3 rounded-input border border-sky-100 bg-sky-50/50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-input bg-white text-secondary shadow-sm">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-primary">
                      บาร์โค้ด: {product.barcode}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-success">
                      <Check className="h-4 w-4" />
                      พบในระบบ
                    </span>
                  </div>
                  <p className="mt-1 font-semibold text-slate-800">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray">
                    ราคาปกติ: <strong className="text-slate-800">{product.price.toFixed(2)} บาท</strong>
                    <span className="mx-2">หมวดหมู่: {product.category}</span>
                    หน่วย: {product.unit}
                  </p>
                  <Button
                    disabled={requestLoading}
                    onClick={() => void submitRequest(product.barcode)}
                    variant="primary"
                    size="sm"
                    isLoading={requestLoading}
                    leftIcon={<Check className="h-4 w-4" />}
                    className="mt-3"
                  >
                    สร้างคำร้องตัวอย่าง
                  </Button>
                </div>
              </div>
            ) : hasSearched && !searchLoading && !error ? (
              <div
                role="status"
                className="mt-3 flex items-center gap-2 rounded-input border border-warning/30 bg-warning/10 p-3 text-sm text-gray"
              >
                <X className="h-4 w-4 text-warning" />
                ไม่พบสินค้าในข้อมูลตัวอย่าง กรุณาตรวจสอบบาร์โค้ด
              </div>
            ) : searchLoading ? (
              <p role="status" className="mt-3 text-sm text-gray">
                กำลังค้นหาสินค้า...
              </p>
            ) : null}
            {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
          </section>

          <section className="min-w-0">
            <label
              htmlFor="request-file"
              className="mb-2 flex items-center gap-2 text-label font-bold text-slate-700"
            >
              <FileSpreadsheet className="h-4 w-4 text-success" />
              หรือ เลือกไฟล์อัปโหลด (Excel / CSV)
            </label>
            <label
              htmlFor="request-file"
              className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-input border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-4 text-center transition hover:border-secondary hover:bg-sky-50/50"
            >
              <Upload className="mb-2 h-5 w-5 text-slate-400" />
              <span className="text-sm font-semibold text-gray">
                {file?.name ?? "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่"}
              </span>
              <span className="mt-1 text-caption text-slate-400">
                รองรับ .xlsx, .xls, .csv (สูงสุด 5 MB)
              </span>
              <input
                id="request-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(event) => selectFile(event.target.files?.[0])}
                className="sr-only"
              />
            </label>
            {fileError && (
              <p role="alert" className="mt-2 text-sm text-danger">
                {fileError}
              </p>
            )}
            {message && (
              <p role="status" className="mt-2 text-sm text-warning">
                {message}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <label
                htmlFor="request-file"
                className="btn-primary inline-flex cursor-pointer items-center gap-2 px-3 py-2 text-sm"
              >
                <Folder className="h-4 w-4" />
                เพิ่มไฟล์ (Choose File)
              </label>
              <Button
                onClick={uploadFile}
                disabled={!file || requestLoading}
                variant="secondary"
                size="sm"
                isLoading={requestLoading}
                leftIcon={<Upload className="h-4 w-4" />}
              >
                อัปโหลด (Upload)
              </Button>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </div>
  );
}