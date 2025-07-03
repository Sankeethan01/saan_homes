import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import ThreeDViewer from '../ThreeDViewer';

const HeroPortfolio = () => {
  const [expCount, setExpCount] = useState(0);
  const [projCount, setProjCount] = useState(0);
  const [awardCount, setAwardCount] = useState(0);

  useEffect(() => {
    let exp = 0, proj = 0, award = 0;
    const expTarget = 10, projTarget = 500, awardTarget = 50;
    const interval = setInterval(() => {
      if (exp < expTarget) exp++;
      if (proj < projTarget) proj += 10;
      if (award < awardTarget) award++;
      setExpCount(exp > expTarget ? expTarget : exp);
      setProjCount(proj > projTarget ? projTarget : proj);
      setAwardCount(award > awardTarget ? awardTarget : award);
      if (exp >= expTarget && proj >= projTarget && award >= awardTarget) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="min-h-screen h-[100vh] flex items-center bg-white relative overflow-hidden">
      {/* Left: Text and Search */}
      <div className="w-full md:w-2/3 flex flex-col justify-center px-6 md:px-25 py-30 z-10 mt-56 -mb-[20]">
        <motion.h1
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-xl md:text-6xl lg:text-5.8xl font-bold text-gray-800 -mb-[5] leading-tight"
        >
          DREAM. <br /> DESIGN. <br /> DEVELOP. <br />
          <span className="text-[#1b4965]">With Trusted Expertise.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-[#175676] text-lg-justify md:text-xl mb-5 max-w-xl"
        >
          Design and Build Your Dream House At Affordable Prices, But With The Best Quality. Only Available In SAAN HOMES!
        </motion.p>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-md mb-10">

                     <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(27,38,59,0.8)]">
             <div className="text-3xl md:text-4.5xl font-bold text-[#1b4965]">{expCount}<span className="text-[#1b4965]">+</span></div>
            <div className="text-gray-400 text-sm md:text-base mt-1 text-center">Experience</div>
          </div>
           <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(27,38,59,0.8)]">
             <div className="text-3xl md:text-4.5xl font-bold text-[#1b4965]">{projCount}<span className="text-[#1b4965]">+</span></div>
            <div className="text-gray-400 text-sm md:text-base mt-1 text-center">Services</div>
          </div>
           <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(27,38,59,0.8)]">
             <div className="text-3xl md:text-4.5xl font-bold text-[#1b4965]">{awardCount}<span className="text-[#1b4965]">+</span></div>
            <div className="text-gray-400 text-sm md:text-base mt-1 text-center">Completed Projects</div>
          </div>
        </div>
      </div>
      {/* Right: Image */}
      <div className="hidden md:block md:w-7/13 h-full absolute right-0 top-0 bottom-0 z-0">
        <div className="w-full h-full flex items-center justify-center -mt-5 -ml-0">
          <ThreeDViewer />
        </div>
        {/* Diagonal overlay for style */}
        <div className="absolute inset-0 bg-[#1b4965] opacity-100 z-[-1] [clip-path:polygon(20%_0,100%_0,100%_100%,0_100%)]" />
      </div>
    </section>
  );
};

export default HeroPortfolio; 