'use client';

import Footer from '@/app/components/Portfolio/Footer';
import HeroCompletedProjectsPortfolio from '@/app/components/Portfolio/Projects/Completed/Hero';
import ProjectListCompletedProjectsPortfolio from '@/app/components/Portfolio/Projects/Completed/ProjectList';
import NavBarProjects from '@/app/components/ui/NavBarProjects';




export default function CompletedProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/*Nav Bar */}
      <NavBarProjects />

      {/* Hero Section */}
        <HeroCompletedProjectsPortfolio />

      {/* Projects List */}
        <ProjectListCompletedProjectsPortfolio />


      {/* Footer */}
      <Footer />
    </main>
  );
}
