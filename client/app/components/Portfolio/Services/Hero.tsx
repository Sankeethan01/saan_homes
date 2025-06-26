import { motion } from 'framer-motion';
import { RiHome5Line, RiHomeSmileLine, RiPaletteLine, RiLeafLine } from 'react-icons/ri';

const HeroServicesPortfolio = () => {
  return (
     <section className="relative h-[120vh] bg-gradient-to-br from-[#6d84ad] to-[#92a3c1]">
             <div className="absolute inset-0 bg-black/30" />
             <div className="container mx-auto px-4 h-full flex items-center relative">
               <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                   <h1 className="text-6xl font-light mb-8 text-white leading-tight">
                     Experience services that{' '}
                     <span className="relative">
                       redefine
                       <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: '100%' }}
                         transition={{ delay: 0.5, duration: 0.8 }}
                         className="absolute bottom-0 left-0 h-3 bg-white/20 -z-10"
                       />
                     </span>{' '}
                     <span className="relative inline-block">
                       excellence
                       <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: '100%' }}
                         transition={{ delay: 0.8, duration: 0.8 }}
                         className="absolute bottom-0 left-0 h-3 bg-white/20 -z-10"
                       />
                     </span>
                   </h1>
                   <p className="text-xl text-white/90 leading-relaxed mb-12">
                     We're reframing how companies can think about building.
                   </p>
                   <div className="flex flex-wrap gap-8">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                         <RiHomeSmileLine className="text-2xl text-white" />
                       </div>
                       <span className="text-white/90">Expert Service</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                         <RiPaletteLine className="text-2xl text-white" />
                       </div>
                       <span className="text-white/90">Creative Solutions</span>
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
             </div>
             
           </section>
  );
};

export default HeroServicesPortfolio; 