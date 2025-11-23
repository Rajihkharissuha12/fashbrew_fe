"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import clsx from "clsx";
import {
  LogOut,
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  User,
} from "lucide-react";

interface SidebarNavProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  match: "exact" | "startsWith";
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    match: "exact",
  },
  { href: "/dashboard/ootd", label: "OOTD", icon: Shirt, match: "startsWith" },
  {
    href: "/dashboard/product",
    label: "Product",
    icon: ShoppingBag,
    match: "startsWith",
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: User, // Ikon User dari lucide-react
    match: "startsWith",
  },
];

export default function SidebarNav({ open, setOpen }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setOpen(false), [pathname, setOpen]);

  const isActive = (item: NavItem) =>
    item.match === "exact"
      ? pathname === item.href
      : pathname.startsWith(item.href);

  const SidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b font-semibold">
        Admin
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-gray-900 text-white dark:bg-zinc-800"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-800/60"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t dark:border-zinc-800">
        <button
          onClick={() => (window.location.href = "/login")}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-200 transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 h-screen border-r bg-white dark:bg-zinc-950 dark:border-zinc-800 fixed left-0 top-0">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <div
        className={clsx(
          "fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-in-out",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        <aside
          className={clsx(
            "absolute left-0 top-0 h-full w-[80%] sm:w-64 bg-white dark:bg-zinc-950 shadow-lg transform transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {SidebarContent}
        </aside>
      </div>
    </>
  );
}
