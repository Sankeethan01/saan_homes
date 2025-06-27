import { motion } from 'framer-motion';

const HeroUpcomingProjectsPortfolio = () => {
  return (
    <section className="relative h-[100vh] py-16 overflow-hidden">
    <div className="absolute inset-0 w-full h-full bg-[url('/assets/images/hero_pro.png')] bg-cover bg-center z-0" />
    <div className="container mx-auto px-4 h-[25vh] flex items-center justify-start relative z-10">
      <div className="z-10 text-left">
       <motion.div
       initial={{ width: 0 }}
       animate={{ width: 100 }}
       className="h-1 bg-white mb-8"
     />
     <h1 className="text-6xl font-light mt-150 mb-8 w-xl align-baseline text-white leading-tight text-left">
     
       <span className="relative">
       From Vision to Reality,
         <motion.div
           initial={{ width: 0 }}
           animate={{ width: '100%' }}
           transition={{ delay: 0.5, duration: 0.8 }}
           className="absolute bottom-[-6] left-0 h-3 bg-white/20 -z-10"
         />
       </span>{' '}
       <span className="relative inline-block">
       Coming Soon!!!
         <motion.div
           initial={{ width: 0 }}
           animate={{ width: '100%' }}
           transition={{ delay: 0.8, duration: 0.8 }}
           className="absolute bottom-[-9] left-0 h-3 bg-white/20 -z-10"
         />
       </span>
     </h1>
     <p className="text-xl text-white/90 w-160 leading-relaxed mb-12 text-justify">
     From concept to construction, our upcoming projects mark the beginning of a bold new chapter. SAAN Excellence Engineering PVT LTD is proud to shape the skylines of the future with sustainable, forward-thinking developments built on trust and excellence.
      </p>
        
      </div>
    </div>
  </section>
  );
};

export default HeroUpcomingProjectsPortfolio; 