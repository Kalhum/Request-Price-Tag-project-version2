import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-amber-600">404 Not Found</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          ไม่พบหน้าที่คุณต้องการ
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          ลิงก์อาจไม่ถูกต้อง หรือข้อมูลที่คุณกำลังค้นหาอาจถูกย้ายออกไปแล้ว
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
        >
          กลับหน้าหลัก
        </Link>
      </section>
    </main>
  );
}
