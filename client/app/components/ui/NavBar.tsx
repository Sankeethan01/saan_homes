import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RiHome5Line } from 'react-icons/ri';

interface NavBarProps {
  showOnScroll?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ showOnScroll = true }) => {
  const [showNavbar, setShowNavbar] = useState(!showOnScroll);

  useEffect(() => {
    if (!showOnScroll) return;
    const handleScroll = () => {
      setShowNavbar(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showOnScroll]);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        showNavbar
          ? 'bg-[rgba(27,73,101,0.4)] shadow-lg opacity-100'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-20">
        {/* Logo on the left */}
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/logo.jpg"
            alt="Logo"
            width={120}
            height={60}
            className="inline-block mr-2"
          />
        </Link>
        {/* Navigation items (optional, can add more links here) */}
        <div className="flex items-center space-x-8">
          {/* Home button on the right */}
          <Link href="/">
            <div className="w-12 h-12 bg-[#1b4965] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer">
              <RiHome5Line className="text-white text-2xl" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 