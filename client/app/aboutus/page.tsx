"use client";


import NavBar from "../components/ui/NavBar";
import HeroAboutUsPortfolio from "../components/Portfolio/AboutUs/Hero";
import OurStoryAboutUsPortfolio from "../components/Portfolio/AboutUs/OurStory";
import ServiceAboutUsPortfolio from "../components/Portfolio/AboutUs/Services";
import ValuesAboutUsPortfolio from "../components/Portfolio/AboutUs/Values";
import AchievementsAboutUsPortfolio from "../components/Portfolio/AboutUs/Achievements";
import TeamAboutUsPortfolio from "../components/Portfolio/AboutUs/Team";
import ContactAboutUsPortfolio from "../components/Portfolio/AboutUs/Contact";
import CTAAboutUsPortfolio from "../components/Portfolio/AboutUs/CTA";

export default function AboutUs() {
  
 
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <NavBar />

      {/* Hero Section */}
      <HeroAboutUsPortfolio />

      {/* Company Story */}
      <OurStoryAboutUsPortfolio />

      {/* Services Section */}
      <ServiceAboutUsPortfolio />

      {/* Values Section */}
      <ValuesAboutUsPortfolio />

      {/* Achievements Section */}
      <AchievementsAboutUsPortfolio />

      {/* Team Section */}
      <TeamAboutUsPortfolio />

      {/* Contact & Location Section */}
      <ContactAboutUsPortfolio />

      {/* CTA Section */}
      <CTAAboutUsPortfolio />
      
    </main>
  );
}