'use client';

import Footer from '@/app/components/Portfolio/Footer';
import HeroOngoingProjectsPortfolio from '@/app/components/Portfolio/Projects/Ongoing/Hero';
import ProjectListOngoingProjectsPortfolio from '@/app/components/Portfolio/Projects/Ongoing/ProjectList';
import HomeButton from '@/app/components/ui/HomeButton';


export default function OngoingProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
        <HeroOngoingProjectsPortfolio />

      {/* Projects List */}
      <ProjectListOngoingProjectsPortfolio />

      {/* Home Icon */}
        <HomeButton />

      {/* Footer */}
      <Footer />
    </main>
  );
}
