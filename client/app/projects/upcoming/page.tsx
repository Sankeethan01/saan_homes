'use client';

import Footer from '@/app/components/Portfolio/Footer';
import HeroUpcomingProjectsPortfolio from '@/app/components/Portfolio/Projects/Upcoming/Hero';
import ProjectListUpcomingProjectsPortfolio from '@/app/components/Portfolio/Projects/Upcoming/ProjectList';
import HomeButton from '@/app/components/ui/HomeButton';


export default function UpcomingProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
        <HeroUpcomingProjectsPortfolio />

      {/* Projects List */}
        <ProjectListUpcomingProjectsPortfolio />

      {/* Home Icon */}
          <HomeButton />

      {/* Footer */}
      <Footer />
      
    </main>
  );
}
