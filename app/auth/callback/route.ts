import { createSupabaseServer } from "@/app/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const redirect =
    url.searchParams.get("next") ||
    url.searchParams.get("redirect") ||
    "/onboarding";
  const code = url.searchParams.get("code");
  const supabase = await createSupabaseServer();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(req.url);
    if (error)
      return NextResponse.redirect(new URL("/login?error=oauth", req.url));
  } else {
    await supabase.auth.getUser();
  }

  // Ambil user dari server session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const authUserId = user.id;
    const lastLogin = new Date().toISOString();

    // Panggil backend untuk cek user (by-auth), lalu create/patch
    try {
      const base =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
      const checkRes = await fetch(`${base}/api/users/${authUserId}`, {
        method: "GET",
      });
      if (checkRes.status === 404) {
        await fetch(`${base}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authUserId, role: "influencer", lastLogin }),
        });
      } else if (checkRes.ok) {
        const payload = await checkRes.json();
        const userId = payload?.data?.id;
        if (userId) {
          await fetch(`${base}/api/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lastLogin }),
          });
        }
      }
    } catch {
      // Jangan blokir redirect meski sync gagal
    }
  }

  return NextResponse.redirect(new URL(redirect, req.url));
}
