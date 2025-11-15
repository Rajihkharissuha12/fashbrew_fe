"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import SidebarNav from "./Sidebar";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-gray-100 flex">
      {/* Sidebar */}
      <SidebarNav open={open} setOpen={setOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:ml-64">
        {/* Header */}
        <header className="h-14 border-b bg-white dark:bg-zinc-900 flex items-center justify-between px-4 sticky top-0 z-30">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Dashboard
          </span>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
