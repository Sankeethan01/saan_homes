import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const NavBarRentalsPortfolio = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-md ${
        isScrolled ? 'bg-white/80 shadow-lg' : 'bg-white/60'
      }`}
      style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0 flex items-center"
          >
            <Link href="/" className="flex items-center gap-2">
              <Image src="/assets/logo.jpg" alt="Logo" width={48} height={48} className="rounded-full shadow-md" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-400 tracking-tight">Saan Homes</span>
            </Link>
          </motion.div>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard/login">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded-full font-semibold bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow hover:from-blue-700 hover:to-blue-500 transition-all duration-200"
              >
                Login
              </motion.button>
            </Link>
            <Link href="/equipments">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded-full font-semibold border-2 border-blue-500 text-blue-700 bg-white/80 hover:bg-blue-50 shadow transition-all duration-200"
              >
                Rental Equipments
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBarRentalsPortfolio;
