import { motion } from 'framer-motion';

const HeroUpcomingProjectsPortfolio = () => {
  return (
     <section className="relative h-[40vh] bg-gradient-to-br from-blue-600 to-red-700">
             <div className="absolute inset-0 bg-black/30" />
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 bg-[url('/projects/hero-pattern.png')] bg-repeat opacity-10"
             />
             <div className="container mx-auto px-4 h-full flex items-center justify-center relative">
               <div className="text-center z-10">
                 <motion.h1 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="text-5xl md:text-7xl font-bold text-white mb-6"
                 >
                   Upcoming Projects
                 </motion.h1>
                 <motion.p
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                   className="text-xl text-white/90 max-w-3xl mx-auto"
                 >
                   We're reframing how companies can think about building. And we're still excited about solutions to create.
                 </motion.p>
               </div>
             </div>
           </section>
  );
};

export default HeroUpcomingProjectsPortfolio; 