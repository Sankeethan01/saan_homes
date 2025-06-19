import { motion } from 'framer-motion';
import { RiHome5Line, RiSearchLine, RiFilter3Line, RiCalendarLine, RiTimeLine, RiMessage2Line, RiUser3Line, RiHomeSmileLine, RiPaletteLine, RiLeafLine, RiToolsLine } from 'react-icons/ri';

const HeroRentalsPortfolio = () => {
  return (
     <section className="relative h-[120vh] bg-gradient-to-br from-blue-600 to-red-700">
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
                   <p className="text-xl text-white/90 leading-relaxed mb-12">
                     Professional-grade construction equipment for your projects. Quality machinery, flexible terms, and expert support.
                   </p>
                   <div className="flex flex-wrap gap-8">
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
             <motion.div
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.8 }}
               className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'radial-gradient(ellipse at 20% 80%, #e0f7fa 0%, #f8fafc 100%)' }}
             />
           </section>
  );
};

export default HeroRentalsPortfolio; 