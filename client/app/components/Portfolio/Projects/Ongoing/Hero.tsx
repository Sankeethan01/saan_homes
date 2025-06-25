import { motion } from 'framer-motion';

const HeroOngoingProjectsPortfolio = () => {
  return (
     <section className="relative h-[70vh]  py-16 ">
             <div className="absolute inset-0 bg-[#e4f7fd]" />
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 bg-[url('/projects/hero-pattern.png')] bg-repeat opacity-10"
             />
             <div className="container mx-auto px-4 h-[25vh] flex items-center justify-center relative">
               <div className="text-center z-10">
                 <motion.h1 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="text-7xl md:text-7xl font-bold bg-clip-text text-transparent bg-[#003459] mb-10"
                 >
                   Ongoing Projects
                 </motion.h1>
                 <motion.p
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                   className="text-2xl bg-clip-text text-transparent bg-[#076fa9] mx-auto"
                 >
                   We're reframing how companies can think about building. And we're still excited about solutions to create.
                 </motion.p>
               </div>
             </div>
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="relative h-[45vh] w-100% inset-0 bg-[url('/assets/images/img03.jpg')] bg-no-repeat bg-cover bg-center"
             />
           </section>
  );
};

export default HeroOngoingProjectsPortfolio; 