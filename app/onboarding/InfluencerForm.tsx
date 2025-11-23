"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import Toast from "./component/Toast";
import Input from "./component/Input";
import Textarea from "./component/Textarea";
import ReactDOM from "react-dom";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type Props = { userId: string };

interface FormErrors {
  name?: string;
  handle?: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  socialLinks?: string;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// Validation functions
const validateName = (value: string): string | null => {
  if (!value.trim()) return "Nama harus diisi";
  if (value.length < 2) return "Nama minimal 2 karakter";
  if (value.length > 100) return "Nama maksimal 100 karakter";
  if (!/^[a-zA-Z0-9\s\-]+$/.test(value)) {
    return "Nama hanya boleh mengandung huruf, angka, spasi, dan tanda hubung";
  }
  return null;
};

const validateHandle = (value: string): string | null => {
  if (!value.trim()) return "Handle harus diisi";
  if (value.length < 3) return "Handle minimal 3 karakter";
  if (value.length > 50) return "Handle maksimal 50 karakter";
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    return "Handle hanya boleh mengandung huruf, angka, underscore (_), dan tanda hubung (-)";
  }
  if (/^[-_]|[-_]$/.test(value)) {
    return "Handle tidak boleh dimulai atau diakhiri dengan underscore atau tanda hubung";
  }
  return null;
};

