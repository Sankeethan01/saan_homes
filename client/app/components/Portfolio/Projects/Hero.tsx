'use client';

import { motion } from 'framer-motion';
import { RiHomeSmileLine, RiPaletteLine, RiLeafLine } from 'react-icons/ri';
import Image from 'next/image';

const HeroProjectsPortfolio = () => {
   
  return (
    <section className="relative h-[100vh] md:h-[45vh] lg:h-[100vh] pt-35  m-0">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/hero_project.png"
            alt="Project Hero Background"
            fill
            className="object-cover object-center md:object-cover md:object-top lg:object-cover lg:object-center"
            style={{ zIndex: 0 }}
            priority
          />
          
        </div>
        <div className="container mx-auto px-4 h-full flex items-center md:items-start relative">
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 md:gap-6 lg:gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="max-w-3xl md:max-w-2xl lg:max-w-3xl z-10 md:pt-16 lg:pt-0"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 100 }}
                className="h-1 bg-white mb-8 md:mb-2 lg:mb-8"
              />
              <h1 className="text-6xl md:text-3xl lg:text-6xl font-semi mb-8 md:mb-3 lg:mb-8 w-2xl md:w-80 lg:w-2xl text-white leading-tight">
              Transforming blueprints into  {' '}
                <span className="relative">
                benchmarks of
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-[-4] left-0 h-3 md:h-1.5 lg:h-3 bg-white/20 -z-10"
                  />
                </span>{' '}
                <span className="relative inline-block">
                excellence.
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-3 md:h-1.5 lg:h-3 bg-white/20 -z-10"
                  />
                </span>
              </h1>
              <p className="text-xl md:text-sm lg:text-xl text-white/90 w-130 md:w-72 lg:w-130 leading-relaxed mb-12 md:mb-4 lg:mb-12">
                Each structure we create is a reflection of our commitment to excellence and forward-thinking. 
                Together, we build for a future that lasts beyond today.
              </p>
              <div className="flex flex-wrap -mt-6 md:-mt-2 lg:-mt-6 mb-3 gap-4 md:gap-1.5 lg:gap-4">
                <div className="flex items-center gap-3 md:gap-1.5 lg:gap-3">
                  <div className="w-12 h-12 md:w-6 md:h-6 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiHomeSmileLine className="text-2xl md:text-sm lg:text-2xl text-white" />
                  </div>
                  <span className="text-white/90 md:text-xs lg:text-base">Premium Quality</span>
                </div>
                <div className="flex items-center gap-3 md:gap-1.5 lg:gap-3">
                  <div className="w-12 h-12 md:w-6 md:h-6 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiPaletteLine className="text-2xl md:text-sm lg:text-2xl text-white" />
                  </div>
                  <span className="text-white/90 md:text-xs lg:text-base">Modern Design</span>
                </div>
                <div className="flex items-center gap-3 md:gap-1.5 lg:gap-3">
                  <div className="w-12 h-12 md:w-6 md:h-6 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiLeafLine className="text-2xl md:text-sm lg:text-2xl text-white" />
                  </div>
                  <span className="text-white/90 md:text-xs lg:text-base">Sustainable</span>
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
        
      </section>
  );
}

export default HeroProjectsPortfolio;
