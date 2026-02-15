import { redirect } from "next/navigation";
import { createSupabaseServer } from "../utils/supabase/server";
import NavigationProgress from "../dashboards/component/NavigationProgress";
import DashboardShell from "./component/DashboardClient";

export const revalidate = 0; // Disable cache untuk auth check

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();

  // Check authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (error || !user) {
    redirect("/login"); // atau "/auth/login" sesuai route kamu
  }

  return (
    <>
      <NavigationProgress />
      <DashboardShell user={user}>{children}</DashboardShell>
    </>
  );
}
