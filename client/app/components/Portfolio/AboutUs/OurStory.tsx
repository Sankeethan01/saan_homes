"use client";

import { motion } from "framer-motion";
import { RiArrowLeftLine, RiHome5Line, RiCheckLine, RiStarFill, RiUser3Line, RiBuilding2Line, RiToolsLine, RiAwardLine, RiMapPinLine, RiPhoneLine, RiMailLine, RiTimeLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/assets/videos/story.mp4" type="video/mp4" />
                  {/* Fallback image if video doesn't load */}
                  <Image
                    src="/assets/images/construction.png"
                    alt="Construction Site"
                    fill
                    className="object-cover"
                  />
                </video>
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
                SAAN Homes began its journey as a modest construction service provider in Jaffna, Sri Lanka. Over the years, we've grown into a trusted name in the region’s construction industry, recognized for our dedication to quality, innovation, and client satisfaction.
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