"use client";

function headercontentBody() {
  return (
    <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <section className="rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-3 text-white shadow-sm">
        <h2 className="text-2xl font-medium">
          ส่วนของการจัดการประเภทของสินค้า
        </h2>

        <div className="container-text-body flex flex gap-2">
          <p className="mt-3 text-sm leading-6">ประเภทของสินค้ามีดังนี้:</p>

          <p className="mt-3 text-sm leading-6">C = Core SKU</p>

          <p className="mt-3 text-sm leading-6">O = Optional SKUs:</p>
        </div>
      </section>
    </section>
  );
}

export default function Homepage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f1f2f7] px-6 py-5">
      {headercontentBody()}
    </div>
  );
}
