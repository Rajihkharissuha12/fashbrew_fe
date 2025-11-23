"use client";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "../utils/supabase/server";

export default function DashboardPageClient({ user }: { user: any }) {
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
