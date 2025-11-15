// app/onboarding/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/app/utils/supabase/server";
import InfluencerForm from "./InfluencerForm";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function fetchInfluencerByUserId(userId: string) {
  try {
    const res = await fetch(`${API_BASE}/api/influencers/by-user/${userId}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export default async function OnboardingPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user dari backend
  const userLookup = await fetch(`${API_BASE}/api/users/${user.id}`, {
    cache: "no-store",
  });

  if (userLookup.status === 404) {
    redirect("/login?error=not_registered");
  }

  const userJson = await userLookup.json();
  const localUser = userJson.data;

  const influencer = await fetchInfluencerByUserId(localUser.authUserId);
  if (influencer) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-orange-50">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neutral-200 rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
                <span className="text-xl">✨</span>
                <span className="text-sm font-semibold text-orange-700">
                  Mulai Perjalananmu
                </span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3 leading-tight">
                Lengkapi Profil <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">
                  Influencer
                </span>
              </h1>
              <p className="text-neutral-600 text-sm sm:text-base max-w-md mx-auto">
                Isi informasi berikut untuk mengakses dashboard dan mulai
                berbagi OOTD Anda dengan komunitas.
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg backdrop-blur-sm border border-neutral-200">
              <InfluencerForm userId={localUser.id} />
            </div>
          </div>
        </div>
      </div>
      {/* Toast Container - Positioned Outside of Form Container */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-50 space-y-3 max-w-xs sm:max-w-sm pointer-events-none" />
    </div>
  );
}
