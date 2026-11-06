"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderOpen, Home, PlusCircle, Printer } from "lucide-react";

// แก้ href ให้ตรงกับ route ในโปรเจกต์ของคุณ
const NAV_ITEMS = [
  { href: "/home", label: "home", icon: Home },
  { href: "/manageCategory", label: "Manage Category", icon: FolderOpen },
  { href: "/create-request", label: "Create Request", icon: PlusCircle },
  { href: "/printing-request", label: "Printting Request", icon: Printer },
  { href: "/printing-category", label: "Printting Category", icon: Printer },
  { href: "/report", label: "Report and Reprint", icon: BarChart3 },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="flex w-full items-stretch bg-white shadow-sm">
      {/* เมนู: เลื่อนแนวนอนได้เมื่อจอแคบ */}
      <nav
        aria-label="เมนูหลัก"
        className="flex flex-1 items-center justify-center gap-2 overflow-x-auto px-6 py-3"
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
    </header>
  );
}
