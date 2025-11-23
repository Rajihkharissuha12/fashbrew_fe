"use client";

import Head from "next/head";
import { useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Link2,
  Image as ImageIcon,
  DollarSign,
  Camera,
  ShoppingBag,
  BarChart3,
  Palette,
  Zap,
  Smartphone,
  Check,
  ChevronDown,
  Instagram,
  Music,
  ArrowDown,
} from "lucide-react";

export default function HomeClient() {
  const { scrollYProgress } = useScroll();
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  // Semua state, hooks, dan interactive logic disini
  return (
    <>
      <Head>
        <title>Fashbreew - Ubah OOTD Kamu Jadi Cuan dengan Satu Link</title>
        <meta
          name="description"
          content="Platform affiliate khusus fashion creator Indonesia. Pajang outfit favoritmu, share produk yang kamu pakai, dan mulai hasilkan komisi—semua dalam satu halaman personal yang aesthetic."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="Fashbreew - Platform Affiliate untuk Fashion Creator"
        />
        <meta
          property="og:description"
          content="Ubah OOTD kamu jadi cuan dengan satu link. Hanya Rp 150.000/bulan."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-orange-500 origin-left z-50"
          style={{ scaleX: scaleProgress }}
        />

        {/* Navigation */}
        {/* <Navigation /> */}

        {/* Hero Section */}
        <HeroSection />

        {/* Problem Statement */}
        <ProblemSection />

        {/* Features */}
        <FeaturesSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Pricing */}
        <PricingSection />

        {/* Use Cases */}
        <UseCasesSection />

        {/* FAQ */}
        <FAQSection />

        {/* Final CTA */}
        <FinalCTASection />

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

// ==================== COMPONENTS ====================

function HeroSection() {
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 via-orange-25 to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, #f97316 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        {/* Beta Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-4 md:mb-6"
        >
          <motion.span
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(249, 115, 22, 0.4)",
                "0 0 0 10px rgba(249, 115, 22, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-4 md:px-6 py-2 md:py-3 bg-orange-500 text-white rounded-full text-sm md:text-base font-semibold shadow-lg inline-block"
          >
            🎉 Beta Version - Hanya Rp 150.000/bulan
          </motion.span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight px-4"
        >
          Ubah OOTD Kamu
          <br />
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Jadi Cuan
          </span>{" "}
          dengan Satu Link
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 md:mb-10 max-w-4xl mx-auto leading-relaxed px-4"
        >
          Platform affiliate khusus fashion creator. Pajang outfit favoritmu,
          share produk yang kamu pakai, dan mulai hasilkan komisi—semua dalam
          satu halaman personal yang aesthetic
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled
            className="px-8 md:px-10 py-4 md:py-5 bg-gray-300 text-gray-500 rounded-full text-lg md:text-xl font-semibold cursor-not-allowed inline-flex items-center gap-2 mb-4"
          >
            Coming Soon 🚀
          </motion.button>
          <p className="text-sm md:text-base text-gray-500 mb-12 md:mb-16">
            Platform sedang dalam tahap beta testing
          </p>
        </motion.div>

        {/* Mockup Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 md:mt-16 relative max-w-5xl mx-auto"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-orange-200"
          >
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-xl">
              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="flex items-center gap-3 md:gap-4 mb-6"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                  FC
                </div>
                <div className="text-left">
                  <div className="h-4 md:h-5 w-28 md:w-40 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 md:h-4 w-40 md:w-56 bg-gray-100 rounded"></div>
                </div>
              </motion.div>
              {/* OOTD Grid */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square bg-gradient-to-br from-orange-200 via-orange-100 to-orange-50 rounded-lg md:rounded-xl cursor-pointer"
                  ></motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-12 md:mt-16"
        >
          <ArrowDown className="w-6 h-6 md:w-8 md:h-8 mx-auto text-orange-500" />
        </motion.div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    {
      icon: Link2,
      title: "Berantakan",
      description:
        "Link produk tersebar di mana-mana, followers bingung mau klik yang mana",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: ImageIcon,
      title: "OOTD Sia-sia",
      description:
        "Konten outfit cuma jadi archive, padahal bisa jadi sumber income",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: DollarSign,
      title: "Komisi Hilang",
      description:
        "Followers nanya link tapi kamu telat reply, komisi melayang",
      color: "from-amber-500 to-yellow-500",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12 md:mb-16"
        >
          Capek Ribet Atur Link di Bio?
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {problems.map((problem, idx) => (
            <AnimatedCard key={idx} delay={idx * 0.2}>
              <div className="text-center p-6 md:p-8 bg-gray-50 rounded-2xl hover:shadow-xl transition-all duration-300 h-full">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-gradient-to-br ${problem.color} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <problem.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  {problem.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Camera,
      title: "Catalog OOTD",
      description:
        "Pajang semua outfit looks kamu dalam gallery yang aesthetic. Setiap OOTD bisa di-tag dengan produk yang kamu pakai",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: ShoppingBag,
      title: "Catalog Produk",
      description:
        "Tambahkan affiliate link produk fashion favoritmu. Followers langsung bisa belanja dari link kamu",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Track berapa banyak klik, view, dan conversion dari setiap OOTD dan produk yang kamu share",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Palette,
      title: "Personal Page",
      description:
        "Dapatkan link khusus fashbreew.com/username yang bisa kamu taruh di bio Instagram, TikTok, atau platform lain",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Zap,
      title: "Setup Cepat",
      description:
        "Daftar dan langsung aktif dalam hitungan menit. No coding, no ribet",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description:
        "Tampilan perfect di semua device. Followers kamu bisa browse dengan nyaman",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-orange-50">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4 md:mb-6"
        >
          Semua OOTD & Produk Kamu
          <br className="hidden sm:block" />
          dalam Satu Tempat
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 text-center mb-12 md:mb-16 max-w-3xl mx-auto"
        >
          Fashbreew bikin hidup kamu sebagai fashion creator jadi lebih gampang
          dan profitable
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <AnimatedCard key={idx} delay={idx * 0.15}>
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Daftar Gratis",
      description:
        "Buat akun dan dapatkan link personal kamu di fashbreew.com/username",
    },
    {
      number: "2",
      title: "Upload OOTD & Produk",
      description:
        "Tambahin foto outfit kamu dan link affiliate produk yang kamu pakai",
    },
    {
      number: "3",
      title: "Share & Earn",
      description:
        "Bagikan link kamu di social media dan mulai hasilkan komisi dari setiap pembelian",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12 md:mb-16"
        >
          Mulai dalam 3 Langkah Simpel
        </motion.h2>
        <div className="space-y-8 md:space-y-12">
          {steps.map((step, idx) => (
            <AnimatedCard key={idx} delay={idx * 0.3}>
              <div className="flex items-start gap-4 md:gap-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="flex-shrink-0 w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-xl"
                >
                  {step.number}
                </motion.div>
                <div className="flex-1 pt-2 md:pt-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const features = [
    "Unlimited OOTD uploads",
    "Unlimited affiliate products",
    "Personal branded page",
    "Analytics dashboard",
    "Mobile responsive",
    "Priority support",
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4 md:mb-6"
        >
          Harga yang Ramah di Kantong Creator
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 text-center mb-12 md:mb-16"
        >
          Investasi kecil untuk hasil yang maksimal
        </motion.p>

        <div className="max-w-lg mx-auto">
          <AnimatedCard delay={0.4}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-10 border-2 border-orange-500 relative"
            >
              <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
                <motion.span
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(249, 115, 22, 0.4)",
                      "0 0 0 15px rgba(249, 115, 22, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-orange-500 text-white px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-semibold shadow-lg inline-block"
                >
                  🚀 Beta Access - Limited Slots
                </motion.span>
              </div>
              <div className="text-center mt-6 md:mt-8">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
                >
                  Rp 150.000
                  <span className="text-xl md:text-2xl text-gray-600 font-normal">
                    /bulan
                  </span>
                </motion.div>
                <p className="text-gray-600 mb-8">
                  Akses penuh semua fitur premium
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {features.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    </motion.div>
                    <span className="text-gray-700 text-base md:text-lg">
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled
                className="w-full py-4 md:py-5 bg-gray-300 text-gray-500 rounded-full text-lg md:text-xl font-semibold cursor-not-allowed"
              >
                Coming Soon
              </motion.button>
            </motion.div>
          </AnimatedCard>
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const useCases = [
    {
      emoji: "👗",
      title: "Fashion Blogger",
      description:
        "Showcase daily OOTD dan share produk ke audience dengan lebih terstruktur",
    },
    {
      emoji: "📷",
      title: "Content Creator",
      description:
        "Monetize konten fashion kamu tanpa ribet manage banyak link",
    },
    {
      emoji: "🌟",
      title: "Micro Influencer",
      description:
        "Mulai journey affiliate marketing dengan platform yang simple dan terjangkau",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12 md:mb-16"
        >
          Perfect untuk Fashion Creator Seperti Kamu
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {useCases.map((useCase, idx) => (
            <AnimatedCard key={idx} delay={idx * 0.2}>
              <motion.div
                whileHover={{ y: -10 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border border-gray-100 h-full"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: idx * 0.5,
                  }}
                  className="text-6xl md:text-7xl mb-4"
                >
                  {useCase.emoji}
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {useCase.description}
                </p>
              </motion.div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "Kapan Fashbreew bisa dipakai?",
      answer:
        "Kami sedang dalam tahap beta testing. Daftar waitlist untuk jadi yang pertama tahu saat kami launching!",
    },
    {
      question: "Apakah ada biaya setup?",
      answer:
        "Tidak ada! Cukup bayar subscription bulanan Rp 150.000 untuk akses semua fitur",
    },
    {
      question: "Bisa integrasi dengan platform affiliate apa saja?",
      answer:
        "Kamu bisa pakai link affiliate dari platform manapun (Shopee, Tokopedia, Zalora, dll)",
    },
    {
      question: "Apakah data analytics real-time?",
      answer:
        "Yes! Kamu bisa track performance OOTD dan produk kamu secara real-time di dashboard",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12 md:mb-16"
        >
          Yang Sering Ditanyain
        </motion.h2>
        <div className="space-y-4 md:space-y-6">
          {faqs.map((faq, idx) => (
            <AnimatedCard key={idx} delay={idx * 0.1}>
              <FAQItem question={faq.question} answer={faq.answer} />
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 md:py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-base md:text-lg pr-8">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-orange-500 flex-shrink-0" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-5 md:pb-6 text-gray-600 leading-relaxed">
          {answer}
        </div>
      </motion.div>
    </motion.div>
  );
}

function FinalCTASection() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
      />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6"
        >
          Jadilah Creator Pertama yang Pakai Fashbreew
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-orange-100 mb-8 md:mb-10"
        >
          Platform masih dalam tahap beta. Kami akan segera launching dengan
          fitur-fitur keren untuk fashion creator Indonesia
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled
          className="px-8 md:px-10 py-4 md:py-5 bg-white text-gray-400 rounded-full text-lg md:text-xl font-semibold cursor-not-allowed inline-flex items-center gap-2"
        >
          Coming Soon - Stay Tuned! 🎉
        </motion.button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent"
          >
            Fashbreew
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mt-2 md:mt-3 mb-6 md:mb-8 text-base md:text-lg"
          >
            Your Fashion, Your Link, Your Income
          </motion.p>
          <div className="flex justify-center gap-6 md:gap-8 mb-8">
            <motion.a
              href="#"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-orange-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-7 h-7 md:w-8 md:h-8" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-orange-400 transition-colors"
              aria-label="TikTok"
            >
              <Music className="w-7 h-7 md:w-8 md:h-8" />
            </motion.a>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-sm md:text-base"
          >
            © 2025 Fashbreew. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
}

// ==================== UTILITY COMPONENTS ====================

function AnimatedCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}
