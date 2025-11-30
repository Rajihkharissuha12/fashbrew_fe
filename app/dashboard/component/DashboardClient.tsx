"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import SidebarNav from "./Sidebar";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // Auto-close sidebar pada mobile ketika route berubah
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false); // Reset state di desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
      {/* Overlay untuk mobile/tablet */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <SidebarNav open={open} setOpen={setOpen} />

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Header - Sticky */}
        <header className="h-14 border-b bg-white dark:bg-zinc-900 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle sidebar"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Dashboard
            </span>
          </div>

          {/* Optional: User Profile atau Actions */}
          <div className="flex items-center gap-2">
            {/* Tambahkan user menu atau notifications di sini */}
          </div>
        </header>

        {/* Page Content - Responsive Padding */}
        <main className="p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
