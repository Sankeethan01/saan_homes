'use client';

import HomeIconPortfolio from '@/app/components/Portfolio/Home_Icon';
import HeroOngoingProjectsPortfolio from '@/app/components/Portfolio/Projects/Ongoing/Hero';
import ProjectListOngoingProjectsPortfolio from '@/app/components/Portfolio/Projects/Ongoing/ProjectList';


export default function OngoingProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
        <HeroOngoingProjectsPortfolio />

      {/* Projects List */}
      <ProjectListOngoingProjectsPortfolio />

      {/* Home Icon */}
        <HomeIconPortfolio />
    </main>
  );
}
