import { motion } from 'framer-motion';
import { RiHomeSmileLine, RiPaletteLine, RiLeafLine } from 'react-icons/ri';

const HeroServicesPortfolio = () => {
  return (
     <section className="relative h-[100vh] md:h-[70vh] lg:h-[100vh] overflow-hidden bg-[url('/assets/images/bg_hero_service.png')] bg-cover bg-bottom">
       <div className="container mx-auto px-4 h-full flex items-center justify-center md:justify-end relative">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="max-w-3xl md:max-w-2xl lg:max-w-3xl z-10 text-center md:text-right mr-0 -mb-2"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              className="h-1 bg-white mb-8 md:mb-4 lg:mb-8 md:ml-auto md:w-20 lg:ml-0 lg:w-full mx-auto md:mx-0"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 md:mb-4 lg:mb-8 w-full md:w-100 lg:w-2xl text-white leading-tight text-center md:text-right lg:text-right px-4 md:px-0">
            Delivering quality where    {' '}
              <span className="relative">
              every detail
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute bottom-[-4] left-0 h-2 md:h-2 lg:h-3 bg-white/20 -z-10"
                />
              </span>{' '}
              <span className="relative inline-block">
              matters.
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="absolute bottom-0 left-0 h-2 md:h-2 lg:h-3 bg-white/20 -z-10"
                />
              </span>
            </h1>
            <p className="text-lg md:text-base lg:text-xl text-white/90 w-full md:w-90 lg:w-130 mb-8 md:mb-6 lg:mb-12 mr-0 md:mr-0 lg:mr-5 ml-0 md:ml-auto lg:ml-38 text-center md:text-right lg:text-right px-4 md:px-0">
            Every service we provide is rooted in precision, passion, and purpose. We don't just build spaces—we shape experiences that stand the test of time.
            </p>
            <div className="flex flex-wrap -mt-4 md:-mt-3 lg:-mt-6 mb-3 gap-3 md:gap-2 lg:gap-4 justify-center md:justify-end">
              <div className="flex items-center gap-2 md:gap-2 lg:gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <RiHomeSmileLine className="text-lg md:text-lg lg:text-2xl text-white" />
                </div>
                <span className="text-white/90 text-sm md:text-sm lg:text-base">Premium Quality</span>
              </div>
              <div className="flex items-center gap-2 md:gap-2 lg:gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <RiPaletteLine className="text-lg md:text-lg lg:text-2xl text-white" />
                </div>
                <span className="text-white/90 text-sm md:text-sm lg:text-base">Modern Design</span>
              </div>
              <div className="flex items-center gap-2 md:gap-2 lg:gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <RiLeafLine className="text-lg md:text-lg lg:text-2xl text-white" />
                </div>
                <span className="text-white/90 text-sm md:text-sm lg:text-base">Sustainable</span>
              </div>
            </div>
          </motion.div>
          
        </div>
     </section>
  );
};

export default HeroServicesPortfolio; 