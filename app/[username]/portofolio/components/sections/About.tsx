// components/sections/About.tsx
"use client";

import React from "react";
import {
  Sparkles,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  Video,
} from "lucide-react";
import Card from "../ui/Card";
import { useInView } from "../hooks/useInView";

export default function About() {
  const [ref, isInView] = useInView<HTMLElement>();

  const reasons = [
    {
      icon: Target,
      title: "Targeted Audience",
      description:
        "75% female millennials & Gen Z dengan purchasing power tinggi yang aktif melakukan pembelian online",
    },
    {
      icon: TrendingUp,
      title: "Proven Results",
      description:
        "8.5% avg. engagement rate — 3x lebih tinggi dari industry standard (2.5-3%)",
    },
    {
      icon: CheckCircle,
      title: "Professional & Reliable",
      description:
        "On-time delivery, clear communication, dan dedicated support untuk setiap kampanye kolaborasi",
    },
  ];

  return (
    <section id="about" ref={ref} className="py-16 md:py-24 bg-orange-3/30">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div
          className={`max-w-4xl mx-auto text-center mb-12 ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Meet Rere Amalia
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-neutral-700 mb-4">
            <span className="font-semibold text-neutral-900">
              "Fashion is my language, beauty is my passion."
            </span>
          </p>
          <p className="text-lg md:text-xl leading-relaxed text-neutral-600">
            Saya Rere Amalia, dan selama <strong>3+ tahun</strong> saya
            membangun komunitas <strong>110K+ followers</strong> yang aktif dan
            engaged di Instagram & TikTok. Tidak hanya angka — saya fokus pada
            koneksi autentik yang membuat audiens{" "}
            <strong className="text-orange-1">percaya dan bertindak</strong>.
          </p>
        </div>

        {/* Proven Track Record */}
        <div
          className={`max-w-4xl mx-auto mb-12 ${
            isInView ? "animate-fade-up" : "opacity-0"
          } [animation-delay:100ms]`}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <Card hover className="p-6 bg-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-3 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-orange-1" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">
                    Proven Track Record
                  </h4>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Brand Ambassador <strong>Rikas Aesthetic</strong> —
                    Menghasilkan{" "}
                    <strong className="text-orange-1">
                      300+ leads per kampanye
                    </strong>{" "}
                  </p>
                </div>
              </div>
            </Card>

            <Card hover className="p-6 bg-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-3 flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-orange-1" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">
                    Live Selling Expert
                  </h4>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Pengalaman <strong>50+ live sessions</strong> untuk brand
                    fashion & beauty. Gaya membawaan yang warm & engaging
                    membuat audiens nyaman bertransaksi langsung.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <h3
            className={`text-2xl md:text-3xl font-heading font-bold text-center mb-8 ${
              isInView ? "animate-fade-up" : "opacity-0"
            } [animation-delay:200ms]`}
          >
            Why Brands Choose Rere Amalia
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {reasons.map((reason, index) => (
              <Card
                key={index}
                hover
                className={`p-6 ${isInView ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-orange-3 flex items-center justify-center mb-4">
                    <reason.icon className="w-7 h-7 text-orange-1" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">{reason.title}</h4>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
