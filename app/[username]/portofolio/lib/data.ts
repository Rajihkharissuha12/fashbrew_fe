// lib/data.ts
export interface Project {
  id: string;
  title: string;
  brand: string;
  category: string[];
  deliverable: string;
  objective: string;
  views: string;
  likes: string;
  testimonial: string;
  year: string;
  thumbnail: string;
  images: string[];
  description: string;
  metrics: {
    label: string;
    value: string;
  }[];
  link?: string;
  isVideo?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  popular?: boolean;
}

export const services = [
  {
    id: "reels-tiktok",
    icon: "Video",
    title: "Reels & TikTok Videos",
    description:
      "Video pendek yang engaging dengan storytelling kuat, perfect untuk brand awareness dan viral potential",
    examples: "Fashion haul, OOTD transitions, product reviews",
    popular: true,
  },
  {
    id: "instagram-feed",
    icon: "Instagram",
    title: "Instagram Feed & Carousel",
    description:
      "Konten estetik yang match dengan feed aesthetic, ideal untuk brand positioning dan product showcase",
    examples: "Lookbook posts, flat lay styling, product photography",
  },
  {
    id: "live-selling",
    icon: "ShoppingBag",
    title: "Live Selling & Shopping",
    description:
      "Live streaming interaktif dengan proven conversion rate tinggi, langsung drive sales untuk produk Anda",
    examples: "Instagram Live, TikTok Shop Live, flash sale events",
    popular: true,
  },
  {
    id: "story-content",
    icon: "Sparkles",
    title: "Instagram & TikTok Stories",
    description:
      "Konten behind-the-scenes yang autentik untuk membangun trust dan kedekatan dengan audiens",
    examples: "Unboxing, daily routine, honest review, Q&A",
  },
  {
    id: "ugc-content",
    icon: "TrendingUp",
    title: "UGC-Style Content",
    description:
      "Konten yang terlihat organik dan natural, perfect untuk paid ads dengan engagement rate tinggi",
    examples: "Testimonial style, raw & real reviews, before-after",
  },
  {
    id: "brand-ambassador",
    icon: "Users",
    title: "Brand Ambassador Program",
    description:
      "Partnership jangka panjang dengan multiple touchpoints, konsisten promote brand dalam periode tertentu",
    examples: "Monthly content package, event coverage, exclusive launches",
  },
];

