// app/dashboard/profile/page.tsx (Server Component - NO "use client")
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/app/utils/supabase/server";
import ProfileClient from "./profileClient";

export default async function ProfilePage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pass userId ke Client Component
  return <ProfileClient userId={user.id} />;
}