const validateBio = (value: string): string | null => {
  if (value.length > 500) return "Bio maksimal 500 karakter";
  if (/<|>|{|}|\[|\]|`/.test(value)) {
    return "Bio mengandung karakter yang tidak diperbolehkan";
  }
  return null;
};

const validateUrl = (value: string, fieldName: string): string | null => {
  if (!value) return null; // Optional field
  try {
    new URL(value);
    return null;
  } catch {
    return `${fieldName} harus berupa URL yang valid (mis. https://...)`;
  }
};

export default function InfluencerForm({ userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [socialLinksText, setSocialLinksText] = useState("");
  const [isActive, setIsActive] = useState(true); // Default active

  // Validation states
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Toast states
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Helper functions
  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const validateField = useCallback((fieldName: string, value: string) => {
    let error: string | null = null;

    switch (fieldName) {
      case "name":
        error = validateName(value);
        break;
      case "handle":
        error = validateHandle(value);
        break;
      case "bio":
        error = validateBio(value);
        break;
      case "avatar":
        error = validateUrl(value, "Avatar URL");
        break;
      case "banner":
        error = validateUrl(value, "Banner URL");
        break;
      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    return error === null;
  }, []);

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case "name":
          setName(value);
          break;
        case "handle":
          setHandle(value);
          break;
        case "bio":
          setBio(value);
          break;
        case "avatar":
          setAvatar(value);
          break;
        case "banner":
          setBanner(value);
          break;
        case "socialLinks":
          setSocialLinksText(value);
          break;
      }

      // Validate on change jika field sudah pernah disentuh
      if (touched[field]) {
        validateField(field, value);
      }
    },
    [touched, validateField]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Mark all fields as touched
    setTouched({
      name: true,
      handle: true,
      bio: true,
      avatar: true,
      banner: true,
      socialLinks: true,
    });

    // Validate all fields
    const nameError = validateName(name);
    const handleError = validateHandle(handle);
    const bioError = validateBio(bio);
    const avatarError = validateUrl(avatar, "Avatar URL");
    const bannerError = validateUrl(banner, "Banner URL");

    setErrors({
      name: nameError ?? undefined,
      handle: handleError ?? undefined,
      bio: bioError ?? undefined,
      avatar: avatarError ?? undefined,
      banner: bannerError ?? undefined,
    });

    // Stop jika ada error
    if (nameError || handleError || bioError || avatarError || bannerError) {
      addToast("Silakan periksa kembali form Anda", "error");
      return;
    }

    const payload = {
      userId,
      name,
      handle,
      bio: bio || undefined,
      avatar: avatar || undefined,
      banner: banner || undefined,
      socialLinks: socialLinksText || undefined,
      isActive, // Tambahkan isActive ke payload
    };

    console.log("Payload yang dikirim:", payload);

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/influencers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        addToast(msg || "Gagal menyimpan data influencer", "error");
        return;
      }

      addToast(
        "Profil berhasil disimpan! Mengalihkan ke dashboard...",
        "success"
      );
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      addToast("Terjadi kesalahan. Silakan coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    !errors.name &&
    !errors.handle &&
    !errors.bio &&
    !errors.avatar &&
    !errors.banner &&
    !errors.socialLinks &&
    name &&
    handle;

  return (
    <>
      {/* Render toasts ke portal di luar form */}
      {typeof document !== "undefined" &&
        toasts.length > 0 &&
        ReactDOM.createPortal(
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-50 space-y-3 max-w-xs sm:max-w-sm pointer-events-none">
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <Toast
                  type={toast.type}
                  message={toast.message}
                  onClose={() => removeToast(toast.id)}
                />
              </div>
            ))}
          </div>,
          document.body
        )}

      <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-orange-500 transition-all duration-300"
                style={{
                  width: `${
                    (((name && handle ? 50 : 0) +
                      (bio ? 10 : 0) +
                      (avatar ? 15 : 0) +
                      (banner ? 15 : 0) +
                      (socialLinksText ? 10 : 0)) /
                      100) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Required Fields Section */}
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full text-orange-600 text-sm font-bold">
                1
              </span>
              Informasi Dasar
            </h3>

            <div className="space-y-4">
              {/* Name Input */}
              <Input
                label="Nama Lengkap"
                placeholder="Contoh: Rajih Kharissuba"
                value={name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                error={touched.name ? errors.name : undefined}
                required
                hint="Hanya huruf, angka, spasi, dan tanda hubung"
                maxLength={100}
              />

              {/* Handle Input */}
              <Input
                label="Handle/Username"
                placeholder="Contoh: advance_ootd atau niko"
                value={handle}
                onChange={(e) => handleChange("handle", e.target.value)}
                onBlur={() => handleBlur("handle")}
                error={touched.handle ? errors.handle : undefined}
                required
                hint="Unik dan mudah diingat. Hanya huruf, angka, underscore, dan tanda hubung"
                maxLength={50}
              />
            </div>
          </div>

          {/* Optional Fields Section */}
          <div className="pt-2 border-t border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-neutral-100 rounded-full text-neutral-600 text-sm font-bold">
                2
              </span>
              Informasi Tambahan (Opsional)
            </h3>

            <div className="space-y-4">
              {/* Bio Input */}
              <Textarea
                label="Bio/Deskripsi"
                placeholder="Tuliskan deskripsi singkat tentang Anda dan gaya fashion Anda"
                value={bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                onBlur={() => handleBlur("bio")}
                error={touched.bio ? errors.bio : undefined}
                hint="Maksimal 500 karakter"
                maxLength={500}
                rows={4}
              />

              {/* Avatar & Banner URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Avatar URL"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatar}
                  onChange={(e) => handleChange("avatar", e.target.value)}
                  onBlur={() => handleBlur("avatar")}
                  error={touched.avatar ? errors.avatar : undefined}
                  hint="Format HTTPS"
                  type="url"
                />

                <Input
                  label="Banner URL"
                  placeholder="https://example.com/banner.jpg"
                  value={banner}
                  onChange={(e) => handleChange("banner", e.target.value)}
                  onBlur={() => handleBlur("banner")}
                  error={touched.banner ? errors.banner : undefined}
                  hint="Format HTTPS"
                  type="url"
                />
              </div>

              {/* Social Links Preview Toggle */}
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-neutral-900">
                  Social Links (JSON)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-2 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Sembunyikan Contoh
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Lihat Contoh
                    </>
                  )}
                </button>
              </div>

              {/* Social Links Preview */}
              {showPreview && (
                <div className="bg-neutral-50 rounded-lg p-4 mb-3 border border-neutral-200">
                  <p className="text-xs font-mono text-neutral-600 mb-2">
                    Contoh format:
                  </p>
                  <pre className="text-xs bg-white rounded p-3 overflow-x-auto border border-neutral-200">
                    {`{
  "instagram": "https://instagram.com/username",
  "tiktok": "https://tiktok.com/@username",
  "twitter": "https://twitter.com/username"
}`}
                  </pre>
                </div>
              )}

              <Textarea
                label="Social Links"
                placeholder="https://www.instagram.com/username"
                value={socialLinksText}
                onChange={(e) => handleChange("socialLinks", e.target.value)}
                onBlur={() => handleBlur("socialLinks")}
                error={touched.socialLinks ? errors.socialLinks : undefined}
                hint="Format JSON. Biarkan kosong jika tidak ada."
                rows={4}
                monospace
              />
            </div>
          </div>

          {/* Status Section */}
          <div className="pt-2 border-t border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-neutral-100 rounded-full text-neutral-600 text-sm font-bold">
                3
              </span>
              Status Akun
            </h3>

            <div className="flex items-center gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded-md border-2 border-neutral-300 text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer"
              />
              <label
                htmlFor="isActive"
                className="flex-1 cursor-pointer select-none"
              >
                <p className="text-sm font-semibold text-neutral-900">
                  Aktifkan Akun Influencer
                </p>
                <p className="text-xs text-neutral-600 mt-1">
                  Akun akan langsung aktif dan dapat diakses oleh pengguna lain
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-6 border-t border-neutral-200">
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-3 rounded-lg text-neutral-700 bg-neutral-100 hover:bg-neutral-200 font-medium transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Batalkan
          </button>
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan & Lanjut</span>
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
