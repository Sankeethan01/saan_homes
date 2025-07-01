"use client";

import { motion } from "framer-motion";
import { RiArrowLeftLine, RiHome5Line, RiCheckLine, RiStarFill, RiUser3Line, RiBuilding2Line, RiToolsLine, RiAwardLine, RiMapPinLine, RiPhoneLine, RiMailLine, RiTimeLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

// Optimized Video Component with Intersection Observer
const LazyAutoplayVideo = ({ src, fallbackImage, className }: { src: string; fallbackImage: string; className: string }) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {!shouldLoad ? (
        // Placeholder before loading
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#1b4965] rounded-lg mx-auto mb-2 opacity-20"></div>
            <p className="text-gray-500 text-sm">Video Loading...</p>
          </div>
        </div>
      ) : hasError ? (
        // Fallback image if video fails
        <Image
          src={fallbackImage}
          alt="Construction Site"
          fill
          className="object-cover rounded-lg"
        />
      ) : (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-lg z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#1b4965] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading Video...</p>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            onLoadedData={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
          >
            <source src={src} type="video/mp4" />
            {/* Fallback image if video doesn't load */}
            <Image
              src={fallbackImage}
              alt="Construction Site"
              fill
              className="object-cover"
            />
          </video>
        </>
      )}
    </div>
  );
};

const OurStoryAboutUsPortfolio = () => {
  return (
    <section className="py-10 bg-white">
        <div className="container mx-auto px-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-[#1b4965] mb-8">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-12 w-full items-center">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative h-96 rounded-lg overflow-hidden shadow-lg"
              >
                <LazyAutoplayVideo
                  src="/assets/videos/story.mp4"
                  fallbackImage="/assets/images/construction.png"
                  className="relative h-96 rounded-lg overflow-hidden shadow-lg"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-left"
              >
                <h3 className="text-2xl font-semibold text-[#1b4965] mb-4">Building Excellence Since 2015</h3>
                <p className="text-gray-600 mb-6 text-justify leading-relaxed">
                SAAN Homes began its journey as a modest construction service provider in Jaffna, Sri Lanka. Over the years, we've grown into a trusted name in the region's construction industry, recognized for our dedication to quality, innovation, and client satisfaction.
                </p>
                <p className="text-gray-600 mb-6 text-justify leading-relaxed">
                Today, we deliver a full spectrum of construction solutions — including new constructions, renovations, interior design, gardening, and carpentry works tailored to meet both residential and commercial needs. We also operate a dependable equipment rental service, supporting contractors and builders across the Northern Province with modern, well-maintained machinery.
                </p>
                <p className="text-gray-600 mb-6 text-justify leading-relaxed">
                Our portfolio reflects not only the diversity of our services but also the strength of our team, the efficiency of our processes, and the long-standing trust of our clients.
                </p>
                <div className="flex items-center space-x-4">
                  <RiCheckLine className="text-green-500 text-2xl" />
                  <span className="text-[#1b4965] font-medium">Licensed & Insured</span>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <RiCheckLine className="text-green-500 text-2xl" />
                  <span className="text-[#1b4965] font-medium">Customer Approach</span>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <RiCheckLine className="text-green-500 text-2xl" />
                  <span className="text-[#1b4965] font-medium">Driven by Quality, Focused on Safety</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
  );
}

export default OurStoryAboutUsPortfolio;