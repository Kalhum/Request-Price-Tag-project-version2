"use client";

import { FormEvent, useState } from "react";
import type { CreateExampleInput } from "@/types/example";

type Props = {
  onSubmit: (input: CreateExampleInput) => Promise<void>;
  isSubmitting: boolean;
};

/**
 * ฟอร์มเพิ่มข้อมูลแบบแยกเป็น component เดี่ยว
 * รับแค่ contract ที่จำเป็นเพื่อทดแทน implementation ได้ง่าย
 */
export default function ExampleCreateForm({ onSubmit, isSubmitting }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: CreateExampleInput = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    if (!payload.title) {
      return;
    }

    await onSubmit(payload);

    setTitle("");
    setDescription("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-800">Create Example</h3>
      <p className="mt-1 text-sm text-slate-500">
        โครงสร้างฟอร์มแยกจาก logic เพื่อแก้ไข UI โดยไม่กระทบ data flow
      </p>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="เช่น Demo Item"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">
            Description
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="รายละเอียดเพิ่มเติม"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
