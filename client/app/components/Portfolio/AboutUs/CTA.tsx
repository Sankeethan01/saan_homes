"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from '../../../context/LanguageContext';

const CTAAboutUsPortfolio = () => {
    const router = useRouter();
    const { t } = useLanguage();
  return (
    <section className="py-20 bg-[#1b4965] text-white relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/bg01.jpeg"
            alt="CTA Background"
            className="w-full h-full object-cover"
            fill
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-[#1b4965]/50"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">{t.aboutUsPage.cta.title}</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {t.aboutUsPage.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/equipments")}
                className=" border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#1b4965] transition-colors"
              >
                {t.aboutUsPage.cta.getStarted}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/projects")}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#1b4965] transition-colors"
              >
                {t.aboutUsPage.cta.learnMore}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
  );
}

export default CTAAboutUsPortfolio;