import type { ReactNode } from "react";
import Navbar from "../../components/navbar/page";
import Sidebar from "../../components/sidebar/page";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
