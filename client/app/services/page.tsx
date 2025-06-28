'use client';

import Footer from '../components/Portfolio/Footer';
import HeroServicesPortfolio from '../components/Portfolio/Services/Hero';
import ServiceListServicesPortfolio from '../components/Portfolio/Services/ServiceList';
import NavBar from '../components/ui/NavBar';

export default function ServicesPage() {

  return (
    <main className="min-h-screen bg-gray-50 relative">

      {/*Nav Bar */}
      <NavBar />

      {/* Hero Section */}
      <HeroServicesPortfolio />

      {/* Services List */}
        <ServiceListServicesPortfolio />
      
      {/* Footer */}
          <Footer />
    </main>
  );
}
