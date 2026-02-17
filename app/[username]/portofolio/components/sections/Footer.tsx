// components/sections/Footer.tsx
import React from "react";
import {
  Instagram,
  Music,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";
import Button from "../ui/Button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className=" text-white">
      {/* Main Footer Content */}
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                Rere Amalia
              </h3>
              <p className="text-gray-400 mb-4 leading-relaxed max-w-md">
                Fashion & Beauty Influencer dengan 110K+ engaged community.
                Spesialisasi dalam konten aesthetically pleasing dan
                conversion-driven untuk brand millennials & Gen Z.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-2 flex-shrink-0" />
                  <span>Based in Jember, Indonesia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-2 flex-shrink-0" />
                  <a
                    href="https://wa.me/6285178421126"
                    className="hover:text-orange-2 transition-colors"
                  >
                    +62 851-7842-1126
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="#about"
                    className="hover:text-orange-2 transition-colors inline-block"
                  >
                    About Me
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="hover:text-orange-2 transition-colors inline-block"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#portfolio"
                    className="hover:text-orange-2 transition-colors inline-block"
                  >
                    Portfolio
                  </a>
                </li>
                <li>
                  <a
                    href="#packages"
                    className="hover:text-orange-2 transition-colors inline-block"
                  >
                    Packages
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="hover:text-orange-2 transition-colors inline-block"
                  >
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media & Stats */}
            <div>
              <h4 className="font-bold text-lg mb-4">Follow My Journey</h4>
              <p className="text-sm text-gray-400 mb-4">
                Join 110K+ followers untuk daily inspiration & updates
              </p>
              <div className="flex gap-4 mb-6">
                <a
                  href="https://instagram.com/_rereamalia_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-neutral-800 hover:bg-orange-1 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-1"
                  aria-label="Instagram - 46K Followers"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://tiktok.com/@rere_feliysia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-neutral-800 hover:bg-orange-1 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-1"
                  aria-label="TikTok - 64K Followers"
                >
                  <Music className="w-5 h-5" />
                </a>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <p>📸 Instagram: 46K+ Followers</p>
                <p>🎵 TikTok: 64K+ Followers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800 py-6">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© {currentYear} Rere Amalia. All rights reserved.</p>

            <p className="text-xs text-gray-600">
              Built with 💜 by{" "}
              <a
                href="https://www.instagram.com/aisolusimuda/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-2 transition-colors"
              >
                Advanced Integration Solutions
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
