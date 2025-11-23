import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FashBrew - Platform Catalog OOTD & Product Affiliate",
    short_name: "FashBrew",
    description: "Platform catalog OOTD dan product affiliate untuk influencer",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FF6B00", // Sesuaikan dengan brand color
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
