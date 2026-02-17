// components/sections/Hero.tsx
"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle, MessageCircle } from "lucide-react";
import Button from "../ui/Button";
import { useInView } from "../hooks/useInView";

export default function Hero() {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.2 });

  const stats = [
    { value: "110K+", label: "Total Followers" },
    { value: "350K+", label: "Avg. Monthly Reach" },
    { value: "50+", label: "Live Sessions" },
  ];

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center pt-20 pb-16 md:pb-24"
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div
            className={`space-y-8 ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight text-neutral-900">
              Mengubah Produk Anda Menjadi{" "}
              <span className="text-orange-1">Trending Topic</span> di Kalangan
              Gen Z
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-xl">
              Fashion & Beauty Influencer dengan 110K+ engaged community. Brand
              Ambassador Rikas Aesthetic yang menghasilkan 300+ leads per
              kampanye.
            </p>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-3 gap-4 py-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-orange-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-500 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-500 -mt-4">Data per Feb 2026</p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4 items-center pt-2">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Brand Ambassador Rikas Aesthetic</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>3+ Tahun Pengalaman</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                href="https://wa.me/6285178421126?text=Hallo%20Rere%2C%20mau%20endorse%20dong"
                icon={<MessageCircle className="w-5 h-5" />}
              >
                Konsultasi Gratis — Collab Sekarang
              </Button>
              <Button
                variant="outline"
                href="https://wa.me/6285178421126?text=Halo%20Rere%2C%20boleh%20minta%20rate%20card?"
              >
                Request Rate Card
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div
            className={`relative ${
              isInView ? "animate-fade-up" : "opacity-0"
            } [animation-delay:150ms]`}
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://res.cloudinary.com/dvuza2lpc/image/upload/v1751820222/fashbrew/Outfit_today_Cardi_rajut_under_100k_%EF%B8%8F_shanumastore_ootd_cardi_cardigan_cardiganmurah_fjeohb.webp" // Sesuaikan dengan path actual
                alt="Rere Amalia - Fashion & Beauty Influencer Jember"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -z-10 top-8 right-8 w-full h-full bg-orange-3 rounded-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
