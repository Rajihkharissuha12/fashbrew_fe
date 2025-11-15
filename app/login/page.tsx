"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "../utils/supabase/client";

export default function LoginPage() {
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get("next") || "/dashboard"; // default tujuan

  const signInWithGoogle = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { data, error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      alert("Login gagal: " + error.message);
      return;
    }
    // Pada PKCE flow, Supabase akan redirect ke data.url; tidak perlu router.push di sini
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Masuk ke Dashboard</h1>
        <p className="text-gray-600 text-sm">
          Gunakan akun Google untuk melanjutkan
        </p>
        <button
          onClick={signInWithGoogle}
          className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
