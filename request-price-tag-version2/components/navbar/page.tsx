"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FolderOpen,
  Home,
  Menu,
  PlusCircle,
  Printer,
  X,
} from "lucide-react";
import { useState } from "react";

// แก้ href ให้ตรงกับ route ในโปรเจกต์ของคุณ
const NAV_ITEMS = [
  { href: "/home", label: "home", icon: Home },
  { href: "/manageCategory", label: "Manage Category", icon: FolderOpen },
  { href: "/createRequest", label: "Create Request", icon: PlusCircle },
  { href: "/printtingRequest", label: "Printting Request", icon: Printer },
  { href: "/printingCategory", label: "Printting Category", icon: Printer },
  { href: "/report", label: "Report and Reprint", icon: BarChart3 },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-999 flex w-full items-center justify-center bg-white shadow-sm">
      <button
        type="button"
        aria-label={isMenuOpen ? "ปิดเมนูหลัก" : "เปิดเมนูหลัก"}
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="ml-auto mr-4 inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#0B4C8C] transition-colors hover:bg-[#E4ECF8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B4C8C] lg:hidden"
      >
        {isMenuOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      <nav
        aria-label="เมนูหลัก"
        className="hidden flex-1 items-center justify-center gap-2 overflow-x-auto px-6 py-3 lg:flex"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                "inline-flex h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 text-[15px] font-semibold transition-colors",
                active
                  ? "bg-[#0B4C8C] text-white"
                  : "text-[#0B4C8C] hover:bg-[#E4ECF8]",
              ].join(" ")}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <nav
        id="primary-navigation"
        aria-label="เมนูหลัก"
        hidden={!isMenuOpen}
        className="absolute left-0 right-0 top-full border-t border-slate-100 bg-white p-3 shadow-lg lg:hidden"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={() => setIsMenuOpen(false)}
              className={[
                "flex min-h-11 items-center gap-3 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-[#0B4C8C] text-white"
                  : "text-[#0B4C8C] hover:bg-[#E4ECF8]",
              ].join(" ")}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
