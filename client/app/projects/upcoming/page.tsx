'use client';

import Footer from '@/app/components/Portfolio/Footer';
import HeroUpcomingProjectsPortfolio from '@/app/components/Portfolio/Projects/Upcoming/Hero';
import ProjectListUpcomingProjectsPortfolio from '@/app/components/Portfolio/Projects/Upcoming/ProjectList';
import NavBar from '@/app/components/ui/NavBar';


export default function UpcomingProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/*Nav Bar */}
      <NavBar />

      {/* Hero Section */}
        <HeroUpcomingProjectsPortfolio />

      {/* Projects List */}
        <ProjectListUpcomingProjectsPortfolio />


      {/* Footer */}
      <Footer />
      
    </main>
  );
}
