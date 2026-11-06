"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import Button from "@/components/Button";
import Table from "@/components/Table";
import Combobox from "@/components/Combobox";
import StatusTag from "@/components/StatusTag";
import { useToast } from "@/libs/toast-provider";
import type {
  ButtonVariant,
  ButtonSize,
  BadgeContext,
  ToastType,
} from "@/types/ui";
import type { TableColumn } from "@/components/Table";
import type { ComboboxOption } from "@/components/Combobox";

const BUTTON_VARIANTS: ButtonVariant[] = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "danger",
];
const BUTTON_SIZES: ButtonSize[] = ["sm", "md", "lg"];
const BADGE_CONTEXTS: BadgeContext[] = ["success", "error", "warning", "mute"];

type SampleRow = {
  id: string;
  title: string;
  branch: string;
  status: BadgeContext;
};

const SAMPLE_ROWS: SampleRow[] = [
  { id: "1", title: "ตรวจนับสต๊อกสาขา A", branch: "สาขา A", status: "success" },
  { id: "2", title: "ตรวจนับสต๊อกสาขา B", branch: "สาขา B", status: "warning" },
  { id: "3", title: "ตรวจนับสต๊อกสาขา C", branch: "สาขา C", status: "error" },
];

const BRANCH_OPTIONS: ComboboxOption<string>[] = [
  { label: "สาขา A", value: "A" },
  { label: "สาขา B", value: "B" },
  { label: "สาขา C", value: "C" },
  { label: "สาขา D (ปิดปรับปรุง)", value: "D", disabled: true },
];

const TOAST_PRESETS: { label: string; type: ToastType }[] = [
  { label: "✅ Success", type: "success" },
  { label: "❌ Error", type: "error" },
  { label: "ℹ️ Info", type: "info" },
  { label: "⚠️ Warning", type: "warning" },
];

/**
 * รวม component พื้นฐานทั้งหมดไว้ในหน้าเดียวเพื่อดู UI/ปรับ props ได้ครบภาพเดียว
 */
export default function ComponentGallery() {
  const { showToast } = useToast();
  const [branch, setBranch] = useState<string | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableEmpty, setTableEmpty] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const columns: TableColumn<SampleRow>[] = [
    { key: "title", header: "รายการ", accessor: "title" },
    { key: "branch", header: "สาขา", accessor: "branch", align: "center" },
    {
      key: "status",
      header: "สถานะ",
      align: "center",
      render: (row) => <StatusTag label={row.status} status={row.status} />,
    },
  ];

  return (
    <div className="mt-6 grid gap-6">
      {/* Button */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Button</h2>
        <p className="mt-1 text-sm text-slate-500">
          variant x size ทุกแบบ + loading/disabled
        </p>

        <div className="mt-4 grid gap-3">
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-3">
              <span className="w-20 shrink-0 text-xs font-medium text-slate-400">
                {variant}
              </span>
              {BUTTON_SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {size}
                </Button>
              ))}
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
            <span className="w-20 shrink-0 text-xs font-medium text-slate-400">
              states
            </span>
            <Button
              isLoading={buttonLoading}
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setButtonLoading(true);
                setTimeout(() => setButtonLoading(false), 1500);
              }}
            >
              กดเพื่อ Loading
            </Button>
            <Button disabled>Disabled</Button>
            <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />}>
              ลบ
            </Button>
          </div>
        </div>
      </section>

      {/* StatusTag */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">StatusTag</h2>
        <p className="mt-1 text-sm text-slate-500">badge สถานะทั้งหมด</p>

        <div className="mt-4 flex flex-wrap gap-3">
          {BADGE_CONTEXTS.map((status) => (
            <StatusTag key={status} label={status} status={status} />
          ))}
        </div>
      </section>

      {/* Combobox */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Combobox</h2>
        <p className="mt-1 text-sm text-slate-500">
          searchable select พร้อม clearable
        </p>

        <div className="mt-4 max-w-xs">
          <Combobox
            options={BRANCH_OPTIONS}
            value={branch}
            onChange={setBranch}
            placeholder="เลือกสาขา"
            clearable
          />
          <p className="mt-2 text-xs text-slate-400">
            ค่าที่เลือก: {branch ?? "(ยังไม่เลือก)"}
          </p>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Table</h2>
        <p className="mt-1 text-sm text-slate-500">
          columns กำหนดเอง + loading/empty state
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTableLoading((v) => !v)}
          >
            Toggle loading
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTableEmpty((v) => !v)}
          >
            Toggle empty
          </Button>
        </div>

        <div className="mt-4">
          <Table
            columns={columns}
            data={tableEmpty ? [] : SAMPLE_ROWS}
            rowKey={(row) => row.id}
            isLoading={tableLoading}
            striped
          />
        </div>
      </section>

      {/* Toast */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Toast</h2>
        <p className="mt-1 text-sm text-slate-500">
          เรียกผ่าน useToast() จาก ToastProvider กลาง
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {TOAST_PRESETS.map((preset) => (
            <Button
              key={preset.type}
              size="sm"
              variant="outline"
              onClick={() =>
                showToast(`ทดสอบ toast: ${preset.label}`, preset.type)
              }
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
