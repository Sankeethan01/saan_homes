'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiCalendar, FiUsers, FiClipboard, FiChevronLeft, FiChevronRight, FiCheckCircle, FiClock as FiClockCircle, FiClock, FiAlertTriangle, FiMapPin, FiUser, FiMail, FiPhone, FiEdit, FiTrash2, FiDollarSign, FiTarget, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { RiHomeGearLine } from 'react-icons/ri';
import OpenStreetMap from '@/app/components/ui/GoogleMap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { use } from 'react';

interface Step {
  id: string;
  order: number;
  title: string;
  is_approved: boolean;
  actual_completed: string | null;
  expected_materials: Record<string, string | number>;
  expected_budget: number | null;
}

interface Project {
  id: string;
  name: string;
  description: string;
  project_type: string;
  priority: string;
  start_date: string;
  estimated_end_date: string;
  location: string;
  address: string;
  client_name: string;
  client_email: string;
  client_phone: string;
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
  steps: Step[];
  progress: number;
  current_step: string;
  status: string;
  budget: number;
  thumbnail: string | null;
  images: string[];
  model_3d: string | null;
}

// Sample images for the slideshow - in production, these would come from the API
const sampleImages = [
  '/assets/images/img01.jpg',
  '/assets/images/img02.jpg',
  '/assets/images/img04.jpg',
  '/assets/images/construction.png',
];

const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    'IN_PROGRESS': 'bg-blue-100 text-blue-800 border-blue-200',
    'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
    'PLANNING': 'bg-purple-100 text-purple-800 border-purple-200',
    'ON_HOLD': 'bg-gray-100 text-gray-800 border-gray-200',
    'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  return styles[status] || 'bg-blue-100 text-blue-800 border-blue-200';
};

const getStepStatusStyle = (step: Step) => {
  if (step.is_approved) {
    return 'bg-green-100 text-green-800 border-green-200';
  } else if (step.actual_completed) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
};

const getStepStatus = (step: Step) => {
  if (step.is_approved) {
    return 'Completed';
  } else if (step.actual_completed) {
    return 'In Progress';
  }
  return 'Pending';
};

const getStepIcon = (step: Step) => {
  if (step.is_approved) {
    return <FiCheckCircle className="w-5 h-5" />;
  } else if (step.actual_completed) {
    return <FiClockCircle className="w-5 h-5" />;
  }
  return <FiAlertTriangle className="w-5 h-5" />;
};

const getProjectTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    'RESIDENTIAL': 'Residential',
    'COMMERCIAL': 'Commercial',
    'INDUSTRIAL': 'Industrial',
    'RENOVATION': 'Renovation',
    'INFRASTRUCTURE': 'Infrastructure',
    'OTHER': 'Other',
  };
  return types[type] || type;
};

