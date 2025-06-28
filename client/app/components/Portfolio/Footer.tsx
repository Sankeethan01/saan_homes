'use client';

import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer
      className="relative bg-[#353535] text-gray-300 py-16 bg-[url('/assets/images/footer.jpg')] bg-no-repeat bg-cover bg-center"
    >
      {/* Dark blue overlay */}
      <div className="absolute inset-0 bg-[#1b4965] opacity-70 pointer-events-none z-0" />
      <div className="relative container mx-auto px-4 z-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-red-600">
              <span >SAAN  HOMES</span>
              
            </h2>
            <p className="text-gray-400">
              Building dreams into reality with innovation and excellence.
            </p>
            <div className="flex space-x-4">
              <Link href="https://facebook.com" className="hover:text-[#1b4965] transition-colors">
                <FaFacebookF size={20} />
              </Link>
              <Link href="https://instagram.com" className="hover:text-[#1b4965] transition-colors">
                <FaInstagram size={20} />
              </Link>
              <Link href="https://twitter.com" className="hover:text-[#1b4965] transition-colors">
                <FaTwitter size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-blue-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/aboutus" className="hover:text-blue-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-blue-500 transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/custom-homes" className="hover:text-blue-500 transition-colors">
                  Custom Homes
                </Link>
              </li>
              <li>
                <Link href="/services/renovations" className="hover:text-blue-500 transition-colors">
                  Renovations
                </Link>
              </li>
              <li>
                <Link href="/services/interior-design" className="hover:text-blue-500 transition-colors">
                  Interior Design
                </Link>
              </li>
              <li>
                <Link href="/services/project-management" className="hover:text-blue-500 transition-colors">
                  Project Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info Section */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2">
              <p>123 Construction Ave,</p>
              <p>City, State 12345</p>
              <p>Phone: (123) 456-7890</p>
              <p>Email: info@saanhomes.com</p>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 mt-10 py-8  text-center text-gray-400">
          <p>© 2025 SAAN HOMES. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
