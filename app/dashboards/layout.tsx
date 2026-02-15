import { useState } from "react";
import { createSupabaseServer } from "../utils/supabase/server";
import SidebarNav from "./component/Sidebar";
import { Menu, X } from "lucide-react";
import NavigationProgress from "./component/NavigationProgress";
import DashboardShell from "./component/DashboardClient";

export const revalidate = 3600; // Cache 1 jam

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();
  if (!user) return null;

  return (
    <>
      <NavigationProgress />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
