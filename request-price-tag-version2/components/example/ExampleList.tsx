import type { ExampleItem, ExampleStatus } from "@/types/example";

type Props = {
  items: ExampleItem[];
  onToggleStatus?: (item: ExampleItem) => void;
  onDelete?: (id: string) => void;
};

const STATUS_BADGE_STYLES: Record<ExampleStatus, string> = {
  active: "bg-sky-50 text-sky-700 border-sky-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
};

/**
 * Presentational Component สำหรับแสดงรายการอย่างเดียว
 * รับข้อมูลและ callback ผ่าน props เท่านั้น (ไม่มีการเรียก API ในตัวเอง)
 */
export default function ExampleList({
  items,
  onToggleStatus,
  onDelete,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        ยังไม่มีข้อมูลตัวอย่าง
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-slate-800">
                {item.title}
              </p>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[item.status]}`}
              >
                {item.status}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-600">
              {item.description || "-"}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Created: {item.createdAt}
              {item.updatedAt ? ` • Updated: ${item.updatedAt}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onToggleStatus ? (
              <button
                type="button"
                onClick={() => onToggleStatus(item)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.status === "completed" ? "Mark Active" : "Mark Completed"}
              </button>
            ) : null}

            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
              >
                Delete
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
