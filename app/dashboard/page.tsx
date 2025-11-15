import { redirect } from "next/navigation";
import { createSupabaseServer } from "../utils/supabase/server";

export default async function DashboardHome() {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  if (!user) {
    console.log("LOGIN");
    // arahkan ke halaman login (ganti path sesuai routing Anda)
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  return (
    <section className="text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        Selamat datang, {user.email}
      </p>
      {/* Konten dashboard lain di sini */}
    </section>
  );
}
