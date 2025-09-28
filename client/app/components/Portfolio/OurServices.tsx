import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const gridFadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

const getServices = (t: any) => [
  {
    label: t.services.items.construction.title,
    image: '/assets/images/construction.png',
    tagline: t.services.items.construction.tagline
  },
  {
    label: t.services.items.renovation.title,
    image: '/assets/images/renovation.png',
    tagline: t.services.items.renovation.tagline
  },
  {
    label: t.services.items.interiorDesign.title,
    image: '/assets/images/interior.png',
    tagline: t.services.items.interiorDesign.tagline
  },
  {
    label: t.services.items.gardenSetup.title,
    image: '/assets/images/garden.png',
    tagline: t.services.items.gardenSetup.tagline
  },
  {
    label: t.services.items.equipmentRentals.title,
    image: '/assets/images/equipment_rental.png',
    tagline: t.services.items.equipmentRentals.tagline
  },
  {
    label: t.services.items.carpentryWorks.title,
    image: '/assets/images/carpentary.png',
    tagline: t.services.items.carpentryWorks.tagline
  }
];

const OurServicesPortfolio = () => {
  const { t } = useLanguage();
  const services = getServices(t);
  
  return (
    <section id="services" className="py-8 sm:py-12 md:py-16 lg:py-20" style={{ background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header Section - Mobile & Tablet */}
        <div className="text-center mb-8 sm:mb-12 lg:hidden">
          <motion.h2
            {...fadeInUp}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-[#1b4965]"
          >
            {t.services.title}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gray-600 text-base sm:text-lg md:text-xl mb-6 sm:mb-8"
          >
            {t.services.subtitle}
          </motion.div>
          <Link href="/services">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium bg-[#1b4965] transition-transform duration-500 focus:outline-none"
            >
              <span>View More</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </motion.button>
          </Link>
        </div>

        {/* Mobile Layout - Single Column */}
        <div className="block lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.label}
                {...gridFadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative flex flex-col items-center justify-center bg-white hover:bg-[#1b4965] rounded-xl shadow-lg transition-all duration-300 h-70 !sm:h-72 md:h-80 border border-blue-100 cursor-pointer overflow-hidden group"
              >
                <Image
                  src={service.image}
                  alt={service.label}
                  fill
                  className="object-contain z-10 p-4 sm:p-6"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1b4965] opacity-0 group-hover:opacity-90 transition-opacity duration-300 z-20 text-center px-4 sm:px-6">
                  <div className="text-white text-lg sm:text-xl font-bold mb-2">
                    {service.label}
                  </div>
                  <div className="text-blue-100 text-sm sm:text-base">
                    {service.tagline}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Layout - Original Design */}
        <div className="hidden lg:block">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-end">
            {/* Left Section: Heading + Button + 2 Grids */}
            <div className="flex flex-col justify-between h-full text-left w-full lg:w-1/2">
              <div className="flex flex-col items-start w-full">
                <motion.h2
                  {...fadeInUp}
                  className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-[#1b4965]"
                >
                  {t.services.title}
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-gray-600 text-xl mb-6"
                >
                  {t.services.subtitle}
                </motion.div>
                <Link href="/services">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.97 }}
                    className="group inline-flex items-center gap-2 text-white px-8 py-3 rounded-full text-lg font-medium bg-[#1b4965] transition-transform duration-500 focus:outline-none mb-8"
                  >
                    <span>View More</span>
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </motion.button>
                </Link>
              </div>

              {/* Interior Design & Carpentry Works Grids in Row */}
              <div className="flex gap-6 justify-end">
                {/* Carpentry Works Card */}
                <motion.div
                  {...gridFadeInUp}
                  whileHover={{ scale: 1.05 }}
                  className="relative flex flex-col items-center justify-end bg-white hover:bg-[#1b4965] rounded-xl shadow-lg transition-all duration-300 min-h-[290px] min-w-[290px] w-[290px] h-[290px] border border-blue-100 cursor-pointer overflow-hidden"
                >
                  <Image
                    src={services[5].image}
                    alt={services[5].label}
                    fill
                    className="p-0 object-contain z-10"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1b4965] opacity-0 hover:opacity-85 transition-opacity duration-300 z-20 text-center px-4">
                    <div className="text-white text-xl font-bold mb-2">
                      {services[5].label}
                    </div>
                    <div className="text-blue-100 text-base">
                      {services[5].tagline}
                    </div>
                  </div>
                </motion.div>

                {/* Interior Design Card */}
                <motion.div
                  {...gridFadeInUp}
                  whileHover={{ scale: 1.05 }}
                  className="relative flex flex-col items-center justify-end bg-white hover:bg-[#1b4965] rounded-xl shadow-lg transition-all duration-300 min-h-[290px] min-w-[290px] w-[290px] h-[290px] border border-blue-100 cursor-pointer overflow-hidden"
                >
                  <Image
                    src={services[2].image}
                    alt={services[2].label}
                    fill
                    className="p-0 object-contain z-10"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1b4965] opacity-0 hover:opacity-85 transition-opacity duration-300 z-20 text-center px-4">
                    <div className="text-white text-xl font-bold mb-2">
                      {services[2].label}
                    </div>
                    <div className="text-blue-100 text-base">
                      {services[2].tagline}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Section: 2x2 Grid (excluding Interior Design & Carpentry) */}
            <div className="grid grid-cols-2 grid-rows-2 gap-x-20 gap-y-8 justify-items-center w-full lg:w-1/2">
              {services
                .filter((s) => s.label !== 'Interior Design' && s.label !== 'Carpentry Works')
                .map((service) => (
                  <motion.div
                    key={service.label}
                    {...gridFadeInUp}
                    whileHover={{ scale: 1.05 }}
                    className="relative flex flex-col items-center justify-center bg-white hover:bg-[#1b4965] rounded-xl shadow-lg transition-all duration-300 min-h-[290px] min-w-[290px] w-[290px] h-[290px] border border-blue-100 cursor-pointer overflow-hidden"
                  >
                    <Image
                      src={service.image}
                      alt={service.label}
                      fill
                      className="p-0 object-contain z-10"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1b4965] opacity-0 hover:opacity-85 transition-opacity duration-300 z-20 text-center px-4">
                      <div className="text-white text-xl font-bold mb-2">
                        {service.label}
                      </div>
                      <div className="text-blue-100 text-base">
                        {service.tagline}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurServicesPortfolio;
