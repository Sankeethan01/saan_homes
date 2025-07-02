import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';
import Image from 'next/image';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

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
  // Duplicate projects for seamless loop
  const scrollingProjects = [...projects, ...projects];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="projects" className="py-2" style={{ background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%)' }}>
      <div className="container mx-auto px-4">
        <motion.div className="text-center max-w-3xl mx-auto mb-8">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-[#1b4965]"
          >
            Featured Projects
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
          className="relative w-full overflow-x-hidden h-[30rem] -mb-[6]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="flex flex-nowrap gap-8 items-stretch animate-scroll-left"
            style={{
              width: '200%',
              animationDuration: `${animationDuration}s`,
              animationPlayState: isHovered ? 'paused' : 'running',
            }}
          >
            {scrollingProjects.map((project, index) => (
              <div
                key={index}
                className={`group relative w-96 h-[60vh] flex-shrink-0 overflow-hidden rounded-3xl shadow-xl hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-md border-2 border-gray-200 p-0`}
              >
                <div className="relative h-[40vh] overflow-hidden p-0 m-0">
                  <Image 
                    src={project.image} 
                    alt={project.title} 
                    fill
                    className="object-cover w-full !h-[40vh] scale-110 group-hover:scale-125 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-red-100/40 opacity-20 group-hover:opacity-30 transition-opacity" />
                </div>
                <div className="p-6 h-[18vh] flex flex-col justify-center gap-1 mt-2">
                  <span className={`inline-block px-3 py-1 mb-0 text-sm font-medium text-[#1b4965] bg-white/80 backdrop-blur-sm rounded-full`}>
                    {project.category}
                  </span>
                  <h3 className="text-xl font-semibold mb-0 group-hover:text-[#1b4965] transition-colors leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-0 leading-tight">{project.description}</p>
                  <Link href="/projects">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-[#1b4965] font-medium hover:font-maximum transition-colors"
                    >
                      Learn More →
                    </motion.button>
                  </Link>
                </div>
              </div>
            ))}
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
                className="group inline-flex items-center gap-2 text-white px-8 py-3 rounded-full text-lg font-medium bg-[#1b4965] transition-transform duration-500 focus:outline-none mb-8"
              >
                <span>View More</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </motion.button>
          </Link>
        </motion.div>
        {/* Keyframes for scroll animation */}
        <style jsx>{`
          .animate-scroll-left {
            animation: scroll-left linear infinite;
          }
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </section>
  );
};

export default FeaturedProjectsPortfolio;