"use client";
import React, { useState } from "react";
import { Mail, Instagram, Send, MapPin, Music2 } from "lucide-react";

export default function CoffeeFooter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (message.trim()) {
      const subject = encodeURIComponent("Saran & Kritik dari Pengguna");
      const body = encodeURIComponent(`Email: ${email}\n\nPesan:\n${message}`);
      const mailtoLink = `mailto:otatixx@gmail.com?subject=${subject}&body=${body}`;

      window.location.href = mailtoLink;

      setIsSubmitted(true);
      setEmail("");
      setMessage("");

      // Reset notifikasi setelah 3 detik
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <footer className="bg-white">
      {/* Top border - responsif */}
      <div className="h-0.5 sm:h-px bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Content Container - responsif alignment */}
        <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
          {/* Copyright text - responsif typography dan spacing */}
          <p className="text-gray-600 text-xs sm:text-sm md:text-base flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-1.5 text-center">
            <span>© 2025 Fashbrew.</span>
            <span className="hidden sm:inline">Dibuat oleh</span>
            <span className="sm:hidden">Dibuat oleh</span>
            <a
              href="https://www.instagram.com/aisolusimuda/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-orange-600 hover:text-orange-700 active:text-orange-800 transition-colors inline-flex items-center gap-1 sm:gap-1.5"
            >
              Advanced Integration Solutions
              <svg
                className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </p>
        </div>
      </div>

      {/* Bottom accent - responsif */}
      <div className="h-0.5 sm:h-px bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400" />
    </footer>
  );
}
