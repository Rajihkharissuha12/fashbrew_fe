import { Check, Copy, ExternalLink, Tag, X, Package } from "lucide-react";
import { useState } from "react";

export default function ProductDetailModal({
  product,
  onClose,
}: {
  product: any;
  onClose: () => void;
}) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyToClipboard = async (link: string, platformId: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedLink(platformId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Clean & Minimal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Detail Produk
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Harga:</span>
                  <span className="text-lg font-bold text-gray-900">
                    Rp {product.price?.toLocaleString("id-ID") || "-"}
                  </span>
                </div>
                {product.clicks !== undefined && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>•</span>
                    <span>{product.clicks} klik</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content - Clean Layout */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Image */}
          {product.image ? (
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-80 object-cover"
              />
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-80 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm text-gray-500">Tidak ada gambar</p>
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Deskripsi
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            {product.category && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Kategori
                </h3>
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
                  {product.category}
                </span>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: any, idx: any) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Platforms */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Platform Affiliate
              </h3>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                {product.platforms.length}
              </span>
            </div>

            {product.platforms.length > 0 ? (
              <div className="space-y-3 mb-10">
                {product.platforms.map((platform: any, index: number) => (
                  <div
                    key={platform.id}
                    className="relative bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    {/* Platform number */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900">
                          {platform.platform}
                        </span>
                      </div>
                      {platform.price && (
                        <span className="text-base font-bold text-gray-900">
                          Rp {platform.price.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>

                    {platform.link && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={platform.link}
                          readOnly
                          className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-600 font-mono"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              copyToClipboard(platform.link!, platform.id)
                            }
                            className="flex-1 sm:flex-none px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                            title="Copy link"
                          >
                            {copiedLink === platform.id ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-green-600">
                                  Tersalin
                                </span>
                              </div>
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          <a
                            href={platform.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                            title="Buka link"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-xs font-medium">Buka</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Belum ada platform affiliate
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors text-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
