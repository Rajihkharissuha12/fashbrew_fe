import { Metadata } from "next";
import DashboardPageClient from "./dashboardPage";
import { createSupabaseServer } from "../utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: true },
};

export default async function DashboardHome() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  // User sudah resolved, pas langsung ke client component
  return <DashboardPageClient user={user} />;
}
