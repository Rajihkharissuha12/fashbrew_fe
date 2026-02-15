import OotdDetailClient from "../../component/DetailOotdClient";

// page.tsx (BENAR)
export default async function OotdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params sebelum menggunakan
  const { id } = await params;

  return (
    <OotdDetailClient
      ootdId={id}
      apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL}
    />
  );
}
