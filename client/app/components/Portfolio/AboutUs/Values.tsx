"use client";

import { motion } from "framer-motion";

import { RiUser3Line, RiBuilding2Line, RiToolsLine, RiAwardLine } from "react-icons/ri";
import { useLanguage } from '../../../context/LanguageContext';


const getValues = (t: any) => [
    {
      icon: RiBuilding2Line,
      title: t.aboutUsPage.values.items.quality.title,
      description: t.aboutUsPage.values.items.quality.description
    },
    {
      icon: RiToolsLine,
      title: t.aboutUsPage.values.items.integrity.title,
      description: t.aboutUsPage.values.items.integrity.description
    },
    {
      icon: RiUser3Line,
      title: t.aboutUsPage.values.items.innovation.title,
      description: t.aboutUsPage.values.items.innovation.description
    },
    {
      icon: RiAwardLine,
      title: t.aboutUsPage.values.items.sustainability.title,
      description: t.aboutUsPage.values.items.sustainability.description
    }
  ];

const ValuesAboutUsPortfolio = () => {
  const { t } = useLanguage();
  return (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1b4965] mb-4">{t.aboutUsPage.values.title}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t.aboutUsPage.values.subtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {getValues(t).map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-gray-50 p-6 rounded-xl shadow-lg text-center"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-[#1b4965] rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <value.icon className="text-white text-2xl" />
                </motion.div>
                <h3 className="text-xl font-semibold text-[#1b4965] mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
}

export default  ValuesAboutUsPortfolio;