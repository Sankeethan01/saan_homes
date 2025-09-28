'use client';

import { lazy, Suspense } from 'react';
import NavbarPortfolio from './components/Portfolio/Navbar';
import LoginButtonPortfolio from './components/Portfolio/LoginButton';

// Lazy load heavy components
const HeroPortfolio = lazy(() => import('./components/Portfolio/Hero'));
const OurServicesPortfolio = lazy(() => import('./components/Portfolio/OurServices'));
const FeaturedProjectsPortfolio = lazy(() => import('./components/Portfolio/FeaturedProjects'));
const EquipmentRentalsPortfolio = lazy(() => import('./components/Portfolio/EquipmentRentals'));
const ClientTestimonialsPortfolio = lazy(() => import('./components/Portfolio/ClientTestimonials'));
const GetInTouchPortfolio = lazy(() => import('./components/Portfolio/GetInTouch'));
const ContactPortfolio = lazy(() => import('./components/Portfolio/Contact'));
const Footer = lazy(() => import('./components/Portfolio/Footer'));

// Loading components for better UX
const HeroSkeleton = () => (
  <div className="min-h-screen h-[100vh] flex items-center bg-white relative overflow-hidden">
    <div className="w-full md:w-2/3 flex flex-col justify-center px-6 md:px-25 py-30 z-10 mt-56 -mb-[20]">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg mb-4 w-3/4"></div>
        <div className="h-12 bg-gray-200 rounded-lg mb-4 w-2/3"></div>
        <div className="h-12 bg-gray-200 rounded-lg mb-8 w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded mb-8 w-full max-w-xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-md">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
    <div className="hidden md:block md:w-7/13 h-full absolute right-0 top-0 bottom-0 z-0">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 h-64 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
      <div className="absolute inset-0 bg-[#1b4965] opacity-100 z-[-1] [clip-path:polygon(20%_0,100%_0,100%_100%,0_100%)]" />
    </div>
  </div>
);

const SectionSkeleton = () => (
  <div className="py-20 animate-pulse">
    <div className="container mx-auto px-4">
      <div className="h-8 bg-gray-200 rounded mb-4 w-64 mx-auto"></div>
      <div className="h-4 bg-gray-200 rounded mb-8 w-96 mx-auto"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
);

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Navbar loads immediately - it's lightweight */}
      <NavbarPortfolio />

      {/* Hero Section - Critical, but lazy loaded with skeleton */}
      <Suspense fallback={<HeroSkeleton />}>
      <HeroPortfolio />
      </Suspense>

      {/* Services Section - Lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
      <OurServicesPortfolio />
      </Suspense>

      {/* Projects Section - Lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
      <FeaturedProjectsPortfolio />
      </Suspense>

      {/* Equipment Rentals Section - Lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
      <EquipmentRentalsPortfolio />
      </Suspense>

      {/* Testimonials Section - Lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
      <ClientTestimonialsPortfolio />
      </Suspense>

      {/* Contact Section - Lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
      <GetInTouchPortfolio />
      </Suspense>

      {/* Contact Form - Lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
      <ContactPortfolio />
      </Suspense>

      {/* Footer - Lazy loaded */}
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse"></div>}>
      <Footer />
      </Suspense>

      {/* Floating Login Button - Always visible when conditions are met */}
      <LoginButtonPortfolio />
    </main>
  );
}