import { motion } from 'framer-motion';
import { RiCalendarLine, RiMessage2Line, RiToolsLine } from 'react-icons/ri';
import Image from 'next/image';

const HeroRentalsPortfolio = () => {
  return (
     <section className="relative h-[100vh] md:h-[45vh] lg:h-[100vh] pt-10 m-0">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/hero_rental.png"
            alt="Rental Hero Background"
            fill
            className="object-cover object-center md:object-cover md:object-top lg:object-cover lg:object-center"
            style={{ zIndex: 0 }}
            priority
          />
          
        </div>
        <div className="container !mx-0 px-12 py-50 md:mx-2 md:px-4 md:py-0 mt-0 lg:mx-0 lg:px-12 lg:py-50 h-full flex items-left md:items-start lg:items-left relative z-10">
          <div className="grid md:grid-cols-1 mt-4 lg:grid-cols-2 gap-8 md:gap-6 lg:gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -55 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="max-w-3xl md:max-w-2xl lg:max-w-3xl z-10 md:pt-10 lg:pt-0"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 100 }}
                className="h-1 bg-white mb-8 md:mb-2 lg:mb-8"
              />
              <h1 className="text-6xl md:text-4xl lg:text-6xl font-semibold mb-8 md:mb-4 lg:mb-8 text-white leading-tight md:w-80 lg:w-auto">
                Professional{' '}
                <span className="relative inline-block">
                  equipment
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-3 md:h-2 lg:h-3 bg-white/20 -z-10"
                  />
                </span>{' '}
                <span className="relative inline-block">
                  rentals
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-3 md:h-2 lg:h-3 bg-white/20 -z-10"
                  />
                </span>
              </h1>
              
              <div className="flex flex-col gap-8 md:gap-4 lg:gap-8">
                <div className="flex items-center gap-3 md:gap-2 lg:gap-3">
                  <div className="w-12 h-12 md:w-8 md:h-8 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiToolsLine className="text-2xl md:text-lg lg:text-2xl text-white" />
                  </div>
                  <span className="text-white/90 md:text-sm lg:text-base">Quality Equipment</span>
                </div>
                <div className="flex items-center gap-3 md:gap-2 lg:gap-3">
                  <div className="w-12 h-12 md:w-8 md:h-8 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiCalendarLine className="text-2xl md:text-lg lg:text-2xl text-white" />
                  </div>
                  <span className="text-white/90 md:text-sm lg:text-base">Flexible Terms</span>
                </div>
                <div className="flex items-center gap-3 md:gap-2 lg:gap-3">
                  <div className="w-12 h-12 md:w-8 md:h-8 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiMessage2Line className="text-2xl md:text-lg lg:text-2xl text-white" />
                  </div>
                  <span className="text-white/90 md:text-sm lg:text-base">Expert Support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
  );
};

export default HeroRentalsPortfolio; 