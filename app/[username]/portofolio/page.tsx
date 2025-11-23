"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  ElementType,
  ReactNode,
} from "react";
import {
  Search,
  Filter,
  ExternalLink,
  Heart,
  Share2,
  Tag,
  Sparkles,
  Coffee,
  Camera,
  Music,
  Music2,
  Phone,
  Mail,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Play,
  Instagram as InstagramIcon,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Instagram,
  ShoppingBag,
  TrendingUp,
  Shield,
  Target,
} from "lucide-react";
import CoffeeFooter from "../../footer/page";
import type { Metadata } from "next";

type Props = {
  params: { username: string };
};

// ========================= Shared Types =========================
interface ApiPlatform {
  id: string;
  productId: string;
  platform: string;
  price: string;
  link: string;
  clicks: number;
  lastUpdated: string;
}

interface ApiProduct {
  id: string;
  influencerId: string;
  name: string;
  description: string;
  price: string;
  category: string;
  tags: string[];
  image: string;
  affiliateLink: string | null;
  clicks: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  platforms: ApiPlatform[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  category: string;
  tags: string[];
  image: string;
  affiliateLink?: string | null;
  commission?: number;
  clicks: number;
  lastUpdated: string;
  featured?: boolean;
  platforms: { platform: string; link: string; price?: number }[];
}

// ========================= Contact + QuickButton + Card =========================
interface ContactItemProps {
  icon: ElementType;
  label: string;
  value: string;
}

const ContactItem: React.FC<ContactItemProps> = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  );
};

interface QuickButtonProps {
  label: string;
  url: string;
  icon: ReactNode;
  color: string; // 'from-pink-500 to-purple-500'
}

const QuickButton: React.FC<QuickButtonProps> = ({
  label,
  url,
  icon,
  color,
}) => (
  <button
    onClick={() => window.open(url, "_blank")}
    className={`w-full bg-gradient-to-r ${color} text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-md transition`}
  >
    {icon}
    {label}
  </button>
);

interface CardProps {
  item: {
    service: string;
    price: string;
    popular?: boolean;
    features: string[];
  };
}

const Card = ({ item }: CardProps) => (
  <div
    className={`relative p-8 rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 ${
      item.popular
        ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white scale-105"
        : "bg-white/80 backdrop-blur-sm text-gray-900"
    }`}
  >
    {item.popular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 rounded-full text-sm font-bold">
          Most Popular
        </span>
      </div>
    )}
    <div className="text-center mb-6">
      <h3 className="text-xl font-bold mb-2">{item.service}</h3>
      <div className="text-3xl font-bold mb-1">Rp {item.price}</div>
      <p
        className={`text-sm ${
          item.popular ? "text-orange-100" : "text-gray-600"
        }`}
      >
        per content
      </p>
    </div>
    <ul className="space-y-3 mb-8">
      {item.features.map((feature, featureIndex) => (
        <li key={featureIndex} className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              item.popular ? "bg-white" : "bg-orange-500"
            }`}
          />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
    <button
      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
        item.popular
          ? "bg-white text-orange-600 hover:bg-orange-50"
          : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg"
      }`}
    >
      Choose Package
    </button>
  </div>
);