export const projects: Project[] = [
  {
    id: "rikas-aesthetic",
    brand: "Rikas Aesthetic",
    title: "Brand Ambassador Campaign",
    description:
      "Long-term brand ambassador program dengan fokus pada skincare routine dan treatment review. Menghasilkan 300+ qualified leads per kampanye melalui authentic storytelling dan before-after content.",
    category: ["Beauty", "Live Selling"],
    deliverable: "Reels + Stories + Live",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dvuza2lpc/video/upload/v1771253125/fashbrew/rikas_ubcsbx.mp4",
    isVideo: true,
    images: [
      "/portfolio/rikas-1.jpg",
      "/portfolio/rikas-2.jpg",
      "/portfolio/rikas-3.jpg",
    ],
    metrics: [
      { label: "Leads Generated", value: "300+" },
      { label: "Reach", value: "450K" },
      { label: "Campaign Duration", value: "6 Months" },
    ],
    objective:
      "Meningkatkan brand awareness dan generate qualified leads untuk treatment packages melalui authentic content dan live selling sessions.",
    link: "https://www.instagram.com/p/DQERTV-EnGQ/",
    views: "5.8K",
    likes: "2.4K",
    testimonial:
      "Kolaborasi dengan Rere sangat profesional dan hasil kontennya selalu exceed expectations!",
  },
  {
    id: "3second",
    brand: "3Second",
    title: "Fashion Lookbook Campaign",
    description:
      "Kolaborasi untuk summer collection 2025 dengan konsep minimalist chic. Konten yang dihasilkan menampilkan produk dengan cara yang stylish dan autentik.",
    category: ["Fashion"],
    deliverable: "Feed + Reels",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dvuza2lpc/video/upload/v1771307308/fashbrew/second2_romz7a.mp4",
    isVideo: true,
    images: ["/portfolio/3second-1.jpg", "/portfolio/3second-2.jpg"],
    metrics: [
      { label: "Engagement Rate", value: "9.2%" },
      { label: "Reach", value: "320K" },
      { label: "Saves", value: "1.8K" },
      { label: "CTR", value: "4.5%" },
    ],
    objective:
      "Showcase summer collection dengan aesthetic yang clean dan relatable untuk target millennials & Gen Z.",
    link: "https://www.instagram.com/p/DFH7bI3zrgV/",
    views: "11.5K",
    likes: "2.8K",
    testimonial:
      "Konten yang dihasilkan menampilkan produk kami dengan cara yang stylish dan autentik. Visualnya clean, estetik, dan benar-benar mencerminkan karakter brand 3Second.",
  },
  {
    id: "studio-foto",
    brand: "Curah Manis",
    title: "Studio Foto Review Series",
    description:
      "Food content series yang memperkenalkan coffee shops lokal di Jember dengan storytelling approach. Fokus pada ambiance, signature drinks, dan local business support.",
    category: ["Lifestyle"],
    deliverable: "Reels + Stories",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dvuza2lpc/video/upload/v1771307309/fashbrew/curah2_rgmlzl.mp4",
    isVideo: true,
    images: ["/portfolio/coffee-1.jpg"],
    metrics: [
      { label: "Engagement Rate", value: "7.8%" },
      { label: "Reach", value: "180K" },
      { label: "Comments", value: "520" },
      { label: "Shares", value: "380" },
    ],
    objective:
      "Support local businesses sambil creating engaging lifestyle content yang relatable dengan local audience.",
    link: "https://www.instagram.com/p/DFCLHCISeqr/",
    views: "175K",
    likes: "683",
    testimonial:
      "Konten ini sangat bermanfaat untuk memperkenalkan coffee shops lokal di Jember. storytellingnya menarik dan benar-benar mencerminkan karakter brand Kopi Jember.",
  },
  {
    id: "rkb-roastery",
    brand: "RKB Roastery",
    title: "Local Coffee Roastery Showcase",
    description:
      "Coffee content series yang mengeksplorasi kualitas kopi lokal Jember melalui storytelling approach. Fokus pada proses roasting, flavor profile, dan mendukung coffee culture lokal.",
    category: ["Food", "Lifestyle"],
    deliverable: "Reels + Stories",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dvuza2lpc/video/upload/v1771257397/fashbrew/kopi_fdlzv0.mp4",
    isVideo: true,
    images: ["/portfolio/coffee-1.jpg"],
    metrics: [
      { label: "Engagement Rate", value: "7.8%" },
      { label: "Reach", value: "180K" },
      { label: "Comments", value: "520" },
      { label: "Shares", value: "380" },
    ],
    objective:
      "Memperkenalkan kualitas kopi specialty lokal sambil creating engaging lifestyle content yang relatable dengan coffee enthusiast dan local audience.",
    link: "https://www.instagram.com/p/C6s7UjwSoIN/",
    views: "784K",
    likes: "683",
    testimonial:
      "Konten yang dibuat sangat autentik dan berhasil menampilkan passion kami terhadap kopi lokal. Storytellingnya engaging dan benar-benar mencerminkan identitas RKB Roastery sebagai local coffee roaster.",
  },
  {
    id: "bukit-nuansa",
    brand: "Bukit Nuansa",
    title: "Restaurant & Culinary Experience Review",
    description:
      "Food content series yang menghadirkan pengalaman kuliner di Bukit Nuansa melalui storytelling approach. Fokus pada menu signature, ambiance restoran, dan kulinary experience untuk family dining.",
    category: ["Food"],
    deliverable: "Reels + Stories",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dvuza2lpc/video/upload/v1771257698/fashbrew/bukit_zcofr6.mp4",
    isVideo: true,
    images: ["/portfolio/restaurant-1.jpg"],
    metrics: [
      { label: "Engagement Rate", value: "8.2%" },
      { label: "Reach", value: "195K" },
      { label: "Comments", value: "580" },
      { label: "Shares", value: "420" },
    ],
    objective:
      "Memperkenalkan Bukit Nuansa sebagai dining destination yang perfect untuk family gathering sambil creating engaging food content yang relatable dengan local audience.",
    link: "https://www.instagram.com/p/DPsg2u_kjtO/",
    views: "10.4K",
    likes: "720",
    testimonial:
      "Kontennya sangat menarik dan berhasil menampilkan suasana Bukit Nuansa dengan apik. Storytelling yang natural membuat audience tertarik untuk datang dan mencoba menu-menu kami. Engagement yang dihasilkan juga luar biasa!",
  },
  {
    id: "caffe-contact",
    brand: "Caffe Contact",
    title: "Coffee Shop Experience Review",
    description:
      "Coffee & lifestyle content series yang mengeksplorasi Caffe Contact sebagai hangout spot favorit di Jember. Fokus pada signature beverages, cozy ambiance, dan community vibe yang cocok untuk millennials & Gen Z.",
    category: ["Food", "Lifestyle"],
    deliverable: "Reels + Stories",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dvuza2lpc/video/upload/v1771258086/fashbrew/contact_l6i2la.mp4",
    isVideo: true,
    images: ["/portfolio/caffe-1.jpg"],
    metrics: [
      { label: "Engagement Rate", value: "8.5%" },
      { label: "Reach", value: "210K" },
      { label: "Comments", value: "650" },
      { label: "Shares", value: "480" },
    ],
    objective:
      "Memposisikan Caffe Contact sebagai go-to coffee shop untuk young professionals dan Gen Z sambil creating engaging lifestyle content yang relatable dengan target audience.",
    link: "https://www.instagram.com/p/DI1EAOpzAWO/",
    views: "26.5K",
    likes: "785",
    testimonial:
      "Konten yang dibuat Rere sangat aesthetic dan on-brand dengan vibe Caffe Contact. Storytellingnya relatable banget dengan audience kami. Setelah konten ini tayang, ada peningkatan signifikan customer yang datang dan mention mereka lihat dari konten Rere!",
  },
  {
    id: "elizabeth-shoes",
    brand: "Elizabeth",
    title: "Footwear Collection Review",
    description:
      "Fashion content series yang showcase koleksi sepatu Elizabeth dengan styling approach. Fokus pada versatility, comfort, dan how to style untuk berbagai occasion dari casual hingga formal looks.",
    category: ["Fashion"],
    deliverable: "Reels + Stories",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dvuza2lpc/video/upload/v1771258648/fashbrew/sepatu_hjzh8g.mp4",
    isVideo: true,
    images: ["/portfolio/shoes-1.jpg"],
    metrics: [
      { label: "Engagement Rate", value: "9.2%" },
      { label: "Reach", value: "225K" },
      { label: "Comments", value: "720" },
      { label: "Shares", value: "540" },
    ],
    objective:
      "Memperkenalkan koleksi Elizabeth sebagai pilihan footwear yang stylish dan comfortable untuk millennials & Gen Z sambil creating engaging fashion content dengan styling tips yang applicable.",
    link: "https://www.instagram.com/p/DF7WY3tz-Yc/",
    views: "29.7K",
    likes: "890",
    testimonial:
      "Konten styling dari Rere sangat kreatif dan berhasil menampilkan versatility produk Elizabeth. Cara dia mix and match sepatu kami dengan berbagai outfit sangat inspiring buat audience. Traffic ke store dan online shop kami meningkat drastis setelah konten ini viral!",
  },
  {
    id: "omg-beauty",
    brand: "OMG Beauty",
    title: "Beauty Products Review & Tutorial",
    description:
      "Beauty content series yang mengeksplorasi produk OMG Beauty melalui honest review dan makeup tutorial. Fokus pada product performance, application tips, dan hasil akhir yang flawless untuk daily hingga glam looks.",
    category: ["Beauty"],
    deliverable: "Reels + Stories",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dvuza2lpc/video/upload/v1771259396/fashbrew/omg_sob9sj.mp4",
    isVideo: true,
    images: ["/portfolio/beauty-1.jpg"],
    metrics: [
      { label: "Engagement Rate", value: "10.5%" },
      { label: "Reach", value: "240K" },
      { label: "Comments", value: "850" },
      { label: "Shares", value: "620" },
    ],
    objective:
      "Memperkenalkan produk OMG Beauty sebagai beauty essential yang affordable dan high-quality untuk millennials & Gen Z sambil creating engaging tutorial content yang educational dan easy to follow.",
    link: "https://www.instagram.com/p/DNFHEkJTP7R/",
    views: "6.5K",
    likes: "950",
    testimonial:
      "Review dan tutorial dari Rere sangat authentic dan detail. Cara dia menjelaskan product benefits dan application technique bikin audience langsung tertarik mencoba. Conversion rate dari konten ini luar biasa, banyak yang langsung order dan mention konten Rere sebagai alasan pembelian!",
  },
  {
    id: "graduation-support",
    brand: "Graduation Support Collaboration",
    title: "Graduation Day Glam & Services Showcase",
    description:
      "Special collaboration content yang menampilkan full graduation day preparation dari makeup, kebaya rental, hingga hairdo. Fokus pada transformation, detail services, dan supporting local beauty & fashion vendors untuk memorable graduation moment.",
    category: ["Beauty", "Fashion"],
    deliverable: "Reels + Stories",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dvuza2lpc/video/upload/v1771259997/fashbrew/MUA_f6wfxg.mp4",
    isVideo: true,
    images: ["/portfolio/graduation-1.jpg"],
    metrics: [
      { label: "Engagement Rate", value: "11.2%" },
      { label: "Reach", value: "260K" },
      { label: "Comments", value: "920" },
      { label: "Shares", value: "780" },
    ],
    objective:
      "Showcase graduation day preparation journey sambil supporting local vendors (MUA, kebaya rental, hairdo services) dan creating inspiring content untuk audience yang akan wisuda.",
    link: "https://www.instagram.com/p/DR2boHiEurD/",
    views: "9.9K",
    likes: "1.1K",
    testimonial:
      "Konten kolaborasi ini sangat membantu memperkenalkan services kami ke audience yang lebih luas. Rere berhasil menampilkan proses transformation dengan sangat menarik dan natural. Setelah konten ini viral, kami kebanjiran booking untuk graduation season, banyak yang reference konten Rere!",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    quote:
      "Kontennya selalu on-brand dan engagement tinggi! Rea ngerti banget gimana cara present produk kita dengan angle yang menarik tapi tetap natural. Collaboration smooth dan hasil memuaskan.",
    author: "Sarah Wijaya",
    role: "Marketing Manager",
    company: "Brand Hijab Premium",
  },
  {
    id: "testimonial-2",
    quote:
      "Profesional, responsive, dan hasil memuaskan. Timeline tepat waktu, komunikasi lancar, dan yang paling penting: konten yang dibuat bener-bener convert jadi sales. Definitely will work together again!",
    author: "Andi Pratama",
    role: "Founder",
    company: "Local Streetwear ID",
  },
  {
    id: "testimonial-3",
    quote:
      "Kolaborasi lancar, audience kami cocok banget! Rea punya understanding yang bagus tentang target market kami. Content performance exceed expectations dan customer feedback sangat positif.",
    author: "Dina Kartika",
    role: "Brand Manager",
    company: "Fashion E-commerce",
  },
];

