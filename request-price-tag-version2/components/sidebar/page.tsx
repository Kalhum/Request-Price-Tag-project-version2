
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  UserRound,
  KeyRound,
  LogOut,
  CheckCircle2,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { useBranch } from "@/components/BranchProvider";
import { BRANCHES } from "@/types/branch";

export default function Sidebar() {
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");
  const { branchId, branchName, isReady, selectBranch } = useBranch();
  const filteredBranches = BRANCHES.filter((branch) => {
    const query = branchSearch.trim().toLocaleLowerCase();
    return (
      !query ||
      branch.id.toLocaleLowerCase().includes(query) ||
      branch.name.toLocaleLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (!isBranchModalOpen && !isMobileSidebarOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsBranchModalOpen(false);
      setIsMobileSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBranchModalOpen, isMobileSidebarOpen]);

  const handleLogout = () => {
    router.replace("/login");
  };

  return (
    <>
    {!isMobileSidebarOpen && (
      <button
        type="button"
        aria-label="เปิดแถบด้านข้าง"
        aria-controls="dashboard-sidebar"
        aria-expanded={false}
        onClick={() => setIsMobileSidebarOpen(true)}
        className="fixed left-3 top-2.5 z-[1001] inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white text-primary shadow-sm transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
    )}
    {isMobileSidebarOpen && (
      <button
        type="button"
        aria-label="ปิดแถบด้านข้าง"
        onClick={() => setIsMobileSidebarOpen(false)}
        className="fixed inset-0 z-[1000] bg-slate-950/50 lg:hidden"
      />
    )}
    <aside
      id="dashboard-sidebar"
      aria-label="ข้อมูลผู้ใช้และสาขา"
      className={[
        "fixed inset-y-0 left-0 z-[1001] flex h-dvh w-[min(20rem,85vw)] min-h-0 flex-col overflow-y-auto bg-ball-gradient px-[9px] py-5 text-white transition-transform duration-300 ease-in-out lg:z-40 lg:w-[20%] lg:translate-x-0",
        isMobileSidebarOpen
          ? "visible translate-x-0"
          : "invisible -translate-x-full lg:visible",
      ].join(" ")}
    >
      <button
        type="button"
        aria-label="ปิดแถบด้านข้าง"
        onClick={() => setIsMobileSidebarOpen(false)}
        className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
      {/* BRAND */}
      <div className="mb-8 text-center">
        <Image
          src="/images/logo-new.png"
          alt="Lawson Station"
          width={210}
          height={210}
          priority
          className="mx-auto h-[10.5rem] w-[10.5rem] object-contain"
        />

        <h1 className="mt-1 whitespace-nowrap text-[26px] font-bold leading-tight">
          Request Price Tags
        </h1>

        <p className="mt-1 whitespace-nowrap text-[17px] font-medium text-white/95">
          ขอป้ายราคาจากทางหลวง สวอว์สัน
        </p>
      </div>

      {/* USER INFORMATION */}
      <div
        className="
          rounded-[14px] border border-white/50
          bg-white/80 p-3.5 text-primary shadow-md
        "
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[11px] bg-primary text-white">
            <UserRound size={26} strokeWidth={2} />

            <span className="absolute -bottom-1 -right-1 h-[13px] w-[13px] rounded-full border-2 border-white bg-success" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold tracking-wide text-success">
              WELCOME
            </p>

            <p className="mt-0.5 whitespace-nowrap text-[16px] font-bold text-slate-800">
              คุณ op108
            </p>
          </div>

          <span className="whitespace-nowrap text-[13px] font-medium text-gray">
            Store Manager
          </span>
        </div>

        <div className="my-3 border-t border-white/60" />

        <button
          type="button"
          className="
            flex w-full items-center justify-center gap-2
            rounded-[9px] bg-white px-3 py-2.5
            text-[14px] font-semibold text-primary
            shadow-sm transition hover:bg-surface
          "
        >
          <KeyRound size={16} />
          เปลี่ยนรหัสผ่าน (Change Password)
        </button>
      </div>

      {/* SELECTED BRANCH */}
      <section className="mt-8">
        <h2 className="mb-2.5 text-[18px] font-bold">
          คุณกำลังเลือกสาขา
        </h2>

        <div
          className="
            mx-1 flex min-h-[46px] items-center justify-center gap-2.5
            rounded-[11px] border border-success-light
            bg-success px-3.5 py-2.5
            text-[16px] font-bold text-white
            shadow-card text-center
          "
        >
          <CheckCircle2 size={19} className="shrink-0 text-success-light" />
          <span>{isReady ? branchName : "กำลังโหลดสาขา..."}</span>
        </div>
      </section>

      {/* TOTAL BRANCH */}
      <section className="mt-10 px-2 sm:px-4">
        <h2 className="text-[18px] font-bold">เปลี่ยนสาขาที่ใช้งาน</h2>
        <p className="mb-2.5 mt-1 text-[14px] text-white/90">
          กดปุ่มด้านล่างเพื่อค้นหาและเลือกสาขา
        </p>
        <button
          type="button"
          onClick={() => {
            setBranchSearch("");
            setIsBranchModalOpen(true);
          }}
          aria-haspopup="dialog"
          className="
            flex h-[50px] w-full items-center justify-center
            rounded-[14px] bg-primary
            text-[17px] font-bold text-white shadow-md
            transition hover:opacity-90
          "
        >
          สาขาทั้งหมด {BRANCHES.length}
        </button>
      </section>

      {/* LOGOUT */}
      <div className="mt-auto px-2 sm:px-4 pb-5 pt-8">
        <Button
          onClick={handleLogout}
          variant="danger"
          size="md"
          fullWidth
          leftIcon={<LogOut size={20} />}
          className="h-[48px] rounded-[12px] text-[17px] font-bold shadow-md active:scale-[0.98]"
        >
          ออกจากระบบ
        </Button>
      </div>
    </aside>

    {/* BRANCH MODAL */}
    {isBranchModalOpen && (
      <div
        className="fixed inset-0 z-[1002] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setIsBranchModalOpen(false);
          }
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="branch-list-title"
          className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-primary px-5 py-4 text-white">
            <div>
              <h2 id="branch-list-title" className="text-lg font-bold">
                เลือกสาขา
              </h2>
              <p className="mt-0.5 text-sm text-white/80">
                สาขาที่มีในระบบ {BRANCHES.length} สาขา
              </p>
            </div>
            <button
              type="button"
              aria-label="ปิดหน้าต่างเลือกสาขา"
              onClick={() => setIsBranchModalOpen(false)}
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="p-4 pb-2">
            <label
              htmlFor="branch-modal-search"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              ค้นหาสาขาจากรหัสหรือชื่อ
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                id="branch-modal-search"
                type="search"
                value={branchSearch}
                onChange={(event) => setBranchSearch(event.target.value)}
                placeholder="พิมพ์รหัสหรือชื่อสาขา"
                className="input-default h-10 pl-9"
                autoFocus
              />
            </div>
          </div>
          <ul className="max-h-72 space-y-2 overflow-y-auto p-4 pt-2">
            {filteredBranches.map((branch) => {
              const isSelected = branch.id === branchId;
              return (
                <li key={branch.id}>
                  <button
                    type="button"
                    aria-current={isSelected ? "true" : undefined}
                    onClick={() => {
                      selectBranch(branch.id);
                      setIsBranchModalOpen(false);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-success bg-success-light/40 text-success"
                        : "border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-surface"
                    }`}
                  >
                    <span>
                      <span className="block font-semibold">{branch.name}</span>
                      <span className="mt-0.5 block text-xs text-gray">
                        รหัสสาขา {branch.id}
                      </span>
                    </span>
                    {isSelected && (
                      <CheckCircle2
                        aria-label="สาขาที่เลือกอยู่"
                        className="h-5 w-5 shrink-0"
                      />
                    )}
                  </button>
                </li>
              );
            })}
            {filteredBranches.length === 0 && (
              <li className="py-6 text-center text-sm text-gray">
                ไม่พบสาขาที่ตรงกับคำค้นหา
              </li>
            )}
          </ul>
        </section>
      </div>
    )}
    </>
  );
}
