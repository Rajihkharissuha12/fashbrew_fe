// components/sections/Contact.tsx
"use client";

import React from "react";
import { MessageCircle, Instagram, Music } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { useInView } from "../hooks/useInView";

export default function Contact() {
  const [ref, isInView] = useInView<HTMLElement>();

  return (
    <section id="contact" ref={ref} className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <Card
          className={`max-w-2xl mx-auto p-8 md:p-12 text-center ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Let&apos;s Create Something Amazing
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Open for brand collaborations & partnerships
          </p>

          <Button
            variant="primary"
            size="lg"
            href="https://wa.me/6281234567890?text=Hallo%20Rayya,%20saya%20tertarik%20untuk%20kolaborasi dengan rere!"
            icon={<MessageCircle className="w-5 h-5" />}
            className="w-full sm:w-auto mb-8"
          >
            Chat di WhatsApp
          </Button>

          <p className="text-sm text-neutral-600 mb-6">
            Biasanya respon dalam 2-4 jam (weekdays)
          </p>

          <div className="flex items-center justify-center gap-6 pt-6 border-t">
            <a
              href="https://instagram.com/_rereamalia_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neutral-600 hover:text-orange-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-1 rounded p-2"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
              <span className="font-medium">Instagram</span>
            </a>
            <a
              href="https://tiktok.com/@rere_feliysia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neutral-600 hover:text-orange-1 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-1 rounded p-2"
              aria-label="TikTok"
            >
              <Music className="w-6 h-6" />
              <span className="font-medium">TikTok</span>
            </a>
          </div>
        </Card>
      </div>
    </section>
  );
}
