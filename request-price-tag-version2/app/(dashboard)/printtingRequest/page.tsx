"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Printer,
} from "lucide-react";
import Button from "@/components/Button";
import Footer from "../../../components/Footer";
import Table from "@/components/Table";
import type { TableColumn } from "@/components/Table";
import PrintSheetModal from "@/components/price-tag/PrintSheetModal";
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

  const branchData = data?.branchId === branchId ? data : null;
  const previewProducts = branchData?.previewProducts ?? [];
  const rows = useMemo(
    () => {
      const requests = branchData?.requests ?? [];
      return sortAscending ? requests : [...requests].reverse();
    },
    [branchData?.requests, sortAscending],
  );

  const isMultipleSelected = Boolean(
    printingRequest &&
      selectedIds.includes(printingRequest.id) &&
      selectedIds.length > 1,
  );

  const totalPrintQuantity = useMemo(() => {
    if (isMultipleSelected) {
      return rows
        .filter((r) => selectedIds.includes(r.id))
        .reduce((sum, r) => sum + r.quantity, 0);
    }
    return printingRequest?.quantity ?? 1;
  }, [isMultipleSelected, rows, selectedIds, printingRequest]);

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
  }

  function printSelected() {
    if (selectedIds.length === 0) return;
    const request = rows.find((item) => item.id === selectedIds[0]);
    if (request) printRequest(request);
  }

  async function confirmPrint(copiesToPrint: number, printerToUse: string) {
    if (!printingRequest) return;
    const requestIds = selectedIds.includes(printingRequest.id)
      ? selectedIds
      : [printingRequest.id];
    await createPrintJob({
      requestIds,
      copies: copiesToPrint,
      printer: printerToUse,
    });
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
          className="h-5 w-5 accent-secondary"
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
          className="h-5 w-5 accent-secondary"
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
          {request.quantity}&nbsp;{formatDate(request.date)}
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
          leftIcon={<Printer className="mx-auto h-8 w-8" />}
          className="p-2 text-primary hover:bg-sky-100 transition-colors"
        />
      ),
    },
  ];

  return (
    <div className="flex min-h-full flex-col gap-4 bg-surface p-3 sm:p-4 md:p-6">

      {/* ── Header Banner ── */}
      <header className="rounded-card bg-gradient-to-r from-primary to-secondary px-4 py-4 text-white shadow-card sm:px-6 sm:py-5">
        <h1 className="text-xl font-bold leading-tight sm:text-heading md:text-3xl">
          ส่วนของการพิมพ์ป้ายราคาของ สห ลอว์สัน
        </h1>
        <p className="mt-1 text-label sm:text-body">
          ป้ายราคารวมทั้งหมดที่หน้าร้านขอ กับหลังบ้านลอว์สันสร้างเอง
        </p>
        <p className="mt-1 text-label text-warning-light sm:text-body">
          *** การจัดลำดับ Tier list เป็นข้อมูลล่าสุดของเดือน 05/2026
          <span className="text-danger-light"> (ข้อมูลที่แสดงยังไม่เป็นทางการ)</span>
        </p>
      </header>

      {/* ── Summary Stats ── */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-subheading font-semibold text-black">
            รายการคำร้องของสาขา {branchId}
          </h2>
        </div>

        {/* stat cards: 1 col mobile → 3 col md */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "สาขาที่เลือก",   value: branchData?.summary.branches ?? 0 },
            { label: "รวมรายการ",       value: branchData?.summary.requests ?? 0 },
            { label: "รวมป้ายทั้งหมด", value: branchData?.summary.labels   ?? 0 },
          ].map((stat) => (
            <section
              key={stat.label}
              className="card-default flex items-center justify-between gap-4 p-4 shadow-sm sm:flex-col sm:items-start sm:gap-1 sm:p-3"
            >
              <p className="text-body font-medium text-primary sm:text-label">
                {stat.label}
              </p>
              <p className="text-2xl font-bold leading-tight text-primary sm:mt-1 sm:text-3xl">
                {stat.value.toLocaleString("th-TH")}
              </p>
            </section>
          ))}
        </div>
      </section>

      {/* ── Table Section ── */}
      <section className="card-default overflow-hidden p-0">

        {/* bulk-action bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-sky-50 px-4 py-2.5">
            <p className="text-body text-primary">
              เลือกแล้ว <strong>{selectedIds.length}</strong> รายการ
            </p>
            <Button
              onClick={printSelected}
              variant="secondary"
              size="sm"
              leftIcon={<Printer className="h-7 w-7" />}
            >
              พิมพ์รายการที่เลือก
            </Button>
          </div>
        )}

        {/* scrollable table on small screens */}
        <div className="overflow-x-auto">
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
            tableClassName="min-w-[560px] w-full text-body"
            headerClassName="bg-primary text-white"
            headerCellClassName="text-white py-3"
            striped
            rowClassName="hover:bg-sky-50/50"
          />
        </div>
      </section>

      <Footer />

      <PrintSheetModal
        isOpen={Boolean(printingRequest)}
        onClose={() => setPrintingRequest(null)}
        printingRequest={printingRequest}
        products={previewProducts}
        branchId={branchId}
        onConfirmPrint={confirmPrint}
        isLoading={printLoading}
        errorMessage={printError}
        totalQuantity={totalPrintQuantity}
      />
    </div>
  );
}
