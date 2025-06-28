"use client";

import { motion } from "framer-motion";
import { RiArrowLeftLine, RiHome5Line, RiCheckLine, RiStarFill, RiUser3Line, RiBuilding2Line, RiToolsLine, RiAwardLine, RiMapPinLine, RiPhoneLine, RiMailLine, RiTimeLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import Image from "next/image";

const OurStoryAboutUsPortfolio = () => {


  return (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-[#1b4965] mb-8">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Image
                  src="/assets/images/construction.png"
                  alt="Construction Site"
                  width={500}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-left"
              >
                <h3 className="text-2xl font-semibold text-[#1b4965] mb-4">Building Excellence Since 1998</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  SAAN Homes started as a small construction company in Dubai and has grown into one of the UAE's leading construction and equipment rental providers. Our journey has been marked by innovation, quality, and unwavering commitment to customer satisfaction.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Today, we offer comprehensive construction services and maintain a fleet of over 200 pieces of modern construction equipment available for rental. From residential projects to large-scale commercial developments, we've successfully completed hundreds of projects across the UAE.
                </p>
                <div className="flex items-center space-x-4">
                  <RiCheckLine className="text-green-500 text-2xl" />
                  <span className="text-gray-700 font-medium">Licensed & Insured</span>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <RiCheckLine className="text-green-500 text-2xl" />
                  <span className="text-gray-700 font-medium">ISO Certified</span>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <RiCheckLine className="text-green-500 text-2xl" />
                  <span className="text-gray-700 font-medium">Safety First Approach</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
  );
}

export default OurStoryAboutUsPortfolio;