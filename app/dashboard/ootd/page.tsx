// app/(dashboard)/ootd/DashboardOotd.tsx
import { createSupabaseServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardOotdClient, { OotdRow } from "../component/DashboardOotdClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type Meta = { total: number; page: number; pageSize: number };

async function getInfluencerIdByAuthUserId(authUserId: string) {
  // ambil local user jika diperlukan (meniru struktur Anda)
  const uRes = await fetch(`${API_BASE}/api/users/${authUserId}`);
  if (!uRes.ok) return null;
  const uJson = await uRes.json();
  const localUser = uJson?.data;
  if (!localUser?.id) return null;

  const iRes = await fetch(
    `${API_BASE}/api/influencers/by-user/${authUserId}`,
    {
      cache: "no-store",
    }
  );
  if (!iRes.ok) return null;
  const iJson = await iRes.json();
  return iJson?.data?.id || null;
}

async function fetchOotdsServer(
  influencerId: string,
  opts: { page: number; pageSize: number; q?: string }
) {
  const qs = new URLSearchParams();
  qs.set("influencerId", influencerId);
  if (opts.q) qs.set("q", opts.q);
  qs.set("page", String(opts.page));
  qs.set("pageSize", String(opts.pageSize));

  const res = await fetch(`${API_BASE}/api/ootds?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return {
      items: [] as OotdRow[],
      meta: { total: 0, page: opts.page, pageSize: opts.pageSize } as Meta,
    };
  }

  const json = await res.json();
  // map minimum fields yang dibutuhkan DashboardOotdClient; biarkan client-side shaping lengkap
  const items: OotdRow[] = (json.data || []).map((o: any) => ({
    id: String(o.id),
    influencerId: String(o.influencerId),
    title: o.title,
    description: o.description ?? null,
    image: o.image,
    mood: o.mood ?? null,
    isPublic: Boolean(o.isPublic),
    viewCount: Number(o.viewCount ?? 0),
    likeCount: Number(o.likeCount ?? 0),
    createdAt: o.createdAt
      ? new Date(o.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: o.updatedAt
      ? new Date(o.updatedAt).toISOString()
      : new Date().toISOString(),
    ootdProducts: Array.isArray(o.ootdProducts)
      ? o.ootdProducts.map((op: any) => ({
          id: String(op.id),
          productId: String(op.productId),
          note: op.note ?? null,
          position: op.position != null ? Number(op.position) : null,
          product: {
            id: String(op.product?.id ?? ""),
            name: String(op.product?.name ?? ""),
            image: op.product?.image ?? null,
            price: op.product?.price != null ? Number(op.product.price) : null,
            platforms: Array.isArray(op.product?.platforms)
              ? op.product.platforms.map((pl: any) => ({
                  id: String(pl.id),
                  productId: String(pl.productId),
                  platform: String(pl.platform),
                  price: pl.price != null ? Number(pl.price) : null,
                  link: pl.link ?? null,
                  lastUpdated: pl.lastUpdated
                    ? new Date(pl.lastUpdated).toISOString()
                    : null,
                }))
              : [],
          },
        }))
      : [],
  }));

  const meta: Meta = json.meta || {
    total: items.length,
    page: opts.page,
    pageSize: opts.pageSize,
  };
  return { items, meta };
}

export default async function DashboardOotd({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; q?: string }>;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const influencerId = await getInfluencerIdByAuthUserId(user.id);
  if (!influencerId) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const page = Math.max(Number(params.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(params.pageSize || 10), 1), 100);
  const q = params.q?.trim() || undefined;

  const { items, meta } = await fetchOotdsServer(influencerId, {
    page,
    pageSize,
    q,
  });

  return (
    <DashboardOotdClient
      userId={user.id}
      apiBaseUrl={API_BASE}
      initialItems={items}
      initialMeta={meta}
      initialQuery={q || ""}
    />
  );
}
