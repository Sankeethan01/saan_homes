'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  RiSearchLine,
  RiFilter3Line,
  RiCalendarLine,
  RiTeamLine,
  RiMapPinLine,
  RiArrowRightLine,
  RiBuilding4Line,
} from 'react-icons/ri';

interface Project {
  id: number;
  title: string;
  type: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  location: string;
  startDate: string;
  endDate: string;
  progress: number;
  teamSize: number;
  image: string;
  description: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Modern Residential Complex",
    type: "Residential",
    status: "ongoing",
    location: "Downtown City Center",
    startDate: "2024-01-15",
    endDate: "2025-06-30",
    progress: 45,
    teamSize: 25,
    image: "/projects/residential-1.jpg",
    description: "Luxury residential complex featuring modern amenities and sustainable design principles."
  },
  {
    id: 2,
    title: "Tech Innovation Hub",
    type: "Commercial",
    status: "upcoming",
    location: "Tech District",
    startDate: "2024-07-01",
    endDate: "2025-12-31",
    progress: 0,
    teamSize: 40,
    image: "/projects/commercial-1.jpg",
    description: "State-of-the-art office complex designed for tech companies and startups."
  },
  {
    id: 3,
    title: "City Center Mall",
    type: "Commercial",
    status: "completed",
    location: "Metropolitan Area",
    startDate: "2023-01-15",
    endDate: "2024-03-30",
    progress: 100,
    teamSize: 50,
    image: "/projects/mall-1.jpg",
    description: "Modern shopping mall with entertainment facilities and dining options."
  },
  // Add more projects as needed
];

const projectTypes = ["All", "Residential", "Commercial", "Industrial"];
const projectStatuses = ["All", "Upcoming", "Ongoing", "Completed"];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || project.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects Overview</h1>
          <p className="text-gray-600">Manage and monitor all projects</p>
        </div>
        <Link href="/dashboard/supervisor/projects/new">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            New Project
          </button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              {projectStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'completed' ? 'bg-green-100 text-green-600' :
                  project.status === 'ongoing' ? 'bg-blue-100 text-blue-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <RiMapPinLine className="mr-2" />
                  {project.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <RiCalendarLine className="mr-2" />
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <RiTeamLine className="mr-2" />
                  {project.teamSize} Team Members
                </div>
              </div>

              {project.status === 'ongoing' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <Link href={`/dashboard/supervisor/projects/${project.id}`}>
                <button className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                  View Details
                  <RiArrowRightLine />
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <RiBuilding4Line className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Projects Found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
