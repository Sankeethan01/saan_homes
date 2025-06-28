"use client";

import { motion } from "framer-motion";
import { RiArrowLeftLine, RiHome5Line, RiCheckLine, RiStarFill, RiUser3Line, RiBuilding2Line, RiToolsLine, RiAwardLine, RiMapPinLine, RiPhoneLine, RiMailLine, RiTimeLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import Image from "next/image";

const HeroAboutUsPortfolio = () => {


  return (
    <section className="relative h-[60vh] bg-[#1b4965] overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b4965] to-[#2d5a7a]" />
        
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full" />
          <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-full" />
          <div className="absolute bottom-20 left-1/3 w-20 h-20 border border-white/20 rounded-full" />
        </motion.div>

        <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              About SAAN Homes
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl max-w-3xl mx-auto"
            >
              Leading construction company and equipment rental provider in the UAE
            </motion.p>
          </motion.div>
        </div>
      </section>
  );
}

export default HeroAboutUsPortfolio;