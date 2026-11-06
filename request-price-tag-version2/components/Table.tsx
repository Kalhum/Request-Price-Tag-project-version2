import type { ReactNode } from "react";
import { cn } from "@/libs/utils";
import type { TableAlign, TableSize } from "@/types/ui";

export type TableColumn<T> = {
  key: string;
  header: ReactNode;
  accessor?: keyof T;
  render?: (row: T, index: number) => ReactNode;
  align?: TableAlign;
  width?: string;
  className?: string;
  headerClassName?: string;
};

type Props<T> = {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  size?: TableSize;
  striped?: boolean;
  bordered?: boolean;
  stickyHeader?: boolean;
  isLoading?: boolean;
  loadingRows?: number;
  emptyMessage?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: string | ((row: T, index: number) => string | undefined);
  className?: string;
};

const sizeClasses: Record<TableSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const cellPaddingClasses: Record<TableSize, string> = {
  sm: "px-2 py-1.5",
  md: "px-4 py-2.5",
  lg: "px-6 py-3.5",
};

const alignClasses: Record<TableAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/**
 * ตารางกลางที่ปรับ columns/ขนาด/สถานะ loading/empty ได้ผ่าน props แทนการ hardcode markup ซ้ำ
 */
export default function Table<T>({
  columns,
  data,
  rowKey,
  size = "md",
  striped = false,
  bordered = false,
  stickyHeader = false,
  isLoading = false,
  loadingRows = 3,
  emptyMessage = "ไม่มีข้อมูล",
  onRowClick,
  rowClassName,
  className,
}: Props<T>) {
  const resolveCell = (
    column: TableColumn<T>,
    row: T,
    index: number,
  ): ReactNode => {
    if (column.render) {
      return column.render(row, index);
    }
    if (column.accessor) {
      const value = row[column.accessor];
      return value === null || value === undefined ? "-" : String(value);
    }
    return null;
  };

  const resolveRowClassName = (row: T, index: number) =>
    typeof rowClassName === "function"
      ? rowClassName(row, index)
      : rowClassName;

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-2xl border border-slate-200",
        className,
      )}
    >
      <table className={cn("w-full border-collapse", sizeClasses[size])}>
        <thead
          className={cn("bg-slate-50", stickyHeader && "sticky top-0 z-10")}
        >
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={cn(
                  "font-semibold text-slate-700",
                  cellPaddingClasses[size],
                  alignClasses[column.align ?? "left"],
                  bordered && "border border-slate-200",
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: loadingRows }).map((_, rowIndex) => (
              <tr
                key={`loading-${rowIndex}`}
                className="border-t border-slate-100"
              >
                {columns.map((column) => (
                  <td key={column.key} className={cellPaddingClasses[size]}>
                    <div className="h-4 w-full max-w-32 animate-pulse rounded bg-slate-200" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cn(
                  "text-center text-slate-400",
                  cellPaddingClasses[size],
                )}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                className={cn(
                  "border-t border-slate-100",
                  striped && index % 2 === 1 && "bg-slate-50/60",
                  onRowClick && "cursor-pointer hover:bg-slate-50",
                  resolveRowClassName(row, index),
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "text-slate-700",
                      cellPaddingClasses[size],
                      alignClasses[column.align ?? "left"],
                      bordered && "border border-slate-200",
                      column.className,
                    )}
                  >
                    {resolveCell(column, row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
