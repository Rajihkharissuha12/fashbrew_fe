// components/sections/Services.tsx
"use client";

import React from "react";
import {
  Video,
  Sparkles,
  ShoppingBag,
  Instagram,
  TrendingUp,
  Users,
} from "lucide-react";
import Card from "../ui/Card";
import { useInView } from "../hooks/useInView";
import { services } from "../../lib/data";

const iconMap = {
  Video,
  Sparkles,
  ShoppingBag,
  Instagram,
  TrendingUp,
  Users,
};

export default function Services() {
  const [ref, isInView] = useInView<HTMLElement>();

  return (
    <section id="services" ref={ref} className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div
          className={`text-center mb-12 ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Content & Services
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Konten berkualitas yang disesuaikan dengan brand identity Anda —
            dari fashion OOTD sampai live selling yang converting
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <Card
                key={service.id}
                hover
                className={`p-6 relative group transition-all duration-300 ${
                  isInView ? "animate-fade-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${(index + 1) * 75}ms` }}
              >
                {service.popular && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-orange-1 text-white text-xs font-bold rounded-full shadow-md">
                    Most Popular
                  </span>
                )}
                <div className="w-14 h-14 rounded-xl bg-orange-3 flex items-center justify-center mb-4 group-hover:bg-orange-2 transition-colors">
                  <Icon className="w-7 h-7 text-orange-1 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-neutral-900">
                  {service.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                  {service.description}
                </p>
                {service.examples && (
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <p className="text-xs text-neutral-500 font-medium mb-1">
                      Contoh Format:
                    </p>
                    <p className="text-xs text-neutral-600">
                      {service.examples}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Additional Info - Content Quality Guarantee */}
        <div
          className={`mt-12 max-w-4xl mx-auto ${
            isInView ? "animate-fade-up" : "opacity-0"
          } [animation-delay:500ms]`}
        >
          <Card className="p-6 md:p-8 bg-orange-3/30 border-orange-2">
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-900">
                Semua Konten Mencakup:
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-neutral-700">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-1 flex-shrink-0" />
                  <span>Professional Editing</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-1 flex-shrink-0" />
                  <span>SEO & Hashtag Strategy</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-orange-1 flex-shrink-0" />
                  <span>Engagement Monitoring</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
