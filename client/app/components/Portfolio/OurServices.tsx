import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';

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

const services = [
  {
    label: 'Construction',
    image: '/assets/images/construction.png',
    tagline: 'Expert construction services with attention to detail.'
  },
  {
    label: 'Renovation',
    image: '/assets/images/renovation.png',
    tagline: 'Transforming spaces to new heights.'
  },
  {
    label: 'Interior Design',
    image: '/assets/images/interior.png',
    tagline: 'Beautiful, functional spaces tailored to your needs.'
  },
  {
    label: 'Garden Setup',
    image: '/assets/images/garden.png',
    tagline: 'Lush gardens and outdoor spaces for every home.'
  },
  {
    label: 'Equipment Rentals',
    image: '/assets/images/equipment_rental.png',
    tagline: 'Modern equipment and property rentals for every project.'
  },
  {
    label: 'Carpentry Works',
    image: '/assets/images/carpentary.png',
    tagline: 'Custom woodwork solutions crafted with precision.'
  }
];

const OurServicesPortfolio = () => {
  return (
    <section
      className="py-15 md:py-20"
      style={{
        background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%)'
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 px-4 items-end">
        {/* Left Section: Heading + Button + 2 Grids */}
        <div className="flex flex-col justify-between h-full text-left w-full md:w-1/2">
          <div className="flex flex-col items-start w-full">
            <motion.h2
              {...fadeInUp}
              className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-[#1b4965]"
            >
              Our Services
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-gray-600 text-xl mb-6"
            >
              From Concept to Concrete – Our Finest Work !!!
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
              className="relative flex flex-col items-center justify-end bg-white rounded-xl shadow-lg transition-all duration-300 min-h-[290px] min-w-[290px] w-[290px] h-[290px] border border-blue-100 cursor-pointer overflow-hidden"
              style={{ transition: 'background 0.3s' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = '#1b4965')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'white')
              }
            >
              <img
                src={services[5].image}
                alt={services[5].label}
                className="w-full h-full p-0 object-contain z-10"
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
              className="relative flex flex-col items-center justify-end bg-white rounded-xl shadow-lg transition-all duration-300 min-h-[290px] min-w-[290px] w-[290px] h-[290px] border border-blue-100 cursor-pointer overflow-hidden"
              style={{ transition: 'background 0.3s' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = '#1b4965')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'white')
              }
            >
              <img
                src={services[2].image}
                alt={services[2].label}
                className="w-full h-full p-0 object-contain z-10"
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
        <div className="grid grid-cols-2 grid-rows-2 gap-x-20 gap-y-8 justify-items-center w-full md:w-1/2">
          {services
            .filter((s) => s.label !== 'Interior Design' && s.label !== 'Carpentry Works')
            .map((service) => (
              <motion.div
                key={service.label}
                {...gridFadeInUp}
                whileHover={{ scale: 1.05 }}
                className="relative flex flex-col items-center justify-center bg-white rounded-xl shadow-lg transition-all duration-300 min-h-[290px] min-w-[290px] w-[290px] h-[290px] border border-blue-100 cursor-pointer overflow-hidden"
                style={{ transition: 'background 0.3s' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = '#1b4965')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'white')
                }
              >
                <img
                  src={service.image}
                  alt={service.label}
                  className="w-full h-full p-0 object-contain z-10"
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
    </section>
  );
};

export default OurServicesPortfolio;