export const faqs: FAQ[] = [
  {
    id: "faq-1",
    question: "Berapa lama timeline produksi konten?",
    answer:
      "Tergantung deliverable, tapi rata-rata 3-5 hari kerja untuk foto/video, 1-2 hari untuk revisi minor. Untuk campaign besar atau multiple deliverables bisa diatur jadwal lebih fleksibel. Aku selalu usahakan komunikasi yang jelas tentang timeline sejak awal supaya semuanya berjalan smooth.",
  },
  {
    id: "faq-2",
    question: "Apakah ada revisi? Berapa kali?",
    answer:
      "Yes! Termasuk 2x minor revisions dalam package. Minor revision itu seperti color grading adjustment, crop, atau text overlay changes. Untuk major revision (re-shoot atau concept change) bisa dibicarakan dengan additional fee. Tapi so far, jarang banget sampai perlu major revision karena brief di awal sudah detail.",
  },
  {
    id: "faq-3",
    question: "Usage rights kontennya gimana?",
    answer:
      "Usage rights bisa diskusi sesuai kebutuhan brand. Standard package biasanya untuk social media usage (Instagram, TikTok, Facebook) selama 6-12 bulan. Untuk extended usage seperti ads, print, atau commercial purposes ada additional licensing fee. Semua akan dijelaskan detail di contract sebelum project dimulai.",
  },
  {
    id: "faq-4",
    question: "Apakah ada exclusivity period?",
    answer:
      "Untuk competitor exclusivity, biasanya 3-6 bulan tergantung agreement. Artinya dalam periode tersebut aku nggak akan work dengan direct competitor brand di kategori yang sama. Duration dan scope exclusivity bisa disesuaikan dengan budget dan campaign needs. Semua clear dari awal supaya no confusion.",
  },
  {
    id: "faq-5",
    question: "Format deliverables apa saja yang disediakan?",
    answer:
      "Untuk video: MP4 (1080x1920 untuk stories/reels, 1080x1080 untuk feed, atau custom ratio). Untuk foto: high-res JPEG. Semua files dikirim via Google Drive atau WeTransfer. Kalau brand butuh format khusus atau raw files, bisa request dengan additional fee. Include juga basic editing seperti color correction, light retouching, dan watermark removal.",
  },
];
