"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Printer,
  X,
} from "lucide-react";
import Button from "@/components/Button";
import Footer from "../../../components/Footer";
import Table from "@/components/Table";
import type { TableColumn } from "@/components/Table";
import { usePrintingRequests } from "@/hook/use-printing-requests";
import type { BranchId } from "@/types/branch";
import type { PrintingProduct, PrintingRequest } from "@/types/printing";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function PrinttingRequestPage() {
  const {
    branchId,
    data,
    loading,
    error,
    printLoading,
    printError,
    createPrintJob,
  } = usePrintingRequests();
  const [selectedByBranch, setSelectedByBranch] = useState<
    Partial<Record<BranchId, string[]>>
  >({});
  const selectedIds = selectedByBranch[branchId] ?? [];
  function setSelectedIds(
    update: string[] | ((current: string[]) => string[]),
  ) {
    setSelectedByBranch((current) => {
      const currentIds = current[branchId] ?? [];
      return {
        ...current,
        [branchId]:
          typeof update === "function" ? update(currentIds) : update,
      };
    });
  }
  const [printingRequestsByBranch, setPrintingRequestsByBranch] = useState<
    Partial<Record<BranchId, PrintingRequest | null>>
  >({});
  const printingRequest = printingRequestsByBranch[branchId] ?? null;
  function setPrintingRequest(request: PrintingRequest | null) {
    setPrintingRequestsByBranch((current) => ({
      ...current,
      [branchId]: request,
    }));
  }
  const [sortAscending, setSortAscending] = useState(true);
  const [printer, setPrinter] = useState("zebra");
  const [copies, setCopies] = useState(1);

  const branchData = data?.branchId === branchId ? data : null;
  const previewProducts = branchData?.previewProducts ?? [];
  const rows = useMemo(
    () => {
      const requests = branchData?.requests ?? [];
      return sortAscending ? requests : [...requests].reverse();
    },
    [branchData?.requests, sortAscending],
  );
  const allSelected =
    rows.length > 0 && rows.every((request) => selectedIds.includes(request.id));

  function toggleAll() {
    setSelectedIds(allSelected ? [] : rows.map((request) => request.id));
  }

  function toggleRequest(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  function printRequest(request: PrintingRequest) {
    setPrintingRequest(request);
    setCopies(1);
  }

  function printSelected() {
    if (selectedIds.length === 0) return;
    const request = rows.find((item) => item.id === selectedIds[0]);
    if (request) printRequest(request);
  }

  async function confirmPrint() {
    if (!printingRequest) return;
    const requestIds = selectedIds.includes(printingRequest.id)
      ? selectedIds
      : [printingRequest.id];
    const job = await createPrintJob({ requestIds, copies, printer });
    if (job) window.print();
  }

  function renderPriceTag(
    product: PrintingProduct,
    index: number,
    activeBranchId: string,
  ) {
    return (
      <article key={`${product.barcode}-${index}`} className="print-price-tag">
        <div className="flex justify-between text-[9px]">
          <span>04/11/2026</span>
          <span>{activeBranchId}</span>
        </div>
        <div className="mt-1 h-8 bg-[repeating-linear-gradient(90deg,#111_0px,#111_1px,transparent_1px,transparent_3px,#111_3px,#111_5px,transparent_5px,transparent_7px)]" />
        <div className="flex justify-between text-[8px]">
          <span>{product.days}</span>
          <span>NR</span>
          <span>{product.itemCode}</span>
          <span>{product.barcode}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex h-7 w-8 items-center justify-center border-2 border-black text-xs">O</span>
          <span className="text-[36px] font-black leading-none">
            {product.price}<span className="text-base">.00</span>
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[9px] font-semibold leading-tight">{product.name}</p>
        <p className="line-clamp-1 text-[8px] leading-tight text-slate-600">{product.english}</p>
      </article>
    );
  }

  const requestColumns: TableColumn<PrintingRequest>[] = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          aria-label="เลือกคำร้องทั้งหมด"
          checked={allSelected}
          onChange={toggleAll}
          className="h-4 w-4 accent-secondary"
        />
      ),
      align: "center",
      width: "3rem",
      headerClassName: "text-center",
      render: (request) => (
        <input
          type="checkbox"
          aria-label={`เลือก ${request.documentNumber}`}
          checked={selectedIds.includes(request.id)}
          onChange={() => toggleRequest(request.id)}
          className="h-4 w-4 accent-secondary"
        />
      ),
    },
    {
      key: "documentNumber",
      header: (
        <button
          type="button"
          onClick={() => setSortAscending((current) => !current)}
          className="inline-flex items-center gap-2 font-semibold"
        >
          เลขที่เอกสาร
          {sortAscending ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </button>
      ),
      accessor: "documentNumber",
      headerClassName: "text-left",
      className: "font-bold text-black",
    },
    {
      key: "quantity",
      header: (
        <button
          type="button"
          onClick={() => setSortAscending((current) => !current)}
          className="inline-flex items-center gap-2 font-semibold"
        >
          จำนวนป้าย วันที่
          {sortAscending ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </button>
      ),
      align: "center",
      width: "25%",
      headerClassName: "text-center",
      className: "text-center font-semibold text-black",
      render: (request) => (
        <>
          {request.quantity} &nbsp;{formatDate(request.date)}
        </>
      ),
    },
    {
      key: "print",
      header: "พิมพ์ป้ายราคา",
      align: "center",
      width: "20%",
      headerClassName: "text-center font-semibold",
      render: (request) => (
        <Button
          variant="ghost"
          size="sm"
          aria-label={`พิมพ์ ${request.documentNumber}`}
          onClick={() => printRequest(request)}
          leftIcon={<Printer className="mx-auto h-5 w-5" />}
          className="p-1.5 text-primary hover:bg-sky-100"
        />
      ),
    },
  ];

  return (
    <div className="flex min-h-full flex-col gap-4 bg-surface p-4 sm:p-6">
      <header className="rounded-card bg-gradient-to-r from-primary to-secondary px-5 py-4 text-white shadow-card sm:px-6">
        <h1 className="text-heading font-bold sm:text-3xl">
          ส่วนของการพิมพ์ป้ายราคาของ สห ลอว์สัน
        </h1>
        <p className="mt-1 text-label">
          ป้ายราคารวมทั้งหมดที่หน้าร้านขอ กับหลังบ้านลอว์สันสร้างเอง
        </p>
        <p className="mt-1 text-label text-warning-light">
          *** การจัดลำดับ Tier list เป็นข้อมูลล่าสุดของเดือน 05/2026
          <span className="text-danger-light"> (ข้อมูลที่แสดงยังไม่เป็นทางการ)</span>
        </p>
      </header>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-subheading font-semibold text-black">
            รายการคำร้องของสาขา {branchId}
          </h2>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          {[
            { label: "สาขาที่เลือก", value: branchData?.summary.branches ?? 0 },
            { label: "รวมรายการ", value: branchData?.summary.requests ?? 0 },
            { label: "รวมป้ายทั้งหมด", value: branchData?.summary.labels ?? 0 },
          ].map((stat) => (
            <section key={stat.label} className="card-default p-3 shadow-sm">
              <p className="text-caption text-primary">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold leading-tight text-primary">
                {stat.value.toLocaleString("th-TH")}
              </p>
            </section>
          ))}
        </div>
      </section>

      <section className="card-default overflow-hidden p-0">
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-sky-50 px-4 py-2">
            <p className="text-sm text-primary">
              เลือกแล้ว {selectedIds.length} รายการ
            </p>
            <Button
              onClick={printSelected}
              variant="secondary"
              size="sm"
              leftIcon={<Printer className="h-4 w-4" />}
            >
              พิมพ์รายการที่เลือก
            </Button>
          </div>
        )}

        <Table
          columns={requestColumns}
          data={error ? [] : rows}
          rowKey={(request) => request.id}
          isLoading={loading && !error}
          emptyMessage={
            error ? (
              <span role="alert" className="text-danger">
                {error}
              </span>
            ) : (
              "ไม่พบคำร้องในสาขานี้"
            )
          }
          className="rounded-none border-0"
          tableClassName="min-w-[640px] text-sm"
          headerClassName="bg-primary text-white"
          headerCellClassName="text-white"
          striped
          rowClassName="hover:bg-sky-50/50"
        />
      </section>

      <Footer />

      {printingRequest && (
        <div
          className="print-modal-backdrop fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-3 sm:p-6"
          tabIndex={-1}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPrintingRequest(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setPrintingRequest(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="print-preview-title"
            className="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-card bg-white shadow-modal"
          >
            <div className="flex shrink-0 items-center justify-between bg-slate-900 px-4 py-3 text-white">
              <button
                type="button"
                onClick={() => setPrintingRequest(null)}
                className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับ
              </button>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Printer className="h-4 w-4 text-red-400" />
                <h2 id="print-preview-title">ตัวอย่างก่อนพิมพ์ (Print Preview)</h2>
              </div>
              <button
                type="button"
                aria-label="ปิดหน้าต่างตัวอย่างพิมพ์"
                onClick={() => setPrintingRequest(null)}
                className="rounded-md p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-[#3b3d3f] p-3 sm:p-5">
              <div className="print-price-tag-sheet mx-auto max-w-5xl bg-white p-3 sm:p-5">
                <div className="mb-3 flex justify-between border-b border-dashed border-slate-300 pb-2 text-[9px] text-slate-500">
                  <span>LAWSON 108 STANDARD PRICE TAG TEMPLATE (3xN A4 STICKER)</span>
                  <span>
                    BRANCH: {branchId} | PRINT JOB #
                    {printingRequest.documentNumber} | {formatDate(printingRequest.date)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 12 }, (_, index) =>
                    renderPriceTag(
                      previewProducts[index % previewProducts.length] ?? {
                        barcode: "",
                        english: "",
                        name: "",
                        price: 0,
                        days: "",
                        itemCode: "",
                      },
                      index,
                      branchId,
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="print-modal-controls flex shrink-0 flex-col gap-4 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <label className="flex items-center gap-2 text-sm text-gray">
                  เครื่องพิมพ์:
                  <select
                    value={printer}
                    onChange={(event) => setPrinter(event.target.value)}
                    className="input-default w-auto min-w-64 py-1.5"
                  >
                    <option value="zebra">
                      Zebra ZD420 (ป้ายสติกเกอร์บาร์โค้ด) [พร้อมใช้งาน]
                    </option>
                    <option value="default">เครื่องพิมพ์เริ่มต้นของระบบ</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray">
                  จำนวน:
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={copies}
                    onChange={(event) =>
                      setCopies(Math.max(1, Number(event.target.value) || 1))
                    }
                    className="input-default w-16 py-1 text-center"
                  />
                  ชุด
                </label>
                <span className="sr-only">
                  เครื่องพิมพ์ที่เลือก: {printer}
                </span>
              </div>
              {printError && (
                <p role="alert" className="text-sm text-danger">
                  {printError}
                </p>
              )}
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  onClick={() => setPrintingRequest(null)}
                  variant="outline"
                  size="md"
                  leftIcon={<X className="h-4 w-4" />}
                  className="border-danger/30 bg-danger-light/40 text-danger hover:bg-danger-light"
                >
                  ยกเลิกการพิมพ์
                </Button>
                <Button
                  disabled={printLoading}
                  onClick={confirmPrint}
                  variant="primary"
                  size="md"
                  isLoading={printLoading}
                  leftIcon={<Printer className="h-4 w-4" />}
                >
                  {printLoading ? "กำลังเตรียมพิมพ์..." : "ยืนยันการพิมพ์ป้ายราคา"}
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}