// ========================= Page Component =========================
export default function RereAmaliaLanding() {
  // States dari user
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [imageIndex1, setImageIndex1] = useState(0);
  const [imageIndex2, setImageIndex2] = useState(0);
  const [bioIndex, setBioIndex] = useState(0);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // Katalog produk (disiapkan jika ingin ditampilkan di bawah, bisa diaktifkan bila perlu)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPrice, setFilterPrice] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set<string>());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let aborted = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/username/username`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json: { success: boolean; data: ApiProduct[] } = await res.json();
        if (!json.success || !Array.isArray(json.data))
          throw new Error("Invalid API response shape");
        const normalized: Product[] = json.data.map((p) => {
          const parsedPrice = Number(p.price);
          const platforms = (p.platforms || []).map((pl) => ({
            platform: pl.platform,
            link: pl.link,
            price: pl.price ? Number(pl.price) : undefined,
          }));
          return {
            id: p.id,
            name: p.name,
            description: p.description ?? "",
            price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
            category: p.category ?? "Others",
            tags: Array.isArray(p.tags) ? p.tags : [],
            image: p.image,
            affiliateLink: p.affiliateLink ?? null,
            clicks: p.clicks ?? 0,
            lastUpdated: p.lastUpdated ?? p.updatedAt ?? p.createdAt,
            featured: true,
            rating: 4.5,
            reviewCount: 0,
            platforms,
          };
        });
        if (!aborted) setProducts(normalized);
      } catch (e: any) {
        if (!aborted) setError(e?.message || "Unknown error");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => {
      aborted = true;
    };
  }, []);

  // Dummy data social posts, portfolio, testimonials, rate card, images, bios, quotes, brandLogos
  const socialPosts = [
    {
      id: 1,
      type: "instagram",
      image:
        "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751820425/fashbrew/coba_tebak_mau_kemana_%EF%B8%8F_wisata_wisataindonesia_i3myqa.jpg",
      likes: "2.4k",
      comments: "510",
      url: "https://www.instagram.com/reel/C6s7UjwSoIN/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA",
    },
    {
      id: 2,
      type: "tiktok",
      image:
        "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752028320/fashbrew/Tangkapan_Layar_2025-07-09_pukul_09.33.13_xjxkut.png",
      likes: "2.2k",
      views: "52.8k",
      shares: "110",
      url: "https://www.tiktok.com/@rere_feliysia/video/7512439161597513016?is_from_webapp=1&sender_device=pc&web_id=7511261970013226512",
    },
    {
      id: 3,
      type: "instagram",
      image:
        "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751364573/fashbrew/pi_newyear_thank_u_luminorhotel.sidoarjo_qqjfn5.jpg",
      likes: "683",
      comments: "20",
      url: "https://www.instagram.com/p/DERYqRTzSgT/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA",
    },
    {
      id: 4,
      type: "instagram",
      image:
        "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752028908/fashbrew/info_mancing_bolo_fyp_trend_trendbedaangin_bedaangin_jdk3d6.jpg",
      likes: "2.8k",
      comments: "75",
      url: "https://www.instagram.com/p/DGzvENTTXmq/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    },
    {
      id: 5,
      type: "instagram",
      image:
        "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752249347/fashbrew/Focus_on_yourself._The_rest_will_follow._basket_basketball_basketballlovers_basketballgames_2_fpcirn.jpg",
      likes: "668",
      comments: "20",
      url: "https://www.instagram.com/reel/DLCRySSPCnX/?igsh=MW05c2QyaWcwbDdxMw==",
    },
    {
      id: 6,
      type: "instagram",
      image:
        "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752249466/fashbrew/mau_renang_takut_tenggelam_tenggelam_dalam_senyummu_misalnya_swimmingpool_swimming_vibgxi.jpg",
      likes: "491",
      comments: "14",
      url: "https://www.instagram.com/reel/C5su07xy2WX/?utm_source=ig_web_copy_link",
    },
  ];

  const portfolioItems = [
    {
      category: "Fashion",
      image:
        "https://res.cloudinary.com/dvuza2lpc/image/upload/v1750752061/fashbrew/neon_outfit_ootd_ootdfashion_ootdneon_neon_coloroutfit_outfit_jhml0c.jpg",
      title: "Summer Collection 2024",
    },
    {
      category: "Food",
      image:
        "https://res.cloudinary.com/dvuza2lpc/image/upload/v1750752063/fashbrew/take_your_coffee_%EF%B8%8F_ttmkeh.jpg",
      title: "Local Coffee Review",
    },
    {
      category: "DJ",
      image:
        "https://res.cloudinary.com/dvuza2lpc/image/upload/f_auto,q_auto,w_800/v1751364573/fashbrew/pi_newyear_thank_u_luminorhotel.sidoarjo_qqjfn5.jpg",
      title: "Weekend Vibes Set",
    },
    {
      category: "Lifestyle",
      image:
        "https://res.cloudinary.com/dvuza2lpc/image/upload/f_auto,q_auto,w_800/v1751364720/fashbrew/Do_whatever_makes_you_happiest_._cd7aod.jpg",
      title: "Morning Routine",
    },
  ];

  const testimonials = [
    {
      brand: "Scarlett",
      logo: "https://res.cloudinary.com/dvuza2lpc/image/upload/f_auto,q_auto,w_800/v1751365729/fashbrew/Tangkapan_Layar_2025-07-01_pukul_17.30.00_gjabxz.png",
      text: "Gaya konten autentik Rere sangat selaras dengan nilai-nilai brand kami. Hasilnya luar biasa, engagement-nya benar-benar mengesankan! Kami sangat puas dengan kolaborasi ini.",
      rating: 5,
    },
    {
      brand: "3Second",
      logo: "https://res.cloudinary.com/dvuza2lpc/image/upload/f_auto,q_auto,w_800/v1751365933/fashbrew/Tangkapan_Layar_2025-07-01_pukul_17.33.19_bbtpqx.png",
      text: "Kolaborasi yang sangat profesional! Konten yang dihasilkan menampilkan produk kami dengan cara yang stylish dan autentik. Visualnya clean, estetik, dan benar-benar mencerminkan karakter brand 3Second. Sangat puas dengan hasilnya – recommended untuk campaign fashion!",
      rating: 5,
    },
    {
      brand: "Colorbox",
      logo: "https://res.cloudinary.com/dvuza2lpc/image/upload/f_auto,q_auto,w_800/v1751385123/fashbrew/Tangkapan_Layar_2025-07-01_pukul_22.52.55_ropzwu.png",
      text: "Rere berhasil menangkap semangat Colorbox yang fun, youthful, dan penuh warna lewat konten yang kreatif dan autentik. Visual yang ditampilkan benar-benar menggambarkan karakter brand kami. Engagement-nya juga tinggi banget! Senang bisa berkolaborasi dengan Rere.Creative content that drove real results for our summer campaign.",
      rating: 5,
    },
    {
      brand: "Universitas Terbuka",
      logo: "https://res.cloudinary.com/dvuza2lpc/image/upload/f_auto,q_auto,w_800/v1751431866/fashbrew/Tangkapan_Layar_2025-07-02_pukul_11.51.44_e8jwxo.png",
      text: "Terima kasih banyak untuk Rere yang telah membantu memperkenalkan Universitas Terbuka kepada lebih banyak orang. Kami sangat mengapresiasi cara Rere menyampaikan nilai-nilai fleksibilitas, keterbukaan akses, dan kualitas pendidikan yang kami usung.",
      rating: 5,
    },
    {
      brand: "Bank Jatim",
      logo: "https://res.cloudinary.com/dvuza2lpc/image/upload/f_auto,q_auto,w_800/v1751432213/fashbrew/Tangkapan_Layar_2025-07-02_pukul_11.57.44_onqxnf.png",
      text: "Kami dari Bank Jatim menyampaikan apresiasi yang sebesar-besarnya kepada Rere atas dukungan dan promosi positif yang diberikan. Terima kasih telah membantu memperkenalkan layanan dan komitmen kami kepada masyarakat luas dengan cara yang menarik dan informatif.",
      rating: 5,
    },
    {
      brand: "Djarum",
      logo: "https://res.cloudinary.com/dvuza2lpc/image/upload/f_auto,q_auto,w_800/v1751432694/fashbrew/Tangkapan_Layar_2025-07-02_pukul_12.06.12_v4uzxo.png",
      text: "Terima kasih kepada Rere atas dukungan dan dedikasinya dalam memperkenalkan brand Djarum dengan cara yang elegan dan penuh integritas. Kami sangat mengapresiasi bagaimana Rere mampu menyampaikan nilai dan citra Djarum secara positif kepada publik.",
      rating: 5,
    },
  ];

  const rateCard = {
    custom: [
      {
        title: "Starter Package",
        description:
          "Paket kolaborasi ringan untuk pengenalan brand secara cepat.",
        features: ["1x Feed or Reels", "Story Instagram"],
      },
      {
        title: "Engagement Package",
        description: "Fokus pada interaksi dan jangkauan yang lebih luas.",
        features: [
          "Visit Location (Jember Kota)",
          "1x Feed or Reels",
          "Story Instagram",
          "Mirroring Tiktok",
        ],
      },
      {
        title: "Ultimate Collaboration",
        description:
          "Paket lengkap untuk kampanye maksimal dengan storytelling.",
        features: [
          "Visit Location (Area Tapal Kuda)",
          "1x Reels or Feed",
          "Story Instagram",
          "Mirroring Tiktok",
        ],
      },
      {
        title: "Customize Package",
        description:
          "Pilih sendiri kombinasi konten dan layanan sesuai dengan kebutuhan brand Anda.",
        features: [
          "Request jumlah dan jenis konten (Feed/Reels/Story Instagram atau Tiktok)",
          "Visit Location (opsional, area disesuaikan)",
          "Diskusi konsep dan storytelling",
          "Estimasi harga berdasarkan permintaan",
        ],
      },
    ],
  };

  const images1 = [
    "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751820222/fashbrew/Outfit_today_Cardi_rajut_under_100k_%EF%B8%8F_shanumastore_ootd_cardi_cardigan_cardiganmurah_fjeohb.jpg",
    "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751820425/fashbrew/coba_tebak_mau_kemana_%EF%B8%8F_wisata_wisataindonesia_i3myqa.jpg",
    "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751364573/fashbrew/pi_newyear_thank_u_luminorhotel.sidoarjo_qqjfn5.jpg",
  ];
  const images2 = [
    "https://res.cloudinary.com/dvuza2lpc/image/upload/f_auto,q_auto,w_800/v1751017202/fashbrew/Terimakasih_aspal_kiri_%EF%B8%8F_jbi.tobbaco_uabiht.jpg",
    "https://res.cloudinary.com/dvuza2lpc/image/upload/f_auto,q_auto,w_800/v1750752061/fashbrew/one_set_maezula_pinvul.jpg",
    "https://res.cloudinary.com/dvuza2lpc/image/upload/v1750752061/fashbrew/neon_outfit_ootd_ootdfashion_ootdneon_neon_coloroutfit_outfit_jhml0c.jpg",
  ];

  const bios = [
    {
      role: "Content Creator",
      desc: `Hello! I’m Rere Amalia — a content creator based in Jember, Indonesia. I specialize in fashion, lifestyle, food reviews.`,
    },
    {
      role: "DJ Performer",
      desc: `I occasionally perform as a DJ at exclusive events, bringing energy and great vibes to the crowd.`,
    },
    {
      role: "Brand Ambassador",
      desc: `I work with brands as a BA to tell real, human stories that connect and convert audiences.`,
    },
  ];

  const quotes = [
    "Confidence is the best outfit.",
    "Beauty begins the moment you decide to be yourself.",
    "Style is a way to say who you are without speaking.",
  ];

  const brandLogos = [
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751365933/fashbrew/Tangkapan_Layar_2025-07-01_pukul_17.33.19_bbtpqx.png",
      instagram:
        "https://www.instagram.com/reel/DLaBDC5zSfj/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751365729/fashbrew/Tangkapan_Layar_2025-07-01_pukul_17.30.00_gjabxz.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752027782/fashbrew/Tangkapan_Layar_2025-07-01_pukul_22.52.55_1_aokd6d.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752027961/fashbrew/Tangkapan_Layar_2025-07-02_pukul_11.51.44_e8jwxo_1_zne03t.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752027316/fashbrew/Tangkapan_Layar_2025-07-02_pukul_11.57.44_1_f8czs9.png",
      instagram:
        "https://www.instagram.com/reel/DLCRySSPCnX/?utm_source=ig_web_copy_link&igsh=MW05c2QyaWcwbDdxMw==",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751432694/fashbrew/Tangkapan_Layar_2025-07-02_pukul_12.06.12_v4uzxo.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751436306/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.04.02_f0hnea.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751436424/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.08.24_tnj0hs.png",
      instagram:
        "https://www.instagram.com/p/DERYqRTzSgT/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752027050/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.10.14_1_ocit2e.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751436627/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.11.47_l3zona.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752027453/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.13.47_1_qdwlcp.png",
      instagram:
        "https://www.instagram.com/reel/C5su07xy2WX/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751436907/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.16.24_myphi2.png",
      instagram:
        "https://www.instagram.com/reel/DCOUUBbSs05/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751436988/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.17.47_po7eor.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752027050/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.19.16_1_bkghut.png",
      instagram:
        "https://www.instagram.com/reel/C36r4eYyxNF/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752027050/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.20.59_1_gjtneh.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752027050/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.20.40_1_gxsrax.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751437309/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.23.03_ewadwq.png",
      instagram:
        "https://www.instagram.com/reel/C2ZF1KBSVji/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752027050/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.24.12_1_bihvqz.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751437463/fashbrew/LOGO-ORIGINAL-Elizabeth-PNG-_suixbv.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1751437562/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.27.03_fyphwh.png",
      instagram: "#",
    },
    {
      src: "https://res.cloudinary.com/dvuza2lpc/image/upload/v1752027050/fashbrew/Tangkapan_Layar_2025-07-02_pukul_13.28.19_1_nvx0xn.png",
      instagram:
        "https://www.instagram.com/reel/DKhKyUkzV33/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    },
  ];

  // Handlers
  const nextImage1 = () =>
    setImageIndex1((prev) => (prev + 1) % images1.length);
  const prevImage1 = () =>
    setImageIndex1((prev) => (prev - 1 + images1.length) % images1.length);
  const nextImage2 = () =>
    setImageIndex2((prev) => (prev + 1) % images2.length);
  const prevImage2 = () =>
    setImageIndex2((prev) => (prev - 1 + images2.length) % images2.length);
  const nextBio = () => setBioIndex((prev) => (prev + 1) % bios.length);
  const prevBio = () =>
    setBioIndex((prev) => (prev - 1 + bios.length) % bios.length);

  const nextTestimonial = () =>
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () =>
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const user = name;
    const pesan = message;
    const waMessage = `Halo rere, saya ${user}. \n\n${pesan}`;
    const waLink = `https://wa.me/6285748578429?text=${encodeURIComponent(
      waMessage
    )}`;
    window.open(waLink, "_blank");
  };

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const handleSocialClick = (platform: "instagram" | "tiktok") => {
    const urls = {
      instagram:
        "https://www.instagram.com/_rereamalia_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw",
      tiktok:
        "https://www.tiktok.com/@rere_feliysia?is_from_webapp=1&sender_device=pc",
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  // Catalog helpers (disiapkan jika dipakai)
  const categories = [
    "All",
    "Electronics",
    "Fashion",
    "Home & Living",
    "Beauty",
    "Sports",
    "Toys",
    "Automotive",
  ];
  const priceRanges = [
    "All",
    "Under 200k",
    "200k - 500k",
    "500k - 1M",
    "Above 1M",
  ];
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };
  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };
  const closeModal = () => {
    setSelectedProduct(null);
    setShowModal(false);
  };
  const handleShareProduct = (product: Product) => {
    const shareData = {
      title: `${product.name} - Recommended Product`,
      text: `Check out this amazing product: ${product.description}`,
      url: product.affiliateLink || product.platforms[0]?.link || "",
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        navigator.clipboard
          .writeText(shareData.url)
          .then(() => alert("Product link copied to clipboard!"))
          .catch(() => alert("Failed to copy link."));
      });
    } else {
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => alert("Product link copied to clipboard!"))
        .catch(() => alert("Failed to copy link."));
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.tags.some((tag) => tag.toLowerCase().includes(term));
      const matchesCategory =
        filterCategory === "All" || product.category === filterCategory;
      const price = product.price;
      const matchesPrice =
        filterPrice === "All" ||
        (filterPrice === "Under 200k" && price < 200000) ||
        (filterPrice === "200k - 500k" && price >= 200000 && price < 500000) ||
        (filterPrice === "500k - 1M" && price >= 500000 && price < 1000000) ||
        (filterPrice === "Above 1M" && price >= 1000000);
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, filterCategory, filterPrice]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case "featured":
        return arr.sort((a, b) => (b.featured ? 1 : -1));
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      case "rating":
        return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case "newest":
        return arr.sort(
          (a, b) =>
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
        );
      default:
        return arr;
    }
  }, [filteredProducts, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden sm:py-16">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-orange-200 to-amber-200 rounded-full opacity-60 animate-pulse" />
        <div className="absolute bottom-32 right-16 w-16 h-16 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full opacity-40 animate-bounce" />
        <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-orange-300 rounded-full opacity-50" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">
                Hi, I&apos;m{" "}
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                  Rere Amalia
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl font-serif text-gray-700 font-medium">
                Fashion & Beauty Influencer | 100K+ Engaged Community
              </p>
              <p className="text-lg text-gray-600 mt-2">
                Mengubah produk Anda menjadi trending topic di kalangan
                millennials & Gen Z
              </p>
              {/* Tags */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 sm:gap-3 text-sm sm:text-base">
                <span className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-orange-300 shadow-sm hover:shadow-md transition">
                  <ShoppingBag className="h-5 w-5 text-orange-500" />
                  <span className="text-gray-800 font-medium">
                    Fashion OOTD
                  </span>
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-orange-300 shadow-sm hover:shadow-md transition">
                  <Coffee className="h-5 w-5 text-amber-600" />
                  <span className="text-gray-800 font-medium">Food</span>
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-orange-300 shadow-sm hover:shadow-md transition">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-gray-800 font-medium">
                    Lifestyle Content
                  </span>
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-orange-300 shadow-sm hover:shadow-md transition">
                  <Music className="h-5 w-5 text-amber-500" />
                  <span className="text-gray-800 font-medium">DJ</span>
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <a
                href="https://wa.me/6285748578429?text=Hallo%20Rere%2C%20mau%20endorse%20dong"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full font-semibold text-base sm:text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5" />
                  Konsultasi Gratis — Collab Sekarang
                </button>
              </a>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-300 to-amber-300 rounded-3xl rotate-6 opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-300 rounded-3xl -rotate-3 opacity-20" />
              <img
                src="https://res.cloudinary.com/dvuza2lpc/image/upload/v1750752061/fashbrew/one_set_maezula_pinvul.jpg"
                alt="Rere Amalia"
                className="relative w-full h-72 sm:h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">45K +</p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                    <Music2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">63K +</p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio & Image Section */}
      <section className="relative py-24 sm:py-28 lg:py-32 bg-gradient-to-br from-white via-orange-50/70 to-amber-50 backdrop-blur-md overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
          {/* === Left Content (Bio + Highlights) === */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900">
                Meet <span className="text-orange-600">Rere Amalia</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                <strong>"Fashion is my language, beauty is my passion."</strong>
                <br />
                <br />
                Saya Rere Amalia, dan selama 3+ tahun saya membangun komunitas{" "}
                <strong>100K+ followers</strong> yang aktif dan engaged di
                Instagram & TikTok. Tidak hanya angka — saya fokus pada{" "}
                <strong>koneksi autentik</strong> yang membuat audiens percaya
                dan bertindak.
                <br />
                <br />
                Setiap konten yang saya buat adalah hasil riset mendalam tentang
                apa yang audiens butuhkan, bukan hanya apa yang terlihat cantik.
              </p>
            </div>

            {/* Highlights */}
            <div className="space-y-5">
              <div className="bg-white/70 border border-orange-100 rounded-2xl p-5 shadow hover:shadow-lg transition-all">
                <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-2">
                  Proven Track Record dengan Brand Ternama
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Brand Ambassador <strong>Rikas Aesthetic</strong> —
                  Menghasilkan <strong>300+ leads</strong> per kampanye dengan
                  engagement rate <strong>8.5%</strong>
                </p>
              </div>

              <div className="bg-white/70 border border-orange-100 rounded-2xl p-5 shadow hover:shadow-lg transition-all">
                <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-2">
                  Live Selling yang Convert
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Pengalaman <strong>50+ live sessions</strong> untuk brand
                  fashion & beauty. Gaya membawaan yang warm & engaging membuat
                  audiens nyaman bertransaksi langsung.
                </p>
              </div>

              <div className="bg-white/70 border border-orange-100 rounded-2xl p-5 shadow hover:shadow-lg transition-all">
                <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-2">
                  Content Creator
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Fokus pada{" "}
                  <strong>konten kecantikan, fashion, dan lifestyle</strong>.
                  Selain itu, Rere juga berpengalaman sebagai{" "}
                  <strong>DJ di Aston Hotel dan Luminor Hotel</strong>,
                  memperluas daya tariknya dalam dunia hiburan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 text-orange-600 font-medium">
              <MapPin className="w-5 h-5" />
              <span>Based in Jember, Indonesia</span>
            </div>
          </div>

          {/* === Right Image (Slider Style but Single Image) === */}
          <div className="relative flex items-center justify-center">
            <div className="relative bg-white/80 border border-orange-100 rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg lg:max-w-none">
              <img
                src={images1[imageIndex1]}
                alt={`Slide ${imageIndex1}`}
                className="w-full h-[600px] sm:h-[680px] lg:h-[760px] object-cover rounded-3xl transition-all duration-500"
              />

              {/* Caption */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 px-4 py-2 rounded-full text-sm sm:text-base text-orange-700 font-semibold shadow-md">
                {quotes[imageIndex1]}
              </div>

              {/* Controls */}
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <button
                  onClick={prevImage1}
                  className="bg-white/80 hover:bg-white transition-all rounded-full p-2 shadow"
                >
                  <ArrowLeft className="w-5 h-5 text-orange-600" />
                </button>
                <button
                  onClick={nextImage1}
                  className="bg-white/80 hover:bg-white transition-all rounded-full p-2 shadow"
                >
                  <ArrowRight className="w-5 h-5 text-orange-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Stats */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-pink-50 to-orange-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-10 sm:mb-12">
            Social Media Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {/* Instagram Card */}
            <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl">
              <div className="flex justify-center mb-3 sm:mb-4">
                <InstagramIcon className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                Instagram
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 text-center mt-4 sm:mt-6">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    45K+
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">Followers</p>
                </div>
              </div>
            </div>
            {/* TikTok Card */}
            <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl">
              <div className="flex justify-center mb-3 sm:mb-4">
                <Music2 className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                TikTok
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 text-center mt-4 sm:mt-6">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    63K+
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">Followers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Instagram/TikTok Feed */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-white/60 to-purple-50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-2 sm:mb-3">
              Latest Social Content
            </h2>
            <p className="text-base sm:text-lg text-gray-700">
              Follow my journey across Instagram & TikTok ✨
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {socialPosts.map((post) => (
              <div
                key={post.id}
                className="relative group overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                onClick={() => handlePostClick(post.url)}
              >
                <img
                  src={post.image}
                  alt={`${post.type} post ${post.id}`}
                  className="w-full h-64 sm:h-72 object-cover transition-transform duration-300 group-hover:scale-110"
                />

                <div
                  className={`absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-300 ${
                    post.type === "instagram"
                      ? "bg-gradient-to-r from-pink-500 to-orange-500"
                      : "bg-gradient-to-r from-purple-500 to-pink-500"
                  }`}
                >
                  {post.type === "instagram" ? (
                    <Instagram className="h-4 w-4 text-white" />
                  ) : (
                    <Music2 className="h-4 w-4 text-white" />
                  )}
                </div>

                {post.type === "tiktok" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-4 group-hover:bg-black/70 transition-all duration-300">
                      <Play className="h-8 w-8 text-white fill-white" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center rounded-2xl">
                  <div className="flex items-center gap-3 sm:gap-4 text-white text-sm sm:text-base font-medium mb-3 sm:mb-4">
                    <div className="flex items-center gap-1">
                      <Heart className="h-5 w-5 text-red-400" />
                      <span>{post.likes}</span>
                    </div>
                    {post.type === "instagram" ? (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-5 w-5 text-blue-400" />
                        <span>{post.comments}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <Play className="h-4 w-4 text-green-400" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="h-4 w-4 text-yellow-400" />
                          <span>{post.shares}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePostClick(post.url);
                      }}
                      className={`text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-200 transform hover:scale-105 ${
                        post.type === "instagram"
                          ? "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      }`}
                    >
                      {post.type === "instagram" ? (
                        <>
                          <Instagram className="h-4 w-4" />
                          View Post
                        </>
                      ) : (
                        <>
                          <Music2 className="h-4 w-4" />
                          Watch Video
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          {/* Social Media Buttons */}
          <div className="text-center mt-10 sm:mt-12">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
              <button
                onClick={() => handleSocialClick("instagram")}
                className="inline-flex items-center gap-2.5 sm:gap-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium hover:from-pink-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
                Follow on Instagram
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <button
                onClick={() => handleSocialClick("tiktok")}
                className="inline-flex items-center gap-2.5 sm:gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Music2 className="h-5 w-5 sm:h-6 sm:w-6" />
                Follow on TikTok
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <p className="text-gray-600 mt-4 sm:mt-6 text-xs sm:text-sm">
              Join thousands of followers for daily inspiration and updates! 🌟
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Gallery */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-2 sm:mb-3">
              Portfolio Highlights
            </h2>
            <p className="text-base sm:text-lg text-gray-700">
              A curated collection of my diverse content collaborations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {portfolioItems.map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 sm:h-80 object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl">
                  <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6 text-white">
                    <div className="mb-1.5 sm:mb-2">
                      <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold drop-shadow-md">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Collaborations Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply blur-xl animate-pulse" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply blur-xl animate-pulse animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply blur-xl animate-pulse animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Brand Collaborations
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-5 sm:mb-6 rounded-full" />
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4">
              Trusted by leading brands worldwide to create authentic, engaging
              content that resonates with audiences
            </p>
          </div>

          {/* Infinite Scrolling Brand Logos */}
          <div className="relative">
            {/* Main scrolling container */}
            <div className="overflow-hidden mask-gradient h-20 sm:h-24 lg:h-32">
              <div className="flex items-center h-full animate-scroll-left min-w-max">
                {brandLogos.map((logo, index) => (
                  <div
                    key={`first-${index}`}
                    className="flex-shrink-0 mx-3 sm:mx-6 lg:mx-8 group"
                  >
                    <a
                      href={logo.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 group-hover:scale-105 hover:bg-white/90">
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm" />
                        <div className="relative flex justify-center items-center h-8 w-20 sm:h-10 sm:w-24 lg:h-14 lg:w-32">
                          <img
                            src={logo.src}
                            alt={`Brand partner ${index + 1}`}
                            className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                        </div>
                      </div>
                    </a>
                  </div>
                ))}

                {brandLogos.map((logo, index) => (
                  <div
                    key={`second-${index}`}
                    className="flex-shrink-0 mx-3 sm:mx-6 lg:mx-8 group"
                  >
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 group-hover:scale-105 hover:bg-white/90">
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm" />
                      <div className="relative flex justify-center items-center h-8 w-20 sm:h-10 sm:w-24 lg:h-14 lg:w-32">
                        <img
                          src={logo.src}
                          alt={`Brand partner ${index + 1}`}
                          className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Second row - reverse direction */}
            <div className="overflow-hidden mask-gradient mt-4 sm:mt-6 lg:mt-8 h-20 sm:h-24 lg:h-32">
              <div className="flex animate-scroll-right items-center h-full min-w-max">
                {[...brandLogos].reverse().map((logo, index) => (
                  <div
                    key={`reverse-first-${index}`}
                    className="flex-shrink-0 mx-3 sm:mx-6 lg:mx-8 group"
                  >
                    <a
                      href={logo.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 group-hover:scale-105 hover:bg-white/90">
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm" />
                        <div className="relative flex justify-center items-center h-8 w-20 sm:h-10 sm:w-24 lg:h-14 lg:w-32">
                          <img
                            src={logo.src}
                            alt={`Brand partner reverse ${index + 1}`}
                            className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                        </div>
                      </div>
                    </a>
                  </div>
                ))}

                {[...brandLogos].reverse().map((logo, index) => (
                  <div
                    key={`reverse-second-${index}`}
                    className="flex-shrink-0 mx-3 sm:mx-6 lg:mx-8 group"
                  >
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 group-hover:scale-105 hover:bg-white/90">
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm" />
                      <div className="relative flex justify-center items-center h-8 w-20 sm:h-10 sm:w-24 lg:h-14 lg:w-32">
                        <img
                          src={logo.src}
                          alt={`Brand partner reverse ${index + 1}`}
                          className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-10 sm:mt-12 lg:mt-16">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer group text-sm sm:text-base"
            >
              <span>Ready to collaborate?</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>
        <style jsx>{`
          .mask-gradient {
            mask: linear-gradient(
              90deg,
              transparent,
              white 10%,
              white 90%,
              transparent
            );
            -webkit-mask: linear-gradient(
              90deg,
              transparent,
              white 10%,
              white 90%,
              transparent
            );
          }
          @keyframes scroll-left {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          @keyframes scroll-right {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0);
            }
          }
          .animate-scroll-left {
            animation: scroll-left 60s linear infinite;
          }
          .animate-scroll-left:hover {
            animation-play-state: paused;
          }
          .animate-scroll-right {
            animation: scroll-right 50s linear infinite;
          }
          .animate-scroll-right:hover {
            animation-play-state: paused;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          @media (max-width: 640px) {
            .animate-scroll-left {
              animation: scroll-left 40s linear infinite;
            }
            .animate-scroll-right {
              animation: scroll-right 35s linear infinite;
            }
          }
        `}</style>
      </section>

      {/* Brand Testimonials */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-orange-100 via-amber-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              What Brands Say
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700">
              Trusted by leading brands across Indonesia
            </p>
          </div>

          <div className="relative">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl transition-all duration-500 max-w-md mx-auto sm:max-w-full h-auto md:h-96">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden mx-auto mb-4 sm:mb-5 md:mb-6 shadow-md bg-white p-2">
                  <img
                    src={testimonials[currentTestimonial].logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex justify-center mb-3 sm:mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current drop-shadow"
                      />
                    )
                  )}
                </div>

                <p className="text-sm sm:text-base md:text-lg text-gray-800 mb-4 sm:mb-5 md:mb-6 italic leading-relaxed">
                  “{testimonials[currentTestimonial].text}”
                </p>

                <p className="font-semibold text-gray-900 text-sm sm:text-base tracking-wide">
                  — {testimonials[currentTestimonial].brand}
                </p>
              </div>
            </div>

            {/* Desktop nav buttons */}
            <button
              onClick={prevTestimonial}
              className="hidden sm:flex absolute left-0 -ml-4 sm:-ml-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg hover:scale-105 transition"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
            </button>

            <button
              onClick={nextTestimonial}
              className="hidden sm:flex absolute right-0 -mr-4 sm:-mr-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg hover:scale-105 transition"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
            </button>

            {/* Mobile nav buttons */}
            <div className="flex justify-center gap-3 sm:gap-4 mt-5 sm:hidden">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:scale-105 transition"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:scale-105 transition"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Card Section (Kolaborasi) */}
      <section className="py-16 sm:py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-2 sm:mb-4">
              Paket Kolaborasi yang Terbukti{" "}
              <span className="text-orange-600">Menghasilkan ROI</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Tidak ada paket "one size fits all" — setiap brand unik, setiap
              campaign berbeda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {rateCard.custom.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-pink-100 rounded-2xl shadow-lg p-5 sm:p-6 flex flex-col justify-between transition hover:shadow-pink-200"
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-pink-600 mb-1.5 sm:mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    {item.description}
                  </p>
                  <ul className="list-disc pl-4 sm:pl-5 space-y-1.5 sm:space-y-2 text-gray-600 text-sm">
                    {item.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <a
                  href={`https://wa.me/6285748578429?text=Halo%2C%20saya%20tertarik%20dengan%20paket%20${encodeURIComponent(
                    item.title
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 sm:mt-6 inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-pink-700 hover:scale-105 transition-all duration-200"
                >
                  💬 Tanya Sekarang
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Brands Choose Rere Amalia
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Targeted Audience
              </h3>
              <p className="text-gray-600">
                75% female millennials & Gen Z dengan purchasing power tinggi
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Proven Results
              </h3>
              <p className="text-gray-600">
                8.5% avg. engagement rate (3x lebih tinggi dari industry
                standard)
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Professional & Reliable
              </h3>
              <p className="text-gray-600">
                On-time delivery, clear communication, dan dedicated support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Boost Your Brand Awareness?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Mari diskusikan bagaimana kita bisa membawa brand Anda ke audiens
            yang tepat
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/6285748578429?text=Halo%20Rere%2C%20saya%20tertarik%20untuk%20diskusi%20kolaborasi"
              target="_blank"
              className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all inline-flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Chat via WhatsApp
            </a>

            <a
              href="mailto:reereamalia@example.com"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-orange-600 transition-all inline-flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Email Partnership
            </a>
          </div>

          <p className="text-sm mt-6 opacity-75">
            {"Response time: < 24 jam | Available for urgent projects"}
          </p>
        </div>
      </section>

      {/* Footer */}
      <CoffeeFooter />

      {/* Optional Modal untuk katalog produk dari API (jika ingin ditampilkan) */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overscroll-contain flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[92vw] sm:w-auto max-w-sm sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto transform transition-all duration-300">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Pilih Platform
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Pilih platform untuk membeli{" "}
                <span className="font-medium">{selectedProduct.name}</span>
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {selectedProduct.platforms.map((platform) => (
                  <button
                    key={platform.platform}
                    className="w-full group relative overflow-hidden bg-gradient-to-r hover:shadow-lg transition-all duration-200 rounded-xl border-2 border-gray-100 hover:border-transparent"
                    onClick={() => window.open(platform.link, "_blank")}
                    data-platform={platform.platform}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        platform.platform === "tiktok"
                          ? "from-black to-gray-800"
                          : platform.platform === "shopee"
                          ? "from-orange-500 to-red-500"
                          : "from-green-500 to-green-600"
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                    />
                    <div className="relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 group-hover:text-white transition-colors">
                      <div className="text-xl sm:text-2xl">
                        {platform.platform === "tiktok"
                          ? "🎵"
                          : platform.platform === "shopee"
                          ? "🛍️"
                          : "🛒"}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-base sm:text-lg text-black group-hover:text-white">
                          {platform.platform}
                        </div>
                        {typeof platform.price === "number" && (
                          <div className="text-xs sm:text-sm opacity-75 group-hover:opacity-90">
                            {formatCurrency(platform.price)}
                          </div>
                        )}
                      </div>
                      <div className="text-gray-400 group-hover:text-white/80">
                        <svg
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-amber-600 font-bold">
                      {formatCurrency(selectedProduct.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <button
                className="w-full text-center text-gray-500 hover:text-gray-700 transition-colors py-2 text-sm"
                onClick={closeModal}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
