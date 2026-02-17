import { Suspense } from "react";
import ShopsList from "./shopsclient";
import { createSupabaseServer } from "@/app/utils/supabase/server";

export default async function UsersPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please login to continue</p>
      </div>
    );
  }

  // Get influencer ID by user ID
  const { data: influencerId, error } = await supabase.rpc(
    "get_influencer_id_by_auth_user_id",
    { p_auth_user_id: user.id },
  );
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopsList userId={influencerId || ""} />
    </Suspense>
  );
}
