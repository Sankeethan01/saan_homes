'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer
      className="relative w-100% min-h-[60vh] md:h-[60vh] bg-[#353535] text-gray-300 py-8 md:py-16 md:bg-[url('/assets/images/footer.jpg')] md:bg-no-repeat md:bg-cover md:bg-center"
    >
      {/* Dark blue overlay */}
      <div className="absolute inset-0 bg-[#1b4965] opacity-70 pointer-events-none z-0" />
      <div className="relative container mx-auto px-4 z-0">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Mobile Layout - Stacked Items */}
          <div className="block md:hidden space-y-8">
            {/* Logo */}
            <div className="text-center">
              <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-[#1b4965]">
                <Image src="/assets/logo.jpg" alt="Logo" width={100} height={0} className="inline-block mr-2" />
              </Link>
            </div>

            {/* Company Name */}
            <div className="text-center">
              <h1 className="text-gray-200 font-bold text-lg">
                SAAN Excellence Engineering PVT LTD.
              </h1>
            </div>

            {/* Description */}
            <div className="text-center">
              <p className="text-gray-300 font-medium text-sm leading-relaxed">
                At SAAN Homes, we don&apos;t just construct buildings, we bring your dreams to life, one brick at a time. Our work is fueled by a passion for innovation and a commitment to excellence in every detail.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex justify-center space-x-6">
              <Link href="https://www.facebook.com/SAANENGINEERING" className="transition-transform duration-200 hover:scale-110">
                <FaFacebookF size={24} />
              </Link>
              <Link href="https://www.instagram.com/saanengineering/" className="transition-transform duration-200 hover:scale-110">
                <FaInstagram size={24} />
              </Link>
              <Link href="https://www.youtube.com/@saanexcellenceengineering3662" className="transition-transform duration-200 hover:scale-110">
                <FaYoutube size={24} />
              </Link>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/services" className="transition-transform duration-200 hover:scale-110 text-sm">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="transition-transform duration-200 hover:scale-110 text-sm">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/equipments" className="transition-transform duration-200 hover:scale-110 text-sm">
                    Rentals
                  </Link>
                </li>
                <li>
                  <Link href="/aboutus" className="transition-transform duration-200 hover:scale-110 text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/login" className="transition-transform duration-200 hover:scale-110 text-sm">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Projects */}
            <div className="text-center">
              <h3 className="text-white text-lg font-semibold mb-4">Projects</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/projects/ongoing" className="transition-transform duration-200 hover:scale-110 text-sm">
                    Ongoing Projects
                  </Link>
                </li>
                <li>
                  <Link href="/projects/completed" className="transition-transform duration-200 hover:scale-110 text-sm">
                    Completed Projects
                  </Link>
                </li>
                <li>
                  <Link href="/projects/upcoming" className="transition-transform duration-200 hover:scale-110 text-sm">
                    Upcoming Projects
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center">
              <h3 className="text-white text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2">
                <p className="text-sm">No.47, Courts Road,</p>
                <p className="text-sm">Point Pedo, Jaffna.</p>
                <p className="text-sm">Phone: +94 77 727 6391</p>
                <p className="text-sm">Email: saanexeng@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Tablet Layout - Brand Section */}
          <div className="hidden md:block space-y-4 w-full md:text-center lg:text-left md:-mt-5 lg:ml-15">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-[#1b4965] md:flex md:justify-center lg:justify-start">
              <Image src="/assets/logo.jpg" alt="Logo" width={100} height={0} className="inline-block md:ml-0 lg:ml-10 mr-2" />
            </Link>
            <h1 className="text-gray-200 font-bold mt-5">
              SAAN Excellence Engineering PVT LTD.
            </h1>
            <p className="text-gray-300 font-medium w-full md:w-full lg:w-75 text-justify">
            At SAAN Homes, we don&apos;t just construct buildings, we bring your dreams to life, one brick at a time. Our work is fueled by a passion for innovation and a commitment to excellence in every detail.
            </p>
            
            <div className="flex space-x-4 md:justify-center lg:justify-start">
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

          {/* Tablet Layout - 3 Column Lists */}
          <div className="hidden md:grid md:grid-cols-3 lg:hidden gap-8 mt-8">
            {/* Quick Links Section */}
            <div>
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
            <div>
              <h3 className="text-white text-xl font-semibold mb-4">Projects</h3>
              <ul className="space-y-2 mt-5">
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
            <div>
              <h3 className="text-white text-xl font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 mt-5">
                <p>No.47, Courts Road,</p>
                <p>Point Pedo, Jaffna.</p>
                <p>Phone: +94 77 727 6391</p>
                <p>Email: saanexeng@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Original 3 sections */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="grid grid-cols-3 gap-8">
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
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-2-white mt-3 py-8 md:hidden lg:block text-center text-gray-400">
          <p>© 2025 SAAN HOMES. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
