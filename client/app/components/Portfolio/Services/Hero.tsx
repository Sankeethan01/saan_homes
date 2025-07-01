import { motion } from 'framer-motion';
import { RiHomeSmileLine, RiPaletteLine, RiLeafLine } from 'react-icons/ri';

const HeroServicesPortfolio = () => {
  return (
     <section className="relative h-[100vh] overflow-hidden bg-[url('/assets/images/bg_hero_service.png')] bg-cover bg-bottom">
       <div className="container mx-auto px-4 h-full flex items-center justify-end relative">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="max-w-3xl z-10 text-right mr-0 -mb-2"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              className="h-1 bg-white mb-8"
            />
            <h1 className="text-6xl font-semibold mb-8 w-2xl text-white leading-tight text-right">
            Delivering quality where    {' '}
              <span className="relative">
              every detail
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute bottom-[-4] left-0 h-3 bg-white/20 -z-10"
                />
              </span>{' '}
              <span className="relative inline-block">
              matters.
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="absolute bottom-0 left-0 h-3 bg-white/20 -z-10"
                />
              </span>
            </h1>
            <p className="text-xl text-white/90 w-130  mb-12 mr-5 ml-38 text-right ">
            Every service we provide is rooted in precision, passion, and purpose. We don’t just build spaces—we shape experiences that stand the test of time.
            </p>
            <div className="flex flex-wrap -mt-6 mb-3 gap-4 justify-end">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <RiHomeSmileLine className="text-2xl text-white" />
                </div>
                <span className="text-white/90">Premium Quality</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <RiPaletteLine className="text-2xl text-white" />
                </div>
                <span className="text-white/90">Modern Design</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <RiLeafLine className="text-2xl text-white" />
                </div>
                <span className="text-white/90">Sustainable</span>
              </div>
            </div>
          </motion.div>
          
        </div>
     </section>
  );
};

export default HeroServicesPortfolio; 