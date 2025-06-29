'use client';

import { useState } from 'react';
import HeroRentalsPortfolio from '../components/Portfolio/Rentals/Hero';
import ConditionsRentalsPortfolio from '../components/Portfolio/Rentals/Conditions';
import EquipmentGridRentalsPortfolio from '../components/Portfolio/Rentals/EquipmentGrid';
import FilterSectionRentalsPortfolio from '../components/Portfolio/Rentals/FilterNavBar';
import FAQRentalsPortfolio from '../components/Portfolio/Rentals/FAQ';
import TestimonialsRentalsPortfolio from '../components/Portfolio/Rentals/Testimonials';
import CallActionsRentalsPortfolio from '../components/Portfolio/Rentals/CallAction';
import Footer from '../components/Portfolio/Footer';
import ChatBotRentalsPortfolio from '../components/Portfolio/Rentals/ChatBot';

export default function EquipmentsPage() {
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Equipment');

  // Handlers for state updates
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Floating Action Buttons */}

      {/* ChatBot */}
      <ChatBotRentalsPortfolio />

      {/* Hero Section */}
      <HeroRentalsPortfolio />

      {/* Filter and Search Section */}
      <FilterSectionRentalsPortfolio
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Equipment Grid */}
      <EquipmentGridRentalsPortfolio
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />

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
