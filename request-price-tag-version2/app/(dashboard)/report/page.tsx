"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  LoaderCircle,
  Printer,
  Search,
  X,
} from "lucide-react";
import Button from "@/components/Button";
import Combobox from "@/components/Combobox";
import type { ComboboxOption } from "@/components/Combobox";
import StatusTag from "@/components/StatusTag";
import Footer from "../../../components/Footer";
import Table from "@/components/Table";
import type { TableColumn } from "@/components/Table";
import { useReportDocuments } from "@/hook/use-report-documents";
import type {
  ReportDocumentItem,
  ReportDocumentStatus,
  ReportDocumentSummary,
  ReportPeriod,
  ReportStatusFilter,
} from "@/types/report";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(status: ReportDocumentStatus) {
  return status === "printed" ? "พิมพ์แล้ว" : "ยังไม่ถูกสั่งพิมพ์";
}

export default function ReportPage() {
  const {
    filter,
    updateFilter,
    resetFilters,
    data,
    loading,
    error,
    selectedIds,
    setSelectedIds,
    activeDocument,
    detailLoading,
    detailError,
    actionLoading,
    actionError,
    actionMessage,
    openDetails,
    closeDetails,
    exportSelected: exportSelectedDocuments,
    reprintSelected,
  } = useReportDocuments();
  const visibleDocuments = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / filter.pageSize));
  const allVisibleSelected =
    visibleDocuments.length > 0 &&
    visibleDocuments.every((document) => selectedIds.includes(document.id));

  function toggleDocument(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  function toggleVisibleDocuments() {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter(
            (id) => !visibleDocuments.some((document) => document.id === id),
          )
        : [
            ...new Set([
              ...current,
              ...visibleDocuments.map((document) => document.id),
            ]),
          ],
    );
  }

  async function exportSelected() {
    const exported = await exportSelectedDocuments(selectedIds);
    if (!exported) return;
    const csvRows = [
      ["เลขที่เอกสาร", "จำนวนป้าย", "วันที่สร้าง", "วันที่พิมพ์", "สร้างโดย", "สถานะ"],
      ...exported.map((document) => [
        document.documentNumber,
        String(document.labels),
        formatDate(document.requestDate),
        formatDate(document.printDate),
        document.user,
        statusLabel(document.status),
      ]),
    ];
    const csv = `\uFEFF${csvRows
      .map((row) =>
        row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","),
      )
      .join("\n")}`;
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "report-documents.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function createSelectedReprint() {
    const result = await reprintSelected(selectedIds);
    if (result) setSelectedIds([]);
  }

  const firstItem = totalItems ? (filter.page - 1) * filter.pageSize + 1 : 0;
  const lastItem = Math.min(filter.page * filter.pageSize, totalItems);
  const pageSizeOptions: ComboboxOption<number>[] = [15, 30, 50, 100].map(
    (pageSize) => ({
      label: `${pageSize} รายการ / หน้า`,
      value: pageSize,
    }),
  );
  const periodOptions: ComboboxOption<ReportPeriod>[] = [
    { label: "ย้อนหลัง 30 วันล่าสุด", value: "30" },
    { label: "ย้อนหลัง 7 วัน", value: "7" },
    { label: "ย้อนหลัง 90 วัน", value: "90" },
    { label: "ทั้งหมด", value: "all" },
  ];
  const statusOptions: ComboboxOption<ReportStatusFilter>[] = [
    { label: "ทั้งหมด (All Status)", value: "all" },
    { label: "พิมพ์แล้ว", value: "printed" },
    { label: "ยังไม่ถูกสั่งพิมพ์", value: "pending" },
  ];
  const userOptions: ComboboxOption<string>[] = [
    { label: "ทั้งหมด (All Users)", value: "all" },
    ...(data?.users ?? []).map((user) => ({ label: user, value: user })),
  ];
  const documentColumns: TableColumn<ReportDocumentSummary>[] = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          aria-label="เลือกเอกสารทั้งหมดในหน้านี้"
          checked={allVisibleSelected}
          onChange={toggleVisibleDocuments}
          className="h-4 w-4 accent-white"
        />
      ),
      align: "center",
      width: "2.5rem",
      headerClassName: "text-center",
      render: (document) => (
        <input
          type="checkbox"
          aria-label={`เลือกเอกสาร ${document.documentNumber}`}
          checked={selectedIds.includes(document.id)}
          onChange={() => toggleDocument(document.id)}
          className="h-4 w-4 accent-secondary"
        />
      ),
    },
    {
      key: "index",
      header: "ลำดับ",
      align: "center",
      width: "3rem",
      headerClassName: "text-center",
      className: "text-center text-slate-500",
      render: (_document, index) => firstItem + index,
    },
    {
      key: "documentNumber",
      header: (
        <button
          type="button"
          onClick={() =>
            updateFilter(
              "sortOrder",
              filter.sortOrder === "asc" ? "desc" : "asc",
            )
          }
          className="inline-flex items-center gap-1 font-semibold"
        >
          เลขที่เอกสาร / จำนวนป้าย
          {filter.sortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </button>
      ),
      className: "font-bold text-slate-800",
      render: (document) => (
        <>
          {document.documentNumber}
          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              document.labels > 10
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {document.labels} ป้าย
          </span>
          {document.status === "pending" && (
            <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
              รอดำเนินการ
            </span>
          )}
        </>
      ),
    },
    {
      key: "requestDate",
      header: "วันที่สร้าง",
      align: "center",
      headerClassName: "text-center",
      className: "text-center text-gray",
      render: (document) => formatDate(document.requestDate),
    },
    {
      key: "printDate",
      header: "วันที่พิมพ์",
      align: "center",
      headerClassName: "text-center",
      className: "text-center text-gray",
      render: (document) => formatDate(document.printDate),
    },
    {
      key: "user",
      header: "สร้างโดย",
      align: "center",
      headerClassName: "text-center",
      className: "text-center",
      render: (document) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-gray">
          {document.user}
        </span>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      align: "center",
      headerClassName: "text-center",
      className: "text-center",
      render: (document) => (
        <StatusTag
          label={statusLabel(document.status)}
          status={document.status === "printed" ? "success" : "warning"}
          size="sm"
        />
      ),
    },
    {
      key: "details",
      header: "รายละเอียด",
      align: "center",
      width: "4rem",
      headerClassName: "text-center",
      className: "text-center",
      render: (document) => (
        <Button
          variant="outline"
          size="sm"
          aria-label={`ดูรายละเอียดเอกสาร ${document.documentNumber}`}
          onClick={() => void openDetails(document.id)}
          leftIcon={<Eye className="h-4 w-4" />}
          className="border-slate-200 bg-white p-1 text-slate-700 hover:border-primary hover:bg-sky-50 hover:text-primary"
        />
      ),
    },
  ];
  const detailColumns: TableColumn<ReportDocumentItem>[] = [
    {
      key: "line",
      header: "ลำดับ",
      accessor: "line",
      align: "center",
      width: "8%",
      headerClassName: "whitespace-nowrap",
      className: "whitespace-nowrap font-medium text-slate-500",
    },
    {
      key: "code",
      header: "รหัสสินค้า",
      accessor: "code",
      align: "center",
      width: "13%",
      headerClassName: "whitespace-nowrap text-center",
      className: "whitespace-nowrap text-center font-bold text-slate-800",
    },
    {
      key: "name",
      header: "ชื่อสินค้า",
      width: "22%",
      render: (item) => (
        <span className="font-medium text-slate-800" title={item.name}>
          {item.name}
        </span>
      ),
    },
    {
      key: "englishName",
      header: "ชื่อสินค้า (ENG)",
      width: "25%",
      render: (item) => (
        <span className="text-slate-600" title={item.englishName}>
          {item.englishName}
        </span>
      ),
    },
    {
      key: "age",
      header: "อายุสินค้า",
      accessor: "age",
      align: "center",
      width: "11%",
      headerClassName: "whitespace-nowrap text-center",
      className: "whitespace-nowrap text-center text-slate-700",
    },
    {
      key: "price",
      header: "ราคาสินค้า",
      accessor: "price",
      align: "center",
      width: "11%",
      headerClassName: "whitespace-nowrap text-center",
      className: "whitespace-nowrap text-center font-medium text-slate-700",
    },
    {
      key: "quantity",
      header: "จำนวนป้าย",
      accessor: "quantity",
      align: "center",
      width: "10%",
      headerClassName: "whitespace-nowrap text-center",
      className: "whitespace-nowrap text-center font-bold text-slate-800",
    },
  ];

  return (
    <div className="flex min-h-full flex-col gap-4 bg-surface p-4 sm:p-6">
      <header className="rounded-card bg-gradient-to-r from-primary to-secondary px-5 py-4 text-white shadow-card sm:px-6">
        <h1 className="text-heading font-bold sm:text-3xl">
          ส่วนของการดูรายงานความเคลื่อนไหว
        </h1>
        <p className="mt-1 text-label text-warning-light">
          • &nbsp;*** การจัดลำดับ Tier list เป็นข้อมูลล่าสุดของเดือน 05/2026
          <span className="text-danger-light"> (ข้อมูลที่แสดงยังไม่เป็นทางการ)</span>
        </p>
      </header>

      <section className="card-default grid gap-3 p-3 lg:grid-cols-[2fr_0.8fr_0.8fr_0.8fr_auto_auto] lg:items-end">
        <label className="block text-sm font-semibold text-gray">
          เลขที่เอกสาร / Request ID
          <span className="relative mt-1 block">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={filter.query}
              onChange={(event) => updateFilter("query", event.target.value)}
              placeholder="ค้นหาเลขที่เอกสาร เช่น P3519L..."
              className="input-default h-9 py-1.5 pl-9 text-xs"
            />
          </span>
        </label>
        <label className="block text-sm font-semibold text-gray">
          ช่วงเวลา (ย้อนหลัง)
          <Combobox
            id="report-period-filter"
            value={filter.period}
            onChange={(value) => {
              if (value !== null) updateFilter("period", value);
            }}
            options={periodOptions}
            size="sm"
            className="mt-1 text-xs"
          />
        </label>
        <label className="block text-sm font-semibold text-gray">
          สถานะเอกสาร
          <Combobox
            id="report-status-filter"
            value={filter.status}
            onChange={(value) => {
              if (value !== null) updateFilter("status", value);
            }}
            options={statusOptions}
            size="sm"
            className="mt-1 text-xs"
          />
        </label>
        <label className="block text-sm font-semibold text-gray">
          สร้างโดย (User)
          <Combobox
            id="report-user-filter"
            value={filter.user}
            onChange={(value) => updateFilter("user", value ?? "all")}
            options={userOptions}
            placeholder="เลือกผู้ใช้"
            className="mt-1 text-xs"
          />
        </label>
        <Button
          onClick={() => updateFilter("page", 1)}
          variant="secondary"
          size="sm"
          leftIcon={<Filter className="h-4 w-4" />}
          className="h-9 whitespace-nowrap px-4 py-1.5"
        >
          กรองข้อมูล
        </Button>
        <Button
          onClick={resetFilters}
          variant="danger"
          size="sm"
          leftIcon={<X className="h-4 w-4" />}
          className="h-9 whitespace-nowrap px-4 py-1.5"
        >
          ล้างค่าที่เลือกทั้งหมด
        </Button>
      </section>

      <section className="card-default flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-slate-700">การจัดการแบบกลุ่ม:</span>
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-primary">
            เลือกแล้ว {selectedIds.length} รายการ
          </span>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs text-gray underline hover:text-primary"
          >
            ล้างการเลือก
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={selectedIds.length === 0 || actionLoading}
            onClick={() => void exportSelected()}
            variant="outline"
            size="sm"
            isLoading={actionLoading}
            leftIcon={<Download className="h-4 w-4" />}
          >
            ดาวน์โหลด CSV ที่เลือก
          </Button>
          <Button
            disabled={selectedIds.length === 0 || actionLoading}
            onClick={() => void createSelectedReprint()}
            variant="primary"
            size="sm"
            isLoading={actionLoading}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            สั่งพิมพ์ซ้ำใบคำขอที่เลือก (Reprint Selected)
          </Button>
        </div>
        {(actionError || actionMessage) && (
          <p
            role={actionError ? "alert" : "status"}
            className={`text-sm ${actionError ? "text-danger" : "text-success"}`}
          >
            {actionError || actionMessage}
          </p>
        )}
      </section>

      <section className="card-default overflow-visible p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-slate-800">รายการเอกสาร</h2>
            <span className="text-xs text-gray">(Document List)</span>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-primary">
              พบทั้งหมด {totalItems} รายการ
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-success">
              สั่งพิมพ์แล้ว {data?.summary.printed ?? 0}
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              ยังไม่ถูกสั่งพิมพ์ {data?.summary.pending ?? 0}
            </span>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray">
            แสดง:
            <Combobox
              id="report-page-size"
              value={filter.pageSize}
              onChange={(value) => {
                if (value !== null) updateFilter("pageSize", value);
              }}
              options={pageSizeOptions}
              size="sm"
              placeholder="จำนวนรายการต่อหน้า"
              className="w-40 text-xs"
            />
          </label>
        </div>

        <Table
          columns={documentColumns}
          data={error ? [] : visibleDocuments}
          rowKey={(document) => document.id}
          size="sm"
          isLoading={loading && !error}
          striped
          emptyMessage={
            error ? (
              <span role="alert" className="text-danger">
                {error}
              </span>
            ) : (
              "ไม่พบเอกสารที่ตรงกับตัวกรอง"
            )
          }
          className="rounded-none border-0"
          tableClassName="min-w-[900px] text-xs sm:text-sm"
          headerClassName="bg-primary text-white"
          headerCellClassName="text-white"
          rowClassName={(document) =>
            document.status === "pending" ? "bg-amber-50/50" : undefined
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-gray">
          <p>
            แสดง {firstItem} ถึง {lastItem} จากทั้งหมด {totalItems} รายการ
          </p>
          <nav aria-label="เปลี่ยนหน้าเอกสาร" className="flex items-center gap-1">
            <button
              type="button"
              aria-label="หน้าก่อนหน้า"
              disabled={filter.page === 1 || loading}
              onClick={() =>
                updateFilter("page", Math.max(1, filter.page - 1))
              }
              className="rounded border border-slate-200 bg-white p-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  aria-current={pageNumber === filter.page ? "page" : undefined}
                  disabled={loading}
                  onClick={() => updateFilter("page", pageNumber)}
                  className={`min-w-8 rounded border px-2 py-1.5 ${
                    pageNumber === filter.page
                      ? "border-primary bg-primary font-bold text-white"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="หน้าถัดไป"
              disabled={filter.page === totalPages || loading}
              onClick={() =>
                updateFilter("page", Math.min(totalPages, filter.page + 1))
              }
              className="rounded border border-slate-200 bg-white p-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </section>

      <Footer />

{/* modal print  */}
      {(activeDocument || detailLoading || detailError) && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/50 p-2 backdrop-blur-sm sm:p-4"
          tabIndex={-1}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetails();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeDetails();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-details-title"
            className="flex max-h-[88dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  รายละเอียดคำร้องขอ
                </p>
                <h2
                  id="document-details-title"
                  className="mt-1 break-all text-base font-bold text-slate-900 sm:text-xl"
                >
                  {activeDocument
                    ? `เอกสารเลขที่ ${activeDocument.documentNumber}`
                    : "รายละเอียดเอกสาร"}
                </h2>
                {activeDocument && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-primary">
                      {activeDocument.labels} ป้าย
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                      วันที่สร้าง {formatDate(activeDocument.requestDate)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 font-semibold ${
                        activeDocument.status === "printed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {statusLabel(activeDocument.status)}
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label="ปิดรายละเอียดเอกสาร"
                onClick={closeDetails}
                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-auto px-4 py-4 sm:px-6">
              {detailLoading && (
                <p className="flex items-center justify-center gap-2 py-12 text-sm text-gray">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  กำลังโหลดรายละเอียดเอกสาร...
                </p>
              )}
              {detailError && (
                <p role="alert" className="py-12 text-center text-sm text-rose-700">
                  {detailError}
                </p>
              )}
              {activeDocument && (
                <Table
                  columns={detailColumns}
                  data={activeDocument.items}
                  rowKey={(item) => item.line}
                  size="md"
                  striped
                  stickyHeader
                  className="rounded-lg"
                  tableClassName="min-w-[760px] table-fixed text-xs sm:text-sm"
                  headerClassName="bg-primary text-white"
                  headerCellClassName="text-white"
                  rowClassName="h-10 transition last:border-0 odd:bg-white even:bg-slate-50/70 hover:bg-sky-50 sm:h-12"
                />
              )}
            </div>
            {activeDocument && (
              <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:px-6">
                <span>
                  แสดง {activeDocument.items.length} รายการสินค้าในเอกสารนี้
                </span>
                <span className="font-semibold text-slate-700">
                  รวม{" "}
                  {activeDocument.items.reduce(
                    (total, item) => total + item.quantity,
                    0,
                  )}{" "}
                  ป้าย
                </span>
              </footer>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
