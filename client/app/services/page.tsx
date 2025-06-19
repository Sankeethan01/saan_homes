'use client';

import Footer from '../components/Portfolio/Footer';
import HomeIconPortfolio from '../components/Portfolio/Home_Icon';
import HeroServicesPortfolio from '../components/Portfolio/Services/Hero';
import ServiceListServicesPortfolio from '../components/Portfolio/Services/ServiceList';

export default function ServicesPage() {

  return (
    <main className="min-h-screen bg-gray-50 relative">
      {/* Hero Section */}
      <HeroServicesPortfolio />

      {/* Services List */}
        <ServiceListServicesPortfolio />
      
      {/* Home Icon */}
          <HomeIconPortfolio/>
      {/* Footer */}
          <Footer />
    </main>
  );
}
