'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../../context/LanguageContext';


const CallActionsRentalsPortfolio = () => {
  const { t } = useLanguage();
  return (
    <section className="py-16  relative overflow-hidden">
      {/* White texture image overlay */}
      <Image
        src="/assets/images/bg01.jpeg"
        alt="White Texture"
        fill
        className="object-cover opacity-30 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      
      {/* Right bottom animated image */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', delay: 0.1 }}
        className="absolute right-0 bottom-0 w-[32rem] md:w-[48rem] pointer-events-none select-none"
        style={{ zIndex: 1 }}
      >
        <Image
          src="/assets/images/bg02.png"
          alt="Right Decoration"
          width={768}
          height={400}
          className="w-full h-auto"
      />
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center text-[#1b4965]">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-6 text-[#1b4965]"
          >
            {t.rentalsPage.callAction.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl mb-8 text-[#1b4965]"
          >
            {t.rentalsPage.callAction.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <Link href="/dashboard/login">
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2 text-white px-8 py-3 rounded-full text-lg font-medium bg-[#1b4965] transition-transform duration-500 focus:outline-none mb-8"
              >
                <span>{t.rentalsPage.callAction.login}</span>
                
              </motion.button>
            </Link>
            <Link href="/equipments/contact">
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2 text-white px-8 py-3 rounded-full text-lg font-medium bg-[#1b4965] transition-transform duration-500 focus:outline-none mb-8"
              >
                <span>{t.rentalsPage.callAction.rentalInquiry}</span>
                
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
export default CallActionsRentalsPortfolio; 