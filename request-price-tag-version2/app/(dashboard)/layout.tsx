import type { ReactNode } from "react";
import { BranchProvider } from "../../components/BranchProvider";
import Navbar from "../../components/navbar/page";
import Sidebar from "../../components/sidebar/page";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BranchProvider>
      <div className="flex h-dvh overflow-hidden bg-surface">
        <Sidebar />

        <div className="ml-0 flex h-full min-w-0 flex-1 flex-col lg:ml-[20%]">
          <Navbar />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {children}
          </main>
        </div>
      </div>
    </BranchProvider>
  );
}
