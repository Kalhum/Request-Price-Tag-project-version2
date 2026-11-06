export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-8 shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
        <h1 className="mt-6 text-center text-xl font-semibold text-slate-800">
          กำลังโหลดข้อมูล...
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          กรุณารอสักครู่ ระบบกำลังเตรียมข้อมูลให้คุณ
        </p>
      </section>
    </main>
  );
}
