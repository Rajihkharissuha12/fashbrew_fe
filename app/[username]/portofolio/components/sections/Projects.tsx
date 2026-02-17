// components/sections/Projects.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ExternalLink, TrendingUp, Eye, Heart, Share2 } from "lucide-react";
import Card from "../ui/Card";
import Modal, { ModalImageGallery } from "../ui/Modal";
import Button from "../ui/Button";
import { useInView } from "../hooks/useInView";
import { projects, type Project } from "../../lib/data";

const categories = ["All", "Fashion", "Beauty", "Food", "Lifestyle"];

export default function Projects() {
  const [ref, isInView] = useInView<HTMLElement>();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredProjects =
    selectedCategory === "All"
      ? projects.slice(0, 9)
      : projects
          .filter((p) => p.category.includes(selectedCategory))
          .slice(0, 9);

  const handleOpenModal = (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (selectedProject) {
      setCurrentImageIndex(
        (prev) => (prev + 1) % selectedProject.images.length,
      );
    }
  };

  const handlePreviousImage = () => {
    if (selectedProject) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + selectedProject.images.length) %
          selectedProject.images.length,
      );
    }
  };

  return (
    <section id="portfolio" ref={ref} className="py-16 md:py-24 bg-orange-3/30">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div
          className={`text-center mb-12 ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Portfolio Highlights
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Konten berkualitas yang telah dipercaya oleh brand ternama — dari
            fashion lokal sampai beauty internasional
          </p>
        </div>

        {/* Social Proof Banner */}
        {/* <div
          className={`max-w-4xl mx-auto mb-10 ${
            isInView ? "animate-fade-up" : "opacity-0"
          } [animation-delay:100ms]`}
        >
          <Card className="p-6 bg-white border-orange-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-heading font-bold text-orange-1">
                  30+
                </div>
                <div className="text-sm text-neutral-600 mt-1">
                  Brand Collaborations
                </div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-orange-1">
                  200+
                </div>
                <div className="text-sm text-neutral-600 mt-1">
                  Content Created
                </div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-orange-1">
                  8.5%
                </div>
                <div className="text-sm text-neutral-600 mt-1">
                  Avg. Engagement
                </div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-orange-1">
                  5M+
                </div>
                <div className="text-sm text-neutral-600 mt-1">
                  Total Impressions
                </div>
              </div>
            </div>
          </Card>
        </div> */}

        {/* Category Filter */}
        <div
          className={`flex gap-2 sm:gap-3 overflow-x-auto pb-4 mb-6 sm:mb-8 md:mb-10 scrollbar-hide justify-start sm:justify-center px-4 sm:px-0 ${
            isInView ? "animate-fade-up" : "opacity-0"
          } [animation-delay:150ms]`}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-2.5 mt-3 sm:mt-4 md:mt-5 rounded-full text-sm sm:text-base font-medium whitespace-nowrap transition-all flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-orange-1 focus:ring-offset-2 ${
                selectedCategory === category
                  ? "bg-orange-1 text-white shadow-lg scale-105"
                  : "bg-white text-neutral-700 hover:bg-orange-3 hover:text-orange-1"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredProjects.map((project, index) => (
            <Card
              key={project.id}
              hover
              onClick={() => window.open(project.link, "_blank")}
              className={`overflow-hidden cursor-pointer group ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${(index + 3) * 60}ms` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {project.isVideo ? (
                  <video
                    src={project.thumbnail}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    muted
                    loop
                    playsInline
                    autoPlay
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Image
                    src={project.thumbnail}
                    alt={`${project.brand} - ${project.title}`}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4 !text-white">
                    <p className="text-sm font-medium mb-1 ">View Case Study</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {project.views || "2.5K"}
                      </span>
                      {/* <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {project.likes || "180"}
                      </span> */}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-orange-1 bg-orange-3 px-3 py-1 rounded-full">
                    {project.deliverable}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">
                    {project.year}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-1 text-neutral-900 group-hover:text-orange-1 transition-colors">
                  {project.brand}
                </h3>
                <p className="text-sm text-neutral-600 mb-3 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More Indicator */}
        <div
          className={`text-center mt-10 ${
            isInView ? "animate-fade-up" : "opacity-0"
          } [animation-delay:600ms]`}
        >
          {selectedCategory === "All" ? (
            <p className="text-neutral-600 text-sm mb-4">
              Showing 9 of 30+ successful collaborations
            </p>
          ) : (
            <p className="text-neutral-600 text-sm mb-4">
              {filteredProjects.length} project
              {filteredProjects.length !== 1 ? "s" : ""} in {selectedCategory}
            </p>
          )}
          <Button
            variant="outline"
            href="https://www.instagram.com/_rereamalia_"
            icon={<ExternalLink className="w-4 h-4" />}
          >
            View More on Instagram
          </Button>
        </div>
      </div>

      {/* Modal - Enhanced */}
      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.title}
      >
        {selectedProject && (
          <div>
            <ModalImageGallery
              images={selectedProject.images}
              currentIndex={currentImageIndex}
              onPrevious={handlePreviousImage}
              onNext={handleNextImage}
            />

            <div className="space-y-6">
              {/* Header Info */}
              <div>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="px-3 py-1 bg-orange-3 text-orange-1 font-bold text-sm rounded-full">
                    {selectedProject.deliverable}
                  </span>
                  <span className="text-neutral-600 text-sm">
                    {selectedProject.year}
                  </span>
                  {selectedProject.category.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold mb-3 text-neutral-900">
                  {selectedProject.brand}
                </h3>
                <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                  {selectedProject.description}
                </p>
              </div>

              {/* Campaign Objectives */}
              {selectedProject.objective && (
                <div className="bg-orange-3/30 p-5 rounded-xl">
                  <h4 className="font-bold text-sm text-neutral-500 uppercase tracking-wide mb-2">
                    Campaign Objective
                  </h4>
                  <p className="text-neutral-700 leading-relaxed">
                    {selectedProject.objective}
                  </p>
                </div>
              )}

              {/* Performance Metrics */}
              <div>
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-1" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedProject.metrics.map((metric, index) => (
                    <div
                      key={index}
                      className="text-center p-4 bg-gradient-to-br from-orange-3/40 to-orange-3/10 rounded-xl border border-orange-3"
                    >
                      <div className="text-2xl md:text-3xl font-heading font-bold text-orange-1">
                        {metric.value}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1 font-medium">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial if available */}
              {selectedProject.testimonial && (
                <div className="bg-white p-6 rounded-xl border-l-4 border-orange-1">
                  <p className="text-neutral-700 italic leading-relaxed mb-3">
                    "{selectedProject.testimonial}"
                  </p>
                  <p className="text-sm font-medium text-neutral-900">
                    — {selectedProject.brand} Team
                  </p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex gap-3">
                {selectedProject.link && (
                  <Button
                    variant="primary"
                    href={selectedProject.link}
                    icon={<ExternalLink className="w-4 h-4" />}
                    className="flex-1"
                  >
                    View Live Content
                  </Button>
                )}
                <Button
                  variant="outline"
                  href="https://wa.me/6285178421126?text=Hallo%20Rere%2C%20mau%20kolaborasi%20seperti%20project%20ini"
                  className="flex-1"
                >
                  Similar Collaboration
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
