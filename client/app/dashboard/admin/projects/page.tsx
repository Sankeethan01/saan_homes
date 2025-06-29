'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { FiSearch, FiFilter, FiCalendar, FiUsers, FiCheckCircle, FiClock, FiArrowRight, FiTrash2, FiFile } from 'react-icons/fi';
import { RiHomeGearLine } from 'react-icons/ri';
import { MdFiberNew } from 'react-icons/md';
import { FaFileUpload } from 'react-icons/fa';

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
  const [performanceInfo, setPerformanceInfo] = useState<{
    componentMount: number;
    authCheck: number;
    apiCall: number;
    dataProcessing: number;
    rendering: number;
  } | null>(null);
  
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  // Performance monitoring
  const startTime = performance.now();
  
  useEffect(() => {
    const mountTime = performance.now();
    console.log('🔍 Component mounted at:', mountTime - startTime, 'ms');
    
    if (!token) {
      const authCheckTime = performance.now();
      console.log('🔍 Auth check (no token) took:', authCheckTime - mountTime, 'ms');
      router.replace('/dashboard/login');
      return;
    }

    const authCheckTime = performance.now();
    console.log('🔍 Auth check (token exists) took:', authCheckTime - mountTime, 'ms');

    const fetchProjects = async () => {
      try {
        // Debug logging to identify the issue
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        console.log('🔍 API Base URL:', apiBaseUrl);
        console.log('🔍 Token exists:', !!token);
        console.log('🔍 Starting projects fetch at:', new Date().toISOString());
        
        const apiStartTime = performance.now();
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(`${apiBaseUrl}/projects/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        const apiEndTime = performance.now();
        console.log(`🔍 API call took: ${apiEndTime - apiStartTime}ms`);

        if (!response.ok) {
          console.error('🔍 API Response not OK:', response.status, response.statusText);
          if (response.status === 401) {
            clearToken();
            router.replace('/dashboard/login');
            return;
          }
          throw new Error('Failed to fetch projects');
        }

        const dataProcessingStartTime = performance.now();
        const data = await response.json();
        const dataProcessingEndTime = performance.now();
        
        console.log('🔍 Projects data received:', data?.length || 0, 'projects');
        console.log(`🔍 Data processing took: ${dataProcessingEndTime - dataProcessingStartTime}ms`);
        
        // No need to fetch supervisor details separately as they're now included in the API response
        setProjects(data);
        setFilteredProjects(data);
        setError(null);
        
        // Update performance info
        setPerformanceInfo({
          componentMount: mountTime - startTime,
          authCheck: authCheckTime - mountTime,
          apiCall: apiEndTime - apiStartTime,
          dataProcessing: dataProcessingEndTime - dataProcessingStartTime,
          rendering: performance.now() - dataProcessingEndTime
        });
        
      } catch (err) {
        console.error('🔍 Error details:', err);
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
    <div className="min-h-screen bg-white">
      {/* Performance Debug Info (remove in production) */}
      {/* {performanceInfo && process.env.NODE_ENV === 'development' && (
        <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-xl p-3 text-xs mb-6 shadow-sm">
          <strong>⚡ Performance Debug:</strong> Mount: {performanceInfo.componentMount.toFixed(1)}ms | 
          Auth: {performanceInfo.authCheck.toFixed(1)}ms | 
          API: {performanceInfo.apiCall.toFixed(1)}ms | 
          Processing: {performanceInfo.dataProcessing.toFixed(1)}ms | 
          Render: {performanceInfo.rendering.toFixed(1)}ms
        </div>
      )} */}
      
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/20">
        <div className="absolute inset-0 bg-gray-50/30"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center mb-3"
            >
              <div className="w-12 h-12 bg-primary/10 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                <RiHomeGearLine className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Projects Dashboard
                </h1>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <p className="text-gray-600 text-sm">
                    {totalProjects} Active Projects • Real-time monitoring
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 text-lg max-w-2xl"
            >
              Monitor, manage, and track all your construction projects with powerful analytics and real-time insights
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/dashboard/admin/projects/recycle-bin">
              <button className="group flex items-center px-6 py-3 bg-gray-100/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-300 border border-gray-200/50 hover:border-gray-300/50">
                <FiTrash2 className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Recycle Bin
              </button>
            </Link>
            <Link href="/dashboard/admin/projects/new">
              <button className="group flex items-center px-6 py-3 bg-[#1b4965] text-white rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold">
              <FaFileUpload className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                New Project
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <RiHomeGearLine className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{totalProjects}</div>
                <div className="text-xs text-blue-600 font-medium">+12% this month</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Total Projects</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
              <div className="bg-blue-500 h-1.5 rounded-full w-3/4"></div>
            </div>
          </div>
        </div>

        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{completedProjects}</div>
                <div className="text-xs text-green-600 font-medium">+8% this month</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Completed</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
              <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0}%`}}></div>
            </div>
          </div>
        </div>

        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <FiClock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{inProgressProjects}</div>
                <div className="text-xs text-amber-600 font-medium">+5% this month</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">In Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{width: `${totalProjects > 0 ? (inProgressProjects / totalProjects) * 100 : 0}%`}}></div>
            </div>
          </div>
        </div>

        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FiCalendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{plannedProjects}</div>
                <div className="text-xs text-purple-600 font-medium">+15% this month</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Planned</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{width: `${totalProjects > 0 ? (plannedProjects / totalProjects) * 100 : 0}%`}}></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects by name, description, or supervisor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-3.5 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                aria-label="Filter projects by status"
              >
                <option value="All">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planning">Planning</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">{filteredProjects.length}</span>
              <span className="ml-1">of {totalProjects} projects</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modern Projects Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => {
            const status = getStatusFromProject(project);
            const statusStyleClass = getStatusStyle(status);
            const statusIcon = getStatusIcon(status);
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:scale-[1.02] overflow-hidden"
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Status Indicator Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  status === 'Completed' ? 'bg-green-500' :
                  status === 'In Progress' ? 'bg-blue-500' :
                  status === 'Planning' ? 'bg-purple-500' : 'bg-gray-400'
                }`}></div>
                
                <div className="relative p-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {project.name}
                      </h3>
                      <p 
                        className="text-gray-600 text-sm leading-relaxed"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {project.description}
                      </p>
                    </div>
                    <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyleClass} border-0 shadow-sm`}>
                      {statusIcon}
                      {status}
                    </div>
                  </div>
                  
                  {/* Project Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                        <FiCalendar className="text-blue-600 w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Start Date</div>
                        <div className="font-medium text-gray-900">
                          {new Date(project.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                        <FiUsers className="text-purple-600 w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Supervisor</div>
                        <div className="font-medium text-gray-900 truncate max-w-[150px]">
                          {getSupervisorDisplayName(project.supervisor)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Link href={`/dashboard/admin/projects/${project.id}`}>
                    <button className="w-full group/btn flex items-center justify-center px-4 py-3 bg-[#1b4965] text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold">
                      <span>View Project Details</span>
                      <FiArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <RiHomeGearLine className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 text-center max-w-md">
              No projects match your current search criteria. Try adjusting your filters or search terms.
            </p>
            <Link href="/dashboard/admin/projects/new">
              <button className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-200 font-semibold">
                Create Your First Project
              </button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
