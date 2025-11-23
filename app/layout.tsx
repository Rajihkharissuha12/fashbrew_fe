import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import StructuredData from "./[username]/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fashbreew.com"),
  title: {
    default: "FashBrew - Platform Catalog OOTD & Product Affiliate Influencer",
    template: "%s | FashBrew",
  },
  description:
    "Platform catalog OOTD dan product affiliate untuk fashion influencer Indonesia. Temukan inspirasi outfit, lookbook, dan produk fashion pilihan dari influencer terpercaya.",
  keywords: [
    "catalog OOTD",
    "fashion influencer platform",
    "product affiliate",
    "influencer catalog",
    "fashion lookbook",
    "OOTD inspiration",
    "fashion products",
    "influencer shop",
  ],
  authors: [{ name: "FashBrew Team" }],
  openGraph: {
    title: "FashBrew - Platform Catalog OOTD & Product Affiliate Influencer",
    description:
      "Platform catalog OOTD dan product affiliate untuk fashion influencer. Temukan inspirasi outfit dan produk fashion pilihan.",
    url: "https://fashbreew.com",
    siteName: "FashBrew",
    images: [
      {
        url: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751275238/fashbrew/Tangkapan_Layar_2025-06-30_pukul_16.20.13_bkunod.png",
        width: 1200,
        height: 630,
        alt: "FashBrew - Platform Catalog Influencer",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FashBrew - Platform Catalog OOTD & Product Affiliate",
    description:
      "Platform catalog OOTD dan product affiliate untuk fashion influencer Indonesia.",
    images: [
      "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751275238/fashbrew/Tangkapan_Layar_2025-06-30_pukul_16.20.13_bkunod.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <StructuredData
          type="website"
          data={{
            name: "FashBrew",
            url: "https://fashbreew.com",
            description:
              "Platform catalog OOTD dan product affiliate untuk fashion influencer",
          }}
        />
        <StructuredData
          type="organization"
          data={{
            name: "FashBrew",
            url: "https://fashbreew.com",
            logo: "https://fashbreew.com/logo.png",
            socialLinks: [
              "https://instagram.com/fashbrew",
              "https://twitter.com/fashbrew",
            ],
          }}
        />
        <link
          rel="icon"
          href="https://res.cloudinary.com/dvuza2lpc/image/upload/fashbrew/favicon.png"
        />
        <link rel="canonical" href="https://fashbreew.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
