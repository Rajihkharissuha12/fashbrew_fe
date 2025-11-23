import type { Metadata } from "next";
import HomeClient from "./pageClient";

export const metadata: Metadata = {
  title: "Platform Catalog OOTD & Product Affiliate Influencer",
  description:
    "Temukan inspirasi outfit dari fashion influencer terpercaya. Jelajahi catalog OOTD, lookbook, dan belanja produk fashion pilihan dengan affiliate links.",
  keywords: [
    "catalog OOTD",
    "fashion influencer",
    "product affiliate",
    "lookbook fashion",
    "inspirasi outfit",
  ],
  openGraph: {
    title: "FashBrew - Platform Catalog OOTD & Product Affiliate",
    description:
      "Platform untuk fashion influencer showcase catalog OOTD dan produk affiliate.",
    url: "https://fashbreew.com",
  },
};

export default function Home() {
  return <HomeClient />;
}
