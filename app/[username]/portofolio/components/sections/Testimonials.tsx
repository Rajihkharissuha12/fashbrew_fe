// components/sections/Testimonials.tsx
"use client";

import React from "react";
import { Quote } from "lucide-react";
import Card from "../ui/Card";
import { useInView } from "../hooks/useInView";
import { testimonials } from "../../lib/data";

export default function Testimonials() {
  const [ref, isInView] = useInView<HTMLElement>();

  return (
    <section id="testimonials" ref={ref} className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div
          className={`text-center mb-12 ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            What Brands Say
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Feedback dari brand partner yang pernah kolaborasi
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className={`p-8 ${isInView ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <Quote className="w-10 h-10 text-orange-2 mb-4" />
              <p className="text-lg italic text-text mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="border-t pt-4">
                <p className="font-bold text-text">{testimonial.author}</p>
                <p className="text-sm text-neutral-600">
                  {testimonial.role} @ {testimonial.company}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
