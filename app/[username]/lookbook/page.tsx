// app/lookbook/page.tsx (server, jangan pakai "use client")
import { Metadata } from "next";
import LookbookPage from "./lookbookpage";

export const metadata: Metadata = {
  title: "Fashion Lookbook",
  description: "Koleksi lookbook dan inspirasi outfit dari influencer",
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LookbookPage />;
}
