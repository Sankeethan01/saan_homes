'use client';

import HeroContactUsRentalsPortfolio from '@/app/components/Portfolio/Rentals/ContactUs/Hero';
import ContactInfoContactUsRentalsPortfolio from '@/app/components/Portfolio/Rentals/ContactUs/ContactInfo';
import FormContactUsRentalsPortfolio from '@/app/components/Portfolio/Rentals/ContactUs/Form';
import HomeIconPortfolio from '@/app/components/Portfolio/Home_Icon';

export default function RentalContact() {

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <HeroContactUsRentalsPortfolio />
      
      {/* Contact Information */}
      <ContactInfoContactUsRentalsPortfolio />

      {/* Contact Form */}
      <FormContactUsRentalsPortfolio />

      {/* Home Icon */}
       <HomeIconPortfolio />  
    </main>
  );
}
