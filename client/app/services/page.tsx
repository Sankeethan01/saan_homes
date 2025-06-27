'use client';

import Footer from '../components/Portfolio/Footer';
import HeroServicesPortfolio from '../components/Portfolio/Services/Hero';
import ServiceListServicesPortfolio from '../components/Portfolio/Services/ServiceList';
import HomeButton from '../components/ui/HomeButton';

export default function ServicesPage() {

  return (
    <main className="min-h-screen bg-gray-50 relative">
      {/* Hero Section */}
      <HeroServicesPortfolio />

      {/* Services List */}
        <ServiceListServicesPortfolio />
      
      {/* Home Icon */}
          <HomeButton />
      {/* Footer */}
          <Footer />
    </main>
  );
}
