import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

// Keep original English project data since it comes from admin and is changeable
const projects = [
  {
    title: 'Modern Villa',
    category: 'Residential',
    image: '/assets/images/projects/home01.jpg',
    description: 'Contemporary design with sustainable features',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Commercial Complex',
    category: 'Commercial',
    image: '/assets/images/projects/home02.jpg',
    description: 'State-of-the-art office spaces',
    bgColor: 'bg-red-50'
  },
  {
    title: 'Luxury Apartments',
    category: 'Multi-Family',
    image: '/assets/images/projects/home03.jpg',
    description: 'High-end residential complex',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Shopping Mall',
    category: 'Retail',
    image: '/assets/images/projects/home04.jpg',
    description: 'Modern shopping experience center',
    bgColor: 'bg-yellow-50'
  },
  {
    title: 'Smart Homes',
    category: 'Residential',
    image: '/assets/images/projects/home05.jpg',
    description: 'Technology-integrated living spaces',
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Industrial Park',
    category: 'Industrial',
    image: '/assets/images/projects/home06.jpg',
    description: 'Large-scale industrial development',
    bgColor: 'bg-indigo-50'
  }
];

const animationDuration = 18; // seconds, medium speed

const FeaturedProjectsPortfolio = () => {
  const { t } = useLanguage();
  // Duplicate projects for seamless loop
  const scrollingProjects = [...projects, ...projects];
  const [isHovered, setIsHovered] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  const nextProject = () => {
    setCurrentProjectIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentProjectIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  return (
    <section id="projects" className="py-8 md:py-2 md:!h-[85vh]" style={{ background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%)' }}>
      <div className="container mx-auto px-4">
        <motion.div className="text-center max-w-3xl mx-auto mb-8">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl sm:text-3xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-[#1b4965]"
          >
            {t.projects.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gray-600 text-lg sm:text-xl md:text-2xl"
          >
            {t.projects.subtitle}
          </motion.p>
        </motion.div>

        {/* Mobile Carousel Layout */}
        <div className="block md:hidden">
          {/* Center Project Card */}
          <div className="flex justify-center mb-4">
            <motion.div
              key={currentProjectIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="group relative w-80 overflow-hidden rounded-3xl shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-md border-2 border-gray-200"
            >
              <div className="relative h-48 overflow-hidden">
                <Image 
                  src={projects[currentProjectIndex].image} 
                  alt={projects[currentProjectIndex].title} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-red-100/40 opacity-20 group-hover:opacity-30 transition-opacity" />
              </div>
              <div className="p-4">
                <span className="inline-block px-3 py-1 mb-2 text-xs font-medium text-[#1b4965] bg-white/80 backdrop-blur-sm rounded-full">
                  {projects[currentProjectIndex].category}
                </span>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#1b4965] transition-colors">
                  {projects[currentProjectIndex].title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{projects[currentProjectIndex].description}</p>
                <Link href="/projects">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#1b4965] font-medium hover:font-semibold transition-colors text-sm"
                  >
                    Learn More →
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center items-center gap-8 mb-4">
            <motion.button
              onClick={prevProject}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200"
            >
              <svg className="w-6 h-6 text-[#1b4965]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <span className="text-sm text-gray-500">
              {currentProjectIndex + 1} / {projects.length}
            </span>
            <motion.button
              onClick={nextProject}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200"
            >
              <svg className="w-6 h-6 text-[#1b4965]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Desktop/Tablet Horizontal Scroll Layout */}
        <div className="hidden md:block">
          <div
            className="relative w-full overflow-x-hidden !h-[28rem]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              className="flex flex-nowrap gap-8 items-stretch"
              style={{
                width: `${scrollingProjects.length * 24}rem`,
                animationName: 'scroll-left',
                animationDuration: `${animationDuration}s`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
                animationPlayState: isHovered ? 'paused' : 'running',
              }}
            >
              {scrollingProjects.map((project, index) => (
                <div
                  key={index}
                  className="group relative w-96 h-[26rem] flex-shrink-0 overflow-hidden rounded-3xl transition-all duration-300 bg-white/80 backdrop-blur-md border-2 border-gray-200"
                >
                  <div className="relative !h-[18rem] overflow-hidden">
                    <Image 
                      src={project.image} 
                      alt={project.title} 
                      className="object-fill w-full !h-[18rem] group-hover:scale-110 transition-transform duration-500"
                      width={400}
                      height={288}
                    />
                  </div>
                  <div className="p-6 !h-[8rem]">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-[#1b4965] transition-colors">{project.title}</h3>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-2"
        >
          <Link href="/projects">
          <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2 text-white px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-medium bg-[#1b4965] transition-transform duration-500 focus:outline-none mb-8"
              >
                <span>View More</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </motion.button>
          </Link>
        </motion.div>
        {/* Keyframes for scroll animation */}
        <style>{`
          @keyframes scroll-left {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
        `}</style>
      </div>
    </section>
  );
};

export default FeaturedProjectsPortfolio;