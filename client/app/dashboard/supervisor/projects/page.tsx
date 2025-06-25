'use client';

import { useAuthStore } from '@/app/stores/useAuthStore'; // import the store

import { useEffect, useState } from 'react';
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
  id: string;
  name: string;
  description: string;
  start_date: string;
  estimated_end_date: string;
  is_completed: boolean;
  boq_file: string;
  supervisor?: any;
}

export default function ProjectsPage() {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((s) => s.token);
  const [projects, setProjects] = useState<Project[]>([]);

useEffect(() => {
  console.log("Token:", token); // Debugging
  if (!token) return;

  fetch('http://localhost:8000/api/projects/',  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Unauthorized or failed to fetch');
      }
      return res.json();
    })
    .then((data) => {
      if (Array.isArray(data)) {
        setProjects(data);
      } else if (Array.isArray(data.results)) {
        setProjects(data.results);
      } else {
        console.error('Unexpected data format:', data);
        setProjects([]);
      }
      setLoading(false);
    })
    .catch((err) => {
      console.error('Failed to load projects:', err);
      setProjects([]);
      setLoading(false);
    });
}, [token]); // make sure to include token in dependency array


  const filteredProjects = projects
    ?.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Completed' && project.is_completed) ||
        (selectedStatus === 'Ongoing' && !project.is_completed);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.start_date).getTime();
      const dateB = new Date(b.start_date).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  

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
      
      if (loading) {
    return <div className="text-center text-gray-600">Loading projects...</div>;
  }

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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
          >
            <option>All</option>
            <option>Ongoing</option>
            <option>Completed</option>
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

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              <p className="text-sm text-gray-500 mb-2">
                {new Date(project.start_date).toLocaleDateString()} →{' '}
                {new Date(project.estimated_end_date).toLocaleDateString()}
              </p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                project.is_completed
                  ? 'bg-green-100 text-green-600'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {project.is_completed ? 'Completed' : 'Ongoing'}
              </span>
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
