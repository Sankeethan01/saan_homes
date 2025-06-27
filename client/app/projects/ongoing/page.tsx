'use client';

import Footer from '@/app/components/Portfolio/Footer';
import HeroOngoingProjectsPortfolio from '@/app/components/Portfolio/Projects/Ongoing/Hero';
import ProjectListOngoingProjectsPortfolio from '@/app/components/Portfolio/Projects/Ongoing/ProjectList';
import NavBar from '@/app/components/ui/NavBar';


export default function OngoingProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/*Nav Bar */}
      <NavBar />

      {/* Hero Section */}
        <HeroOngoingProjectsPortfolio />

      {/* Projects List */}
      <ProjectListOngoingProjectsPortfolio />


      {/* Footer */}
      <Footer />
    </main>
  );
}
