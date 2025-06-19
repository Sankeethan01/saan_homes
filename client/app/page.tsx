'use client';

import Footer from './components/Portfolio/Footer';
import HeroPortfolio from './components/Portfolio/Hero';
import ContactUsPortfolio from './components/Portfolio/ContactUs';
import OurServicesPortfolio from './components/Portfolio/OurServices';
import FeaturedProjectsPortfolio from './components/Portfolio/FeaturedProjects';
import EquipmentRentalsPortfolio from './components/Portfolio/EquipmentRentals';
import ClientTestimonialsPortfolio from './components/Portfolio/ClientTestimonials';
import NavbarPortfolio from './components/Portfolio/Navbar';

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
      <ContactUsPortfolio />

      {/* Footer */}
      <Footer />
    </main>
  );
}
