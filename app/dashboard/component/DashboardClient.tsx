"use client";

import Link from "next/link";
import { ReactNode, useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Image,
  Store,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users2,
} from "lucide-react";
import { supabaseBrowser } from "../../utils/supabase/client"; // ✅ Import yang sudah ada

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    href: "/dashboard/ootds",
    label: "OOTD",
    icon: <Image className="w-5 h-5" />,
  },
  {
    href: "/dashboard/shops",
    label: "Shops",
    icon: <Store className="w-5 h-5" />,
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: <Users2 className="w-5 h-5" />,
  },
];

interface DashboardShellProps {
  children: ReactNode;
  user: any; // User dari Supabase
}

export default function DashboardShell({
  children,
  user,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  // ✅ Handle logout dengan supabaseBrowser
  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm("Apakah Anda yakin ingin logout?");
    if (!confirmed) return;

    try {
      setIsLoggingOut(true);

      const { error } = await supabaseBrowser.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        alert("Gagal logout. Silakan coba lagi.");
        return;
      }

      // Redirect to login
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Terjadi kesalahan saat logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user display info
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const userAvatar = user?.user_metadata?.avatar_url || null;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out flex flex-col
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
          w-72
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-5 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
              {userInitial}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-gray-900 truncate">
                  Admin Dashboard
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  {userName} • Control Panel
                </p>
              </div>
            )}
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Collapse button for desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            // ✅ Fix: Exact match untuk base route, startsWith untuk child routes
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
          flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
          transition-all duration-200 relative group
          ${
            active
              ? "bg-gray-100 text-gray-900 shadow-sm"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }
          ${isCollapsed ? "lg:justify-center lg:px-0" : ""}
        `}
              >
                <span
                  className={`
            flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0
            transition-colors
            ${
              active
                ? "bg-gray-900 text-white"
                : "text-gray-500 group-hover:text-gray-700 group-hover:bg-gray-100"
            }
          `}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {active && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-gray-900 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - User Profile with Dropdown */}
        {!isCollapsed && (
          <div
            className="p-4 border-t border-gray-200 relative"
            ref={profileRef}
          >
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              aria-label="User menu"
            >
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-gray-600">
                    {userInitial}
                  </span>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Collapsed Footer */}
        {isCollapsed && (
          <div
            className="p-3 border-t border-gray-200 flex justify-center"
            ref={profileRef}
          >
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="relative p-1 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="User menu"
            >
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-gray-600">
                    {userInitial}
                  </span>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute bottom-16 left-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">Dashboard</h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
