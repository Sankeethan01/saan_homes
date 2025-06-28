'use client';

import Footer from './components/Portfolio/Footer';
import HeroPortfolio from './components/Portfolio/Hero';
import OurServicesPortfolio from './components/Portfolio/OurServices';
import FeaturedProjectsPortfolio from './components/Portfolio/FeaturedProjects';
import EquipmentRentalsPortfolio from './components/Portfolio/EquipmentRentals';
import ClientTestimonialsPortfolio from './components/Portfolio/ClientTestimonials';
import NavbarPortfolio from './components/Portfolio/Navbar';
import GetInTouchPortfolio from './components/Portfolio/GetInTouch';
import ContactPortfolio from './components/Portfolio/Contact';

export default function Home() {

  return (
    <main className="overflow-hidden">
      <NavbarPortfolio />

      {/* Hero Section */}
      <HeroPortfolio />

      {/* Services Section */}
      <OurServicesPortfolio />

      {/* Projects Section */}
      <FeaturedProjectsPortfolio />

      {/* Equipment Rentals Section */}
      <EquipmentRentalsPortfolio />

      {/* Testimonials Section */}
      <ClientTestimonialsPortfolio />

      {/* Contact Section */}
      <GetInTouchPortfolio />

      {/*Contact Form */}
      <ContactPortfolio />

      {/* Footer */}
      <Footer />
    </main>
  );
}