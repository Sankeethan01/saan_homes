'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { FiSearch, FiFilter, FiCalendar, FiUsers, FiCheckCircle, FiClock, FiArrowRight } from 'react-icons/fi';

interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  estimated_end_date: string;
  is_completed: boolean;
  supervisor: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
  created: string;
  updated: string;
}

const getStatusFromProject = (project: Project): 'In Progress' | 'Completed' | 'Planning' | 'On Hold' => {
  if (project.is_completed) return 'Completed';
  
  const now = new Date();
  const startDate = new Date(project.start_date);
  
  if (startDate > now) return 'Planning';
  return 'In Progress';
};

const getStatusStyle = (status: ReturnType<typeof getStatusFromProject>) => {
  const styles = {
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'Planning': 'bg-purple-100 text-purple-800 border-purple-200',
    'On Hold': 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return styles[status] || styles['In Progress'];
};

const getStatusIcon = (status: ReturnType<typeof getStatusFromProject>) => {
  const icons = {
    'In Progress': <FiClock className="mr-1" />,
    'Completed': <FiCheckCircle className="mr-1" />,
    'Planning': <FiCalendar className="mr-1" />,
    'On Hold': <FiClock className="mr-1" />,
  };
  return icons[status] || icons['In Progress'];
};

const getSupervisorDisplayName = (supervisor: Project['supervisor']) => {
  if (!supervisor) return 'Not Assigned';
  if (supervisor.first_name && supervisor.last_name) {
    return `${supervisor.first_name} ${supervisor.last_name}`;
  }
  return supervisor.username;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            clearToken();
            router.replace('/dashboard/login');
            return;
          }
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        
        // No need to fetch supervisor details separately as they're now included in the API response
        setProjects(data);
        setFilteredProjects(data);
        setError(null);
      } catch (err) {
        setError('Error loading projects. Please try again later.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token, router, clearToken]);

  useEffect(() => {
    // Filter projects based on search term and status filter
    let result = [...projects];
    
    if (searchTerm) {
      result = result.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'All') {
      result = result.filter(project => getStatusFromProject(project) === statusFilter);
    }
    
    setFilteredProjects(result);
  }, [searchTerm, statusFilter, projects]);

  // Calculate summary metrics
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.is_completed).length;
  const inProgressProjects = projects.filter(p => !p.is_completed && new Date(p.start_date) <= new Date()).length;
  const plannedProjects = projects.filter(p => !p.is_completed && new Date(p.start_date) > new Date()).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-gray-800"
          >
            Projects Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-gray-500 mt-1"
          >
            Monitor and manage all your construction projects in one place
          </motion.p>
        </div>
        
        <Link href="/dashboard/admin/projects/new">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Add Project
          </motion.button>
        </Link>
      </div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-500 mb-1">Total Projects</div>
          <div className="text-2xl font-semibold">{totalProjects}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-500 mb-1">Completed</div>
          <div className="text-2xl font-semibold">{completedProjects}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-500 mb-1">In Progress</div>
          <div className="text-2xl font-semibold">{inProgressProjects}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-500 mb-1">Planned</div>
          <div className="text-2xl font-semibold">{plannedProjects}</div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-grow">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center">
          <FiFilter className="mr-2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter projects by status"
          >
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Planning">Planning</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            const status = getStatusFromProject(project);
            const statusStyleClass = getStatusStyle(status);
            const statusIcon = getStatusIcon(status);
            
            return (
              <div key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-800 mb-2 truncate">{project.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm">
                      <FiCalendar className="text-gray-400 mr-1" />
                      <span className="text-gray-600">
                        {new Date(project.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FiUsers className="text-gray-400 mr-1" />
                      <span className="text-gray-600 truncate max-w-[120px]">
                        {getSupervisorDisplayName(project.supervisor)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyleClass} border`}>
                      {statusIcon}
                      {status}
                    </div>
                    <Link
                      href={`/dashboard/admin/projects/${project.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 flex items-center"
                    >
                      View Details
                      <FiArrowRight className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No projects found matching your criteria.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
