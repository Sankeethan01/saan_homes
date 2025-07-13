import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const NavbarPortfolio = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { title: 'Services', href: '/services' },
    { title: 'Projects', href: '/projects' },
    { title: 'Rentals', href: '/equipments' },
    { title: 'About Us', href: '/aboutus' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-[#1b4965]">
                              <Image src="/assets/logo.jpg" alt="Logo" width={100} height={100} className="inline-block mr-2" style={{ width: 'auto', height: 'auto' }} />
            </Link>
          </motion.div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`text-[#1b4965] hover:text-[#1b4965]-200 px-3 py-2 rounded-md text-md font-medium transition-colors duration-200
                      ${isScrolled ? 'text-gray-800' : 'text-white'}`}
                  >
                    {item.title}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <button className="text-gray-800" aria-label="Open menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavbarPortfolio; 