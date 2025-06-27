import { motion } from 'framer-motion';
import { RiHome5Line, RiSearchLine, RiFilter3Line, RiCalendarLine, RiTimeLine, RiMessage2Line, RiUser3Line, RiHomeSmileLine, RiPaletteLine, RiLeafLine, RiToolsLine } from 'react-icons/ri';

const HeroRentalsPortfolio = () => {
  return (
     <section className="relative h-[105vh] pt-0 m-0">
        <div className="absolute inset-0">
          <img
            src="/assets/images/hero_rental.png"
            alt="Rental Hero Background"
            className="w-full h-full object-cover object-center"
            style={{ zIndex: 0 }}
          />
          
        </div>
        <div className="container mx-7 px-20 py-50 h-full flex items-left relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -55 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="max-w-3xl z-10"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 100 }}
                className="h-1 bg-white mb-8"
              />
              <h1 className="text-6xl font-light mb-8 text-white leading-tight">
                Professional{' '}
                <span className="relative inline-block">
                  equipment
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-3 bg-white/20 -z-10"
                  />
                </span>{' '}
                <span className="relative inline-block">
                  rentals
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-3 bg-white/20 -z-10"
                  />
                </span>
              </h1>
              
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiToolsLine className="text-2xl text-white" />
                  </div>
                  <span className="text-white/90">Quality Equipment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiCalendarLine className="text-2xl text-white" />
                  </div>
                  <span className="text-white/90">Flexible Terms</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiMessage2Line className="text-2xl text-white" />
                  </div>
                  <span className="text-white/90">Expert Support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
  );
};

export default HeroRentalsPortfolio; 