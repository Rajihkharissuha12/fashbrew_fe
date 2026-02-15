// app/dashboard/product/page.tsx
import { Suspense } from "react";
import { createSupabaseServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import ProductLoading from "./loading";
import DashboardProductClient from "../component/DashboardProductClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function getInfluencerId(userId: string) {
  const [userRes, influencerRes] = await Promise.all([
    fetch(`${API_BASE}/api/users/${userId}`),
    fetch(`${API_BASE}/api/influencers/by-user/${userId}`, {
      cache: "no-store",
    }),
  ]);

  if (!userRes.ok || !influencerRes.ok) return null;
  const influencerJson = await influencerRes.json();
  return influencerJson?.data?.id || null;
}

async function fetchProducts(
  userId: string,
  opts: { page: number; pageSize: number; q?: string }
) {
  const qs = new URLSearchParams({
    userId,
    page: String(opts.page),
    pageSize: String(opts.pageSize),
    ...(opts.q ? { q: opts.q } : {}),
  });

  const res = await fetch(`${API_BASE}/api/products?${qs}`, {
    cache: "no-store",
  });
  if (!res.ok)
    return {
      items: [],
      meta: { total: 0, page: opts.page, pageSize: opts.pageSize },
    };

  const { data = [], meta } = await res.json();
  return { items: data, meta };
}

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; q?: string }>;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const influencerId = await getInfluencerId(user.id);
  if (!influencerId) redirect("/onboarding");

  const params = await searchParams;
  const page = Math.max(Number(params.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(params.pageSize || 12), 1), 100);
  const q = params.q?.trim();

  return (
    <Suspense fallback={<ProductLoading />}>
      <DashboardProductClient
        userId={user.id}
        initialPage={page}
        initialPageSize={pageSize}
        initialQuery={q || ""}
        apiBaseUrl={API_BASE}
      />
    </Suspense>
  );
}
