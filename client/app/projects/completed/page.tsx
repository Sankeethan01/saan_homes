'use client';

import Footer from '@/app/components/Portfolio/Footer';
import HomeIconPortfolio from '@/app/components/Portfolio/Home_Icon';
import HeroCompletedProjectsPortfolio from '@/app/components/Portfolio/Projects/Completed/Hero';
import ProjectListCompletedProjectsPortfolio from '@/app/components/Portfolio/Projects/Completed/ProjectList';



export default function CompletedProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
        <HeroCompletedProjectsPortfolio />

      {/* Projects List */}
        <ProjectListCompletedProjectsPortfolio />

      {/* Home Icon */}
          <HomeIconPortfolio />

      {/* Footer */}
      <Footer />
    </main>
  );
}
