// components/sections/FAQ.tsx
"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useInView } from "../hooks/useInView";
import { faqs } from "../../lib/data";

export default function FAQ() {
  const [ref, isInView] = useInView<HTMLElement>();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" ref={ref} className="py-16 md:py-24 bg-orange-3/30">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div
          className={`text-center mb-12 ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            FAQ
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Pertanyaan yang sering ditanya seputar kolaborasi
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-orange-3/20 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-1 focus:ring-inset"
                aria-expanded={openIndex === index}
              >
                <span className="font-bold text-lg pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-orange-1 flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-neutral-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
