import React from "react";

interface ProductPlatform {
  platform: string;
  price: string | null;
  link: string | null;
}

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  platforms: ProductPlatform[];
}

interface Props {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const platformLabels: Record<string, string> = {
  shopee: "Shopee",
  tokopedia: "Tokopedia",
  tiktok: "TikTok",
  instagram: "Instagram",
};

const platformColors: Record<string, string> = {
  shopee: "bg-orange-500 hover:bg-orange-600",
  tokopedia: "bg-green-600 hover:bg-green-700",
  tiktok: "bg-black hover:bg-neutral-800",
  instagram: "bg-pink-500 hover:bg-pink-600",
};

const platformIcons: Record<string, string> = {
  shopee: "🛒",
  tokopedia: "🛍️",
  tiktok: "🎵",
  instagram: "📷",
};

export default function ProductList({ products, onProductClick }: Props) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <p className="text-sm">No products available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer group"
          onClick={() => onProductClick(product)}
        >
          {/* Product Item Container */}
          <div className="p-4 flex items-start gap-4">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-md group-hover:opacity-80 transition-opacity"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              {/* Product Name */}
              <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>

              {/* Product Price */}
              <p className="text-base font-bold text-neutral-900 mt-1">
                {product.price}
              </p>

              {/* Product Description */}
              <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                {product.description}
              </p>

              {/* Platforms Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {product.platforms.map((platform, idx) => (
                  <a
                    key={idx}
                    href={platform.link || "#"}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium transition-all duration-200 ${
                      platformColors[platform.platform] ||
                      "bg-neutral-500 hover:bg-neutral-600"
                    } ${!platform.link ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={
                      platform.price
                        ? `${platformLabels[platform.platform]} - ${
                            platform.price
                          }`
                        : platformLabels[platform.platform]
                    }
                  >
                    <span className="text-sm">
                      {platformIcons[platform.platform] || "🔗"}
                    </span>
                    <span>
                      {platformLabels[platform.platform] || platform.platform}
                    </span>
                    {platform.price && (
                      <span className="ml-1 text-xs opacity-90">
                        {platform.price}
                      </span>
                    )}
                  </a>
                ))}
              </div>

              {/* No Platform Available */}
              {product.platforms.length === 0 && (
                <p className="text-xs text-neutral-400 mt-3">
                  No platforms available
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
