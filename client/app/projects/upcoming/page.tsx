'use client';

import Footer from '@/app/components/Portfolio/Footer';
import HomeIconPortfolio from '@/app/components/Portfolio/Home_Icon';
import HeroUpcomingProjectsPortfolio from '@/app/components/Portfolio/Projects/Upcoming/Hero';
import ProjectListUpcomingProjectsPortfolio from '@/app/components/Portfolio/Projects/Upcoming/ProjectList';


export default function UpcomingProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
        <HeroUpcomingProjectsPortfolio />

      {/* Projects List */}
        <ProjectListUpcomingProjectsPortfolio />

      {/* Home Icon */}
          <HomeIconPortfolio />

      {/* Footer */}
      <Footer />
      
    </main>
  );
}
