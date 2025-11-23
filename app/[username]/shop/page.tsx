import { Metadata } from "next";
import ShopPageClient from "./shopPage";

export const metadata: Metadata = {
  title: "Shop Fashion Products",
  description:
    "Belanja produk fashion pilihan dari influencer dengan affiliate links",
  robots: { index: true, follow: true },
};

export default function ProductCatalog() {
  return <ShopPageClient />;
}
