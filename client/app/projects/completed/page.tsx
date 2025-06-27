'use client';

import Footer from '@/app/components/Portfolio/Footer';
import HeroCompletedProjectsPortfolio from '@/app/components/Portfolio/Projects/Completed/Hero';
import ProjectListCompletedProjectsPortfolio from '@/app/components/Portfolio/Projects/Completed/ProjectList';
import HomeButton from '@/app/components/ui/HomeButton';



export default function CompletedProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
        <HeroCompletedProjectsPortfolio />

      {/* Projects List */}
        <ProjectListCompletedProjectsPortfolio />

      {/* Home Icon */}
          <HomeButton />

      {/* Footer */}
      <Footer />
    </main>
  );
}
