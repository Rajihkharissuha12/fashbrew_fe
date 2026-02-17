// app/page.tsx
import dynamic from "next/dynamic";
import Navbar from "./components/sections/Navbar";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Services from "./components/sections/Services";
import Testimonials from "./components/sections/Testimonials";
import FAQ from "./components/sections/FAQ";
import Contact from "./components/sections/Contact";
import Footer from "./components/sections/Footer";

// Lazy load Projects section for better performance
const Projects = dynamic(() => import("./components/sections/Projects"), {
  loading: () => (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="text-center">
          <div className="h-8 w-48 bg-gray-200 animate-pulse mx-auto rounded-lg mb-4"></div>
          <div className="h-4 w-96 bg-gray-100 animate-pulse mx-auto rounded-lg"></div>
        </div>
      </div>
    </section>
  ),
});

export default function Home() {
  return (
    <div className="portfolio-wrapper bg-white min-h-screen">
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Services />
        <Projects />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
    </div>
  );
}
