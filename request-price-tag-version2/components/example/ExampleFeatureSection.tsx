"use client";

import { useToast } from "@/libs/toast-provider";
import ExampleCreateForm from "@/components/example/ExampleCreateForm";
import ExampleList from "@/components/example/ExampleList";
import { useExampleItems } from "@/hook/use-example-items";
import type { CreateExampleInput, ExampleItem } from "@/types/example";

/**
 * Container Component ของ Example Feature
 * รวมการเชื่อมกันของ Custom Hook (`useExampleItems`) + Toast + Presentational Components
 */
export default function ExampleFeatureSection() {
  const { showToast } = useToast();
  const {
    items,
    isLoading,
    isSubmitting,
    error,
    createItem,
    updateItem,
    removeItem,
    reload,
  } = useExampleItems();

  const handleCreate = async (input: CreateExampleInput) => {
    const created = await createItem(input);

    if (created) {
      showToast("บันทึกข้อมูลตัวอย่างสำเร็จ", "success");
      return;
    }

    showToast("ไม่สามารถบันทึกข้อมูลได้", "error");
  };

  const handleToggleStatus = async (item: ExampleItem) => {
    const nextStatus = item.status === "completed" ? "active" : "completed";
    const updated = await updateItem(item.id, { status: nextStatus });

    if (updated) {
      showToast(`เปลี่ยนสถานะเป็น ${nextStatus} สำเร็จ`, "success");
      return;
    }

    showToast("ไม่สามารถเปลี่ยนสถานะได้", "error");
  };

  const handleDelete = async (id: string) => {
    const deleted = await removeItem(id);

    if (deleted) {
      showToast("ลบรายการสำเร็จ", "success");
      return;
    }

    showToast("ไม่สามารถลบรายการได้", "error");
  };

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Example Feature</h2>
          <p className="text-sm text-slate-500">
            ตัวอย่างโครงสร้างที่แยกเป็น page &gt; feature container &gt; hook
            &gt; service &gt; API route &gt; repo
          </p>
        </div>

        <button
          onClick={() => void reload()}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Reload
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <ExampleCreateForm onSubmit={handleCreate} isSubmitting={isSubmitting} />

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          กำลังโหลดข้อมูล...
        </div>
      ) : (
        <ExampleList
          items={items}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