const getPriorityStyle = (priority: string) => {
  const styles: Record<string, string> = {
    'HIGH': 'bg-red-100 text-red-800 border-red-200',
    'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'LOW': 'bg-green-100 text-green-800 border-green-200',
  };
  return styles[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function ProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const { projectId } = resolvedParams;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/`, {
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
          throw new Error('Failed to fetch project');
        }

        const data = await response.json();
        setProject(data);
        
        // Find the current step index (first non-approved step)
        if (data.steps && data.steps.length > 0) {
          const currentIdx = data.steps.findIndex((step: Step) => !step.is_approved);
          setCurrentStepIndex(currentIdx >= 0 ? currentIdx : 0);
        }
        
        setError(null);
      } catch (err) {
        setError('Error loading project. Please try again later.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [token, router, clearToken, projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error || 'Project not found'}</div>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }


  const getSupervisorDisplayName = () => {
    if (!project.supervisor) return 'Not Assigned';
    if (project.supervisor.first_name && project.supervisor.last_name) {
      return `${project.supervisor.first_name} ${project.supervisor.last_name}`;
    }
    return project.supervisor.username;
  };

  const handleEditProject = () => {
    router.push(`/dashboard/admin/projects/edit/${projectId}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/soft-delete/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          router.replace('/dashboard/login');
          return;
        }
        throw new Error('Failed to delete project');
      }

      // Navigate back to projects list
      router.replace('/dashboard/admin/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const completedSteps = project.steps.filter(step => step.is_approved).length;
  const totalSteps = project.steps.length;
  const estimatedDuration = Math.ceil((new Date(project.estimated_end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((new Date().getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="p-6 pb-0">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-primary hover:text-primary-600 mb-6 transition-colors duration-200"
        >
          <FiChevronLeft className="mr-1" /> Back to Projects
        </button>
      </div>
      
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mx-6 mb-8 border border-white/20">
        <div className="absolute inset-0 bg-gray-50/30"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="mb-6 lg:mb-0 flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start mb-4"
              >
                <div className="w-16 h-16 bg-primary/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                  <RiHomeGearLine className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                    {project.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusStyle(project.status)}`}>
                      {project.status === 'IN_PROGRESS' ? 'In Progress' : 
                      project.status === 'COMPLETED' ? 'Completed' : 
                      project.status === 'PLANNING' ? 'Planning' : 'On Hold'}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getPriorityStyle(project.priority)}`}>
                      {project.priority} Priority
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                      {getProjectTypeLabel(project.project_type)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">{project.description}</p>
                </div>
              </motion.div>
            </div>
            
            {/* Admin Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 lg:ml-6"
            >
              <button
                onClick={handleEditProject}
                className="flex items-center justify-center px-6 py-3 bg-[#1b4965] backdrop-blur-sm text-white rounded-xl transition-all duration-300 border border-gray-200/50 hover:border-gray-300/50 font-semibold"
              >
                <FiEdit className="mr-2" /> Edit Project
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex items-center justify-center px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 border border-red-200 hover:border-red-300 font-semibold"
              >
                <FiTrash2 className="mr-2" /> Delete
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Project</h3>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Are you sure you want to delete this project? This project will be moved to the recycle bin and can be restored later.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center font-semibold"
              >
                {deleteLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Deleting...
                  </>
                ) : (
                  <>Delete</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modern Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 mb-8"
      >
        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FiCalendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-blue-600 font-medium">Started</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Start Date</div>
            <div className="text-xs text-gray-500 mt-1">{daysElapsed} days elapsed</div>
          </div>
        </div>

        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FiTarget className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {new Date(project.estimated_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-purple-600 font-medium">{estimatedDuration} days</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Target Date</div>
            <div className="text-xs text-gray-500 mt-1">Duration: {estimatedDuration} days</div>
          </div>
        </div>

        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{project.progress}%</div>
                <div className="text-xs text-green-600 font-medium">{completedSteps}/{totalSteps} steps</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{width: `${project.progress}%`}}></div>
            </div>
          </div>
        </div>

        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <FiDollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  LKR {project.budget ? (project.budget / 1000).toFixed(0) : '0'}K
                </div>
                <div className="text-xs text-amber-600 font-medium">Budget</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Total Budget</div>
            <div className="text-xs text-gray-500 mt-1">
              LKR {project.budget ? project.budget.toLocaleString() : '0'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Project Information Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 mb-8"
      >
        {/* Location & Supervisor */}
        <div className="space-y-6">
          {/* Location Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <FiMapPin className="w-5 h-5 text-blue-600" />
              </div>
              Location Details
            </h2>
            {project.location || project.address ? (
              <div className="space-y-4">
                {project.location && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                      <FiMapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Location</div>
                      <div className="text-gray-900 font-semibold">{project.location}</div>
                    </div>
                  </div>
                )}
                {project.address && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                      <FiMapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Address</div>
                      <div className="text-gray-900 whitespace-pre-line">{project.address}</div>
                    </div>
                  </div>
                )}
                                 <div className="mt-6">
                   <OpenStreetMap
                     address={project.address}
                     location={project.location}
                     height="250px"
                     className="w-full"
                   />
                 </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiMapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No location information available</p>
              </div>
            )}
          </div>

          {/* Supervisor Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                <FiUsers className="w-5 h-5 text-purple-600" />
              </div>
              Project Supervisor
            </h2>
            {project.supervisor ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mr-4">
                    <FiUser className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{getSupervisorDisplayName()}</div>
                    <div className="text-sm text-gray-600">Project Supervisor</div>
                  </div>
                </div>
                {project.supervisor.email && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <FiMail className="w-4 h-4 text-gray-600" />
                    </div>
                    <a href={`mailto:${project.supervisor.email}`} className="text-primary hover:text-primary-600 transition-colors">
                      {project.supervisor.email}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No supervisor assigned</p>
                <button className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
                  Assign Supervisor
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Client Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                <FiUser className="w-5 h-5 text-green-600" />
              </div>
              Client Information
            </h2>
            {project.client_name || project.client_email || project.client_phone ? (
              <div className="space-y-4">
                {project.client_name && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <FiUser className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Client Name</div>
                      <div className="text-gray-900 font-semibold">{project.client_name}</div>
                    </div>
                  </div>
                )}
                {project.client_email && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <FiMail className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Email</div>
                      <a href={`mailto:${project.client_email}`} className="text-primary hover:text-primary-600 transition-colors font-medium">
                        {project.client_email}
                      </a>
                    </div>
                  </div>
                )}
                {project.client_phone && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <FiPhone className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Phone</div>
                      <a href={`tel:${project.client_phone}`} className="text-primary hover:text-primary-600 transition-colors font-medium">
                        {project.client_phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No client information available</p>
                <button className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
                  Add Client Info
                </button>
              </div>
            )}
          </div>

          {/* Current Step Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-3">
                <FiActivity className="w-5 h-5 text-orange-600" />
              </div>
              Current Step Status
            </h2>
            {project.steps.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  // Find current step (first non-approved step or last step if all approved)
                  const currentStep = project.steps.find(step => !step.is_approved) || project.steps[project.steps.length - 1];
                  const currentStepIndex = project.steps.findIndex(step => step.id === currentStep.id);
                  const completedSteps = project.steps.filter(step => step.is_approved).length;
                  
                  return (
                    <>
                      {/* Current Step Card */}
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${getStepStatusStyle(currentStep)} border`}>
                              {getStepIcon(currentStep)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">Step {currentStep.order}: {currentStep.title}</h3>
                              <p className="text-sm text-gray-600">
                                {currentStep.is_approved ? 'Completed' : currentStep.actual_completed ? 'In Progress' : 'Pending'}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStepStatusStyle(currentStep)}`}>
                            {getStepStatus(currentStep)}
                          </span>
                        </div>
                        
                        {/* Step Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Overall Progress</span>
                            <span>{completedSteps}/{project.steps.length} steps completed</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                              style={{width: `${(completedSteps / project.steps.length) * 100}%`}}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        {/* Step Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {currentStep.expected_budget && (
                            <div className="flex items-center">
                              <FiDollarSign className="w-4 h-4 text-amber-600 mr-2" />
                              <span className="text-sm text-gray-700">
                                Budget: <span className="font-semibold">LKR {currentStep.expected_budget.toLocaleString()}</span>
                              </span>
                            </div>
                          )}
                          {currentStep.actual_completed && (
                            <div className="flex items-center">
                              <FiCalendar className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="text-sm text-gray-700">
                                Completed: <span className="font-semibold">{new Date(currentStep.actual_completed).toLocaleDateString()}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Next Steps Preview */}
                      {currentStepIndex < project.steps.length - 1 && (
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <FiChevronRight className="w-4 h-4 mr-1" />
                            Next Steps
                          </h4>
                          <div className="space-y-2">
                                                         {project.steps.slice(currentStepIndex + 1, currentStepIndex + 3).map((step) => (
                              <div key={step.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center mr-3 text-xs font-semibold text-gray-600">
                                  {step.order}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                                  {step.expected_budget && (
                                    <p className="text-xs text-gray-500">Budget: LKR {step.expected_budget.toLocaleString()}</p>
                                  )}
                                </div>
                                <FiClock className="w-4 h-4 text-gray-400" />
                              </div>
                            ))}
                            {project.steps.length > currentStepIndex + 3 && (
                              <div className="text-center">
                                <button 
                                  onClick={() => {
                                    // Scroll to project timeline section
                                    const timelineSection = document.querySelector('[data-section="timeline"]');
                                    timelineSection?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="text-sm text-primary hover:text-primary-600 transition-colors font-medium"
                                >
                                  View all {project.steps.length - currentStepIndex - 1} remaining steps →
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              router.push(`/dashboard/admin/projects/${projectId}/steps/${currentStep.id}`);
                            }}
                            className="flex items-center px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                          >
                            <FiActivity className="w-4 h-4 mr-2" />
                            View Step Details
                          </button>
                          {!currentStep.is_approved && (
                            <button
                              onClick={() => {
                                // This would open a modal or navigate to step management
                                console.log('Update step status');
                              }}
                              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                            >
                              <FiCheckCircle className="w-4 h-4 mr-2" />
                              Update Status
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiActivity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No steps defined for this project</p>
                <button className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
                  Add Project Steps
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 3D Plan and Project Images */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 mb-8"
      >
        {/* 3D Plan Viewer */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-3">
                <FiActivity className="w-5 h-5 text-indigo-600" />
              </div>
              3D Plan Viewer
            </h2>
          </div>
          <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50">
            {project.model_3d ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <FiActivity className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">3D Model Available</p>
                  <p className="text-gray-500 text-sm mt-1">Interactive viewer would be integrated here</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FiActivity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No 3D model available</p>
                  <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                    Upload 3D Model
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Images Slideshow */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                <FiClipboard className="w-5 h-5 text-emerald-600" />
              </div>
              Project Gallery
            </h2>
          </div>
          <div className="aspect-video">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000 }}
              className="h-full"
            >
              {project.images && project.images.length > 0 ? (
                project.images.map((image, index) => (
                  <SwiperSlide key={index} className="h-full">
                    <div className="relative h-full">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/media/${image}`}
                        alt={`Project image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))
              ) : project.thumbnail ? (
                <SwiperSlide className="h-full">
                  <div className="relative h-full">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/media/${project.thumbnail}`}
                      alt="Project thumbnail"
                      fill
                      className="object-cover"
                    />
                  </div>
                </SwiperSlide>
              ) : (
                // Fallback to sample images if no project images
                sampleImages.map((image, index) => (
                  <SwiperSlide key={index} className="h-full">
                    <div className="relative h-full">
                      <Image
                        src={image}
                        alt={`Project image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))
              )}
            </Swiper>
          </div>
        </div>
      </motion.div>

      {/* Project Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="px-6 mb-8"
        data-section="timeline"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <FiClipboard className="w-5 h-5 text-blue-600" />
              </div>
              Project Timeline & Steps
            </h2>
          </div>
          <div className="p-6">
            {project.steps.length > 0 ? (
              <div className="space-y-4">
                {project.steps.map((step, index) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`group relative bg-white rounded-xl p-6 border-l-4 cursor-pointer hover:shadow-lg transition-all duration-300 ${
                      index === currentStepIndex ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setCurrentStepIndex(index);
                      router.push(`/dashboard/admin/projects/${projectId}/steps/${step.id}`);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${getStepStatusStyle(step)} border`}>
                          {getStepIcon(step)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">Step {step.order}: {step.title}</h3>
                            <FiChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${index === currentStepIndex ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStepStatusStyle(step)}`}>
                              {getStepStatus(step)}
                            </span>
                            {step.expected_budget && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                <FiDollarSign className="w-4 h-4 mr-1" />
                                LKR {step.expected_budget.toLocaleString()}
                              </span>
                            )}
                            {step.actual_completed && (
                              <span className="text-sm text-gray-500">
                                Completed: {new Date(step.actual_completed).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiClipboard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No project steps</h3>
                                 <p className="text-gray-500 mb-6">This project doesn&apos;t have any steps defined yet.</p>
                <button className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-600 transition-colors font-semibold">
                  Add Project Steps
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
