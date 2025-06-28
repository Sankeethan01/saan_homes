'use client';

import HeroRentalsPortfolio from '../components/Portfolio/Rentals/Hero';
import ConditionsRentalsPortfolio from '../components/Portfolio/Rentals/Conditions';
import EquipmentGridRentalsPortfolio from '../components/Portfolio/Rentals/EquipmentGrid';
import FilterSectionRentalsPortfolio from '../components/Portfolio/Rentals/FilterNavBar';
import FAQRentalsPortfolio from '../components/Portfolio/Rentals/FAQ';
import TestimonialsRentalsPortfolio from '../components/Portfolio/Rentals/Testimonials';
import CallActionsRentalsPortfolio from '../components/Portfolio/Rentals/CallAction';
import Footer from '../components/Portfolio/Footer';
import ChatBotRentalsPortfolio from '../components/Portfolio/Rentals/ChatBot';
import HomeButton from '../components/ui/HomeButton';


export default function EquipmentsPage() {
  
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">

        {/* ChatBot */}
        <ChatBotRentalsPortfolio />

        {/* Home Icon */}
        <HomeButton />
      </div>

      
      {/* Hero Section */}
      <HeroRentalsPortfolio />

      {/* Filter and Search Section */}
      <FilterSectionRentalsPortfolio />

      {/* Equipment Grid */}
      <EquipmentGridRentalsPortfolio />

      {/* Conditions Section */}
      <ConditionsRentalsPortfolio />

      {/* FAQ Section */}
      <FAQRentalsPortfolio />

      {/* Testimonials Section */}
      <TestimonialsRentalsPortfolio />

      {/* Call to Action Section */}
      <CallActionsRentalsPortfolio />

      {/* Footer */}
      <Footer />
    </main>
  );
}
