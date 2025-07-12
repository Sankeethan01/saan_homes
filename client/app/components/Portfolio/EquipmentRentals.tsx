import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const equipments = [
  {
    name: 'Excavators',
    description: 'Available for daily, weekly, or monthly rental.',
    image: '/assets/images/equipments/excavator.jpeg',
  },
  {
    name: 'Grader',
    description: 'Available for daily, weekly, or monthly rental.',
    image: '/assets/images/equipments/grader.jpeg',
  },
  {
    name: 'Scaffolding',
    description: 'Available for daily, weekly, or monthly rental.',
    image: '/assets/images/equipments/scaffolding.png',
  },
  {
    name: 'Jackhammers',
    description: 'Available for daily, weekly, or monthly rental.',
    image: '/assets/images/equipments/jackhammer.png',
  },
  {
    name: 'Wheelborror',
    description: 'Available for daily, weekly, or monthly rental.',
    image: '/assets/images/equipments/wheelborrow.png',
  },
  {
    name: 'Concrete Mixers',
    description: 'Available for daily, weekly, or monthly rental.',
    image: '/assets/images/equipments/concretemixer.png',
  },
];

const animationDuration = 18; // seconds, medium speed

const EquipmentRentalsPortfolio = () => {
  // Duplicate for seamless loop
  const scrollingEquipments = [...equipments, ...equipments];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="rentals" className="py-2 !h-[85vh]" style={{ background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%)' }}>
      <div className="container mx-auto px-4">
        <motion.div className="text-center max-w-3xl mx-auto mb-8">
          <motion.h2
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-[#1b4965]"
          >
            Equipment Rentals
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gray-600 text-xl md:text-2xl"
          >
            From Concept to Concrete – Our Finest Work !!!
          </motion.p>
        </motion.div>
        {/* Horizontal scroll animation */}
        <div
          className="relative w-full overflow-x-hidden !h-[28rem]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            className="flex flex-nowrap gap-8 items-stretch"
            style={{
              width: `${scrollingEquipments.length * 24}rem`,
              animationName: 'scroll-right',
              animationDuration: `${animationDuration}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationPlayState: isHovered ? 'paused' : 'running',
            }}
          >
            {scrollingEquipments.map((equipment, index) => (
              <div
                key={index}
                className="group relative w-96 h-[26rem] flex-shrink-0 overflow-hidden rounded-3xl  transition-all duration-300 bg-white/80 backdrop-blur-md border-2 border-gray-200"
              >
                <div className="relative !h-[18rem] overflow-hidden">
                  <img src={equipment.image} alt={equipment.name} className="object-fill w-full !h-[18rem] group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6 !h-[8rem]">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#1b4965] transition-colors">{equipment.name}</h3>
                  <p className="text-gray-600">{equipment.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-5"
        >
          <Link href="/equipments">
          <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2 text-white px-8 py-3 rounded-full text-lg font-medium bg-[#1b4965] transition-transform duration-500 focus:outline-none mb-8"
              >
                <span>Rent Equipment</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </motion.button>
          </Link>
        </motion.div>
        {/* Keyframes for scroll animation */}
        <style>{`
          @keyframes scroll-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
        `}</style>
      </div>
    </section>
  );
};

export default EquipmentRentalsPortfolio; 