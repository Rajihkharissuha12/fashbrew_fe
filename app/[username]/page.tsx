import type { Metadata } from "next";
import InfluencerClient from "./influencerClient";

export const metadata: Metadata = {
  title: "Temukan Kafe Aesthetic di Jember",
  description:
    "Jelajahi kafe-kafe aesthetic di Jember dengan FashBrew. Temukan spot foto instagramable, menu signature, dan rekomendasi outfit untuk OOTD kamu.",
  keywords: [
    "kafe jember",
    "coffee shop jember",
    "tempat nongkrong jember",
    "kafe aesthetic",
    "spot foto instagramable",
    "rekomendasi kafe",
    "cafe aesthetic jember",
  ],
  openGraph: {
    title: "FashBrew - Temukan Kafe Aesthetic di Jember",
    description:
      "Jelajahi kafe-kafe aesthetic di Jember. Temukan spot foto instagramable, menu signature, dan rekomendasi outfit untuk kafe hopping.",
    url: "https://fashbreew.com/cafe",
    images: [
      {
        url: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751275238/fashbrew/Tangkapan_Layar_2025-06-30_pukul_16.20.13_bkunod.png",
        width: 1200,
        height: 630,
        alt: "Kafe Aesthetic di Jember",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FashBrew - Temukan Kafe Aesthetic di Jember",
    description:
      "Jelajahi kafe-kafe aesthetic di Jember. Spot foto instagramable dan menu signature.",
  },
  alternates: {
    canonical: "https://fashbreew.com/cafe",
  },
};

export default function InfluencerPage() {
  return <InfluencerClient />;
}
