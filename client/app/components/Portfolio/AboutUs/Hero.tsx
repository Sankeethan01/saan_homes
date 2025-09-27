"use client";

import { motion } from "framer-motion";
import Image from "next/image";


const HeroAboutUsPortfolio = () => {


  return (
    <section className="relative h-[75vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/hero_about_us.png"
            alt="Project Hero Background"
            className="w-full h-full object-cover object-center"
            style={{ zIndex: 0 }}
            fill
            priority
          />
          
        </div>

        <div className="container mx-auto px-4 h-full flex items-end-safe justify-right relative z-10">
        <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="max-w-3xl z-10"
            >
                
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 100 }}
                className="h-1 bg-white mb-8"
              />
              
              <h1 className="text-6xl font-semibold mb-8 w-xl text-white leading-tight">
                <span className="relative block mb-4">
                About
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '35%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-[-4] left-0 h-3 bg-white/20 -z-10"
                  />
                </span>
                <span className="relative inline-block">
                SAAN Homes.
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-3 bg-white/20 -z-10"
                  />
                </span>
              </h1>
              <p className="text-xl text-white/90 w-130 leading-relaxed mb-12">
              Decades of Dedication, One Solid Reputation.
              </p>
              
            </motion.div>
        </div>
      </section>
  );
}

export default HeroAboutUsPortfolio;