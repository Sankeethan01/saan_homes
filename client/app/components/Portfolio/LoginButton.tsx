"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RiUser3Line } from 'react-icons/ri';

const LoginButtonPortfolio = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Get current section based on scroll position
      const sections = [
        { id: 'home', element: document.getElementById('home') },
        { id: 'services', element: document.getElementById('services') },
        { id: 'projects', element: document.getElementById('projects') },
        { id: 'rentals', element: document.getElementById('rentals') },
        { id: 'about', element: document.getElementById('about') },
        { id: 'testimonials', element: document.getElementById('testimonials') },
        { id: 'contact', element: document.getElementById('contact') },
        { id: 'footer', element: document.querySelector('footer') }
      ];

      let currentSectionId = '';
      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
            currentSectionId = section.id;
            break;
          }
        }
      }

      // Show button when not in hero section (home) and not in footer
      // Also show when scrolled past a certain point
      const shouldShow = scrollY > windowHeight * 0.5 && 
                        currentSectionId !== 'home' && 
                        currentSectionId !== 'footer' &&
                        scrollY < documentHeight - windowHeight * 0.3;

      setIsVisible(shouldShow);
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Add resize listener to recalculate on window resize
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isVisible ? 1 : 0, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className="fixed bottom-22 right-6 z-50"
      style={{
        display: isVisible ? 'block' : 'none'
      }}
    >
      <Link href="/dashboard/login">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-[#1b4965] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          style={{
            boxShadow: '0 10px 25px rgba(27, 73, 101, 0.3)'
          }}
          aria-label="Login to Dashboard"
        >
          <RiUser3Line className="text-2xl" />
        </motion.button>
      </Link>
    </motion.div>
  );
};

export default LoginButtonPortfolio;
