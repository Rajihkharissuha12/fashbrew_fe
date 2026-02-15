import { redirect } from "next/navigation";
import { createSupabaseServer } from "../utils/supabase/server";

export default async function DashboardHome() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Overview</h1>
      <p>Selamat datang di Dashboard Admin.</p>
    </div>
  );
}
