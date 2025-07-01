'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer
      className="relative w-100% h-[60vh] bg-[#353535] text-gray-300 py-16 bg-[url('/assets/images/footer.jpg')] bg-no-repeat bg-cover bg-center"
    >
      {/* Dark blue overlay */}
      <div className="absolute inset-0 bg-[#1b4965] opacity-70 pointer-events-none z-0" />
      <div className="relative container mx-auto px-4 z-0">
        <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4 w-100 -mt-5 ml-15">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-[#1b4965]">
              <Image src="/assets/logo.jpg" alt="Logo" width={100} height={0} className="inline-block ml-10 mr-2" />
            </Link>
            <h1 className="text-gray-200 font-bold mt-5">
              SAAN Excellence Engineering PVT LTD.
            </h1>
            <p className="text-gray-300 font-medium w-75 text-justify">
            At SAAN Homes, we don&apos;t just construct buildings, we bring your dreams to life, one brick at a time. Our work is fueled by a passion for innovation and a commitment to excellence in every detail.
            </p>
            
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/SAANENGINEERING" className="transition-transform duration-200 hover:scale-110">
                <FaFacebookF size={30} />
              </Link>
              <Link href="https://www.instagram.com/saanengineering/" className="transition-transform duration-200 hover:scale-110">
                <FaInstagram size={30} />
              </Link>
              <Link href="https://www.youtube.com/@saanexcellenceengineering3662" className="transition-transform duration-200 hover:scale-110">
                <FaYoutube size={30} />
              </Link>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className='ml-40 mt-11'>
            <h3 className="text-white text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 mt-5">
              
              <li>
                <Link href="/services" className="transition-transform duration-200 hover:scale-110">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/projects" className="transition-transform duration-200 hover:scale-110">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/equipments" className="transition-transform duration-200 hover:scale-110">
                  Rentals
                </Link>
              </li>
              <li>
                <Link href="/aboutus" className="transition-transform duration-200 hover:scale-110">
                  About Us
                </Link>
              </li>
              
              <li>
                <Link href="/dashboard/login" className="transition-transform duration-200 hover:scale-110">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Projects Section */}
          <div className='ml-17 mt-11 justify-center-safe'>
            <h3 className="text-white text-xl font-semibold mb-4">Projects</h3>
            <ul className="space-y-2 mt-5 justify-center-safe ">
              <li>
                <Link href="/projects/ongoing" className="transition-transform duration-200 hover:scale-110">
                  Ongoing Projects
                </Link>
              </li>
              <li>
                <Link href="/projects/completed" className="transition-transform duration-200 hover:scale-110">
                  Completed Projects
                </Link>
              </li>
              <li>
                <Link href="/projects/upcoming" className="transition-transform duration-200 hover:scale-110">
                  Upcoming Projects
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Contact Info Section */}
          <div className='ml-10 mt-11'>
            <h3 className="text-white text-xl font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 mt-5">
              <p>No.47, Courts Road,</p>
              <p>Point Pedo, Jaffna.</p>
              <p>Phone: +94 77 727 6391</p>
              <p>Email: saanexeng@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-2-white mt-3 py-8  text-center text-gray-400">
          <p>© 2025 SAAN HOMES. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
