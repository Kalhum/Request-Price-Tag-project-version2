"use client";

import { useMemo, useState } from "react";
import {
  Check,
  FileUp,
  Info,
  Printer,
  RotateCcw,
  Search,
  Upload,
  X,
} from "lucide-react";
import Button from "@/components/Button";
import Footer from "../../../components/Footer";
import PrintSheetModal from "@/components/price-tag/PrintSheetModal";
import { usePrintingCategories } from "@/hook/use-printing-categories";
import type { BranchId } from "@/types/branch";
import type { PrintingRequest } from "@/types/printing";

export default function PrintingCategoryPage() {
  const {
    data,
    branchId,
    loading,
    error,
    jobLoading,
    jobError,
    uploadLoading,
    uploadMessage,
    createJob,
    uploadFile: submitCategoryFile,
  } = usePrintingCategories();

  const categories = data?.categories;
  const categoryCount = categories?.length ?? 0;
  const previewProducts = data?.previewProducts ?? [];

  // ค่าเริ่มต้นไม่เลือก Checkbox ใดๆ ตามที่ผู้ใช้ต้องการ
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [branchMode, setBranchMode] = useState<"none" | "branch">("branch");
  const [englishEnabled, setEnglishEnabled] = useState(false);
  const [englishText, setEnglishText] = useState("");
  const [message, setMessage] = useState("");

  // State สำหรับเปิด PrintSheetModal ให้เหมือนหน้า printtingRequest
  const [activePrintRequest, setActivePrintRequest] = useState<PrintingRequest | null>(null);

  const effectivePreviewProducts = useMemo(() => {
    return previewProducts.map((p) => ({
      ...p,
      english: englishEnabled && englishText.trim() ? englishText.trim() : p.english,
    }));
  }, [previewProducts, englishEnabled, englishText]);

  const filteredCategories = useMemo(
    () =>
      (categories ?? []).filter((category) =>
        category.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
      ),
    [categories, search],
  );

  const allVisibleSelected =
    filteredCategories.length > 0 &&
    filteredCategories.every((category) => selectedCategories.includes(category.id));

  function toggleCategory(categoryId: string) {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((item) => item !== categoryId)
        : [...current, categoryId],
    );
    setMessage("");
  }

  function toggleVisibleCategories() {
    setSelectedCategories((current) =>
      allVisibleSelected
        ? current.filter(
            (item) => !filteredCategories.some((category) => category.id === item),
          )
        : [
            ...new Set([
              ...current,
              ...filteredCategories.map((category) => category.id),
            ]),
          ],
    );
  }

  function selectAllCategories() {
    const categoryIds = (categories ?? []).map((category) => category.id);
    setSelectedCategories(
      selectedCategories.length === categoryIds.length ? [] : categoryIds,
    );
    setMessage("");
  }

  function handleFileChange(selectedFile?: File) {
    setMessage("");
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(extension ?? "")) {
      setFile(null);
      setMessage("รองรับเฉพาะไฟล์ Excel หรือ CSV");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setMessage("ขนาดไฟล์ต้องไม่เกิน 5 MB");
      return;
    }
    setFile(selectedFile);
  }

  async function printTags() {
    if (selectedCategories.length === 0) {
      setMessage("กรุณาเลือกหมวดหมู่สินค้าก่อนพิมพ์");
      return;
    }

    const job = await createJob({
      categoryIds: selectedCategories,
      branchMode,
      branchCode: branchMode === "branch" ? branchId : undefined,
      englishEnabled,
      englishText,
    });
    if (!job) return;

    setMessage(`สร้างรายการพิมพ์ตัวอย่าง ${job.documentNumber} แล้ว`);
    setActivePrintRequest({
      id: job.jobId,
      documentNumber: job.documentNumber,
      quantity: job.productCount,
      date: new Date().toISOString(),
      branchId: branchMode === "branch" ? branchId : ("P0000" as BranchId),
    });
  }

  function uploadSelectedFile() {
    if (file) void submitCategoryFile(file);
    else setMessage("กรุณาเลือกไฟล์ก่อน");
  }

  return (
    <div className="flex min-h-full flex-col gap-3 bg-surface p-3 sm:p-4 md:p-6">
      {/* ── Header Banner ── */}
      <header className="rounded-card bg-gradient-to-r from-primary to-secondary px-4 py-4 text-white shadow-card sm:px-6 sm:py-5">
        <h1 className="text-xl font-bold leading-tight sm:text-heading md:text-3xl">
          ส่วนของการพิมพ์ป้ายราคาตามหมวดหมู่สินค้า
        </h1>
        <p className="mt-1 flex items-center gap-2 text-label text-white/85 sm:text-body">
          <Info className="h-4 w-4 shrink-0" />
          สามารถเลือกตามหมวดหมู่สินค้า หรือ อัปโหลดไฟล์ได้
        </p>
      </header>

      {/* ── Category Selection Card ── */}
      <section className="card-default p-4 sm:p-5">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-body font-bold text-slate-800 sm:text-subheading">
                หมวดหมู่สินค้าทั้งหมด
              </h2>
              <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">
                เลือกแล้ว {selectedCategories.length} จาก {categoryCount} หมวด
              </span>
            </div>
            <p className="mt-1 text-caption text-gray sm:text-label">
              ทำเครื่องหมายถูกในช่องสี่เหลี่ยมเพื่อเลือกหมวดหมู่ที่ต้องการสั่งพิมพ์ป้ายราคา
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="relative min-w-52 flex-1 xl:flex-none">
              <span className="sr-only">ค้นหาหมวดหมู่</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ค้นหาชื่อหรือรหัสหมวดหมู่..."
                className="input-default h-9 py-1.5 pl-9 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={toggleVisibleCategories}
              aria-pressed={allVisibleSelected}
              className="inline-flex items-center gap-2 rounded-input border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-gray hover:bg-slate-50"
            >
              <span
                aria-hidden="true"
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  allVisibleSelected
                    ? "border-primary bg-primary text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {allVisibleSelected && <Check className="h-3 w-3" />}
              </span>
              เลือกทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              className="inline-flex items-center gap-2 rounded-input border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-gray hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              ยกเลิกทั้งหมด
            </button>
          </div>
        </div>

        <label className="mt-3 flex cursor-pointer items-center gap-2 border-b border-slate-100 pb-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={categoryCount > 0 && selectedCategories.length === categoryCount}
            onChange={selectAllCategories}
            className="h-4 w-4 accent-primary"
          />
          เลือกทั้งหมด (Select All Categories)
        </label>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {loading && (
            <p className="col-span-full py-8 text-center text-sm text-gray">
              กำลังโหลดหมวดหมู่สินค้า...
            </p>
          )}
          {error && (
            <p role="alert" className="col-span-full py-8 text-center text-sm text-danger">
              {error}
            </p>
          )}
          {!loading && !error && filteredCategories.map((category) => {
            const checked = selectedCategories.includes(category.id);
            return (
              <label
                key={category.id}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-input border px-3 py-2 text-sm font-semibold transition ${
                  checked
                    ? "border-primary bg-secondary text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-secondary hover:bg-sky-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(category.id)}
                  className="h-4 w-4 shrink-0 accent-primary"
                />
                {category.name}
              </label>
            );
          })}
          {!loading && !error && filteredCategories.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-gray">
              ไม่พบหมวดหมู่ที่ค้นหา
            </p>
          )}
        </div>
      </section>

      {/* ── File Upload & Options Card ── */}
      <section className="card-default p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <FileUp className="h-4 w-4 text-primary" />
          <h2 className="text-body font-bold text-slate-800 sm:text-subheading">
            หรือ อัปโหลดไฟล์ &amp; ตัวเลือกเพิ่มเติม
          </h2>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-gray">
            นำเข้าไฟล์ / กำหนดสาขา
          </span>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <section className="rounded-input border border-slate-100 bg-slate-50/70 p-3">
            <label
              htmlFor="category-file"
              className="mb-1 block text-sm font-medium text-gray"
            >
              อัปโหลดไฟล์ข้อมูลสินค้า
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="input-default flex min-w-0 flex-1 cursor-pointer items-center truncate py-1.5 text-sm">
                <span className="truncate">
                  {file?.name ?? "เลือกไฟล์ .xlsx, .xls หรือ .csv"}
                </span>
                <input
                  id="category-file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(event) =>
                    handleFileChange(event.target.files?.[0])
                  }
                  className="sr-only"
                />
              </label>
              <Button
                disabled={uploadLoading}
                onClick={uploadSelectedFile}
                variant="secondary"
                size="sm"
                isLoading={uploadLoading}
                leftIcon={<Upload className="h-4 w-4" />}
              >
                {uploadLoading ? "กำลังส่ง..." : "เพิ่มไฟล์"}
              </Button>
            </div>
            <p className="mt-1 text-caption text-gray">ขนาดไฟล์สูงสุด 5 MB</p>
          </section>

          <section className="rounded-input border border-slate-100 bg-slate-50/70 p-3">
            <h3 className="text-sm font-semibold text-gray">การระบุสาขาบนป้าย</h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="branch-mode"
                  checked={branchMode === "none"}
                  onChange={() => setBranchMode("none")}
                  className="accent-primary"
                />
                ไม่ใส่สาขา
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="branch-mode"
                  checked={branchMode === "branch"}
                  onChange={() => setBranchMode("branch")}
                  className="accent-primary"
                />
                สาขาที่เลือก ({branchId})
              </label>
              <span className="rounded bg-white px-2 py-1 text-sm font-semibold text-primary">
                {branchId}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray">
                <input
                  type="checkbox"
                  checked={englishEnabled}
                  onChange={(event) => setEnglishEnabled(event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                ภาษาอังกฤษ (Eng)
              </label>
              <input
                type="text"
                value={englishText}
                onChange={(event) => setEnglishText(event.target.value)}
                disabled={!englishEnabled}
                placeholder="พิมพ์ชื่อสินค้าภาษาอังกฤษกำกับ"
                className="input-default min-w-48 flex-1 py-1 text-sm disabled:bg-slate-100"
              />
            </div>
          </section>
        </div>
        {(message || jobError || uploadMessage) && (
          <p
            role={jobError || error ? "alert" : "status"}
            className={`mt-3 text-sm ${jobError || error ? "text-danger" : "text-warning"}`}
          >
            {jobError || error || message || uploadMessage}
          </p>
        )}
      </section>

      {/* ── Actions Card ── */}
      <section className="card-default flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 rounded-input bg-sky-50 p-1.5 text-secondary">
            <Printer className="h-4 w-4" />
          </span>
          <div>
            <p
              className={`text-body font-semibold ${
                selectedCategories.length > 0 ? "text-success" : "text-warning"
              }`}
            >
              {selectedCategories.length > 0
                ? `เลือกหมวดหมู่แล้ว ${selectedCategories.length} หมวด`
                : "ยังไม่ได้เลือกหมวดหมู่สินค้า"}
            </p>
            <p className="text-label text-gray">
              เครื่องพิมพ์เป้าหมาย: Zebra ZD420 (สติกเกอร์บาร์โค้ด) [แนะนำ]
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            onClick={() => {
              setSelectedCategories([]);
              setMessage("");
            }}
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            ล้างการเลือก
          </Button>
          <Button
            disabled={selectedCategories.length === 0 || jobLoading}
            onClick={() => void printTags()}
            variant="outline"
            size="sm"
            isLoading={jobLoading}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            ตัวอย่างก่อนพิมพ์
          </Button>
          <Button
            disabled={selectedCategories.length === 0 || jobLoading}
            onClick={() => void printTags()}
            variant="primary"
            size="md"
            isLoading={jobLoading}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            {jobLoading ? "กำลังเตรียมรายการพิมพ์..." : "สั่งพิมพ์ป้ายราคา"}
          </Button>
        </div>
      </section>

      <Footer />

      {/* ── Modal พรีวิวป้ายราคาและสั่งพิมพ์ (รูปแบบเดียวกับหน้า printtingRequest) ── */}
      <PrintSheetModal
        isOpen={Boolean(activePrintRequest)}
        onClose={() => setActivePrintRequest(null)}
        printingRequest={activePrintRequest}
        products={effectivePreviewProducts}
        branchId={branchMode === "branch" ? branchId : "P0000"}
        onConfirmPrint={async () => {
          // print job ถูกสร้างแล้วผ่าน createJob ใน printTags()
        }}
        isLoading={jobLoading}
        errorMessage={jobError}
        totalQuantity={activePrintRequest?.quantity}
      />
    </div>
  );
}
