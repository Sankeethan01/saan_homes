'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiCalendar, FiClock, FiUsers, FiClipboard, FiChevronLeft, FiChevronRight, FiCheckCircle, FiClock as FiClockCircle, FiAlertTriangle } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type StatusType = 'In Progress' | 'Completed' | 'Planning' | 'On Hold' | 'Pending' | 'Available' | 'Maintenance';

interface Step {
  id: string;
  order: number;
  title: string;
  is_approved: boolean;
  actual_completed: string | null;
  expected_materials: Record<string, any>;
  expected_budget: number | null;
}

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
  steps: Step[];
  progress: number;
  current_step: string;
  status: string;
  budget: number;
}

// Sample images for the slideshow - in production, these would come from the API
const sampleImages = [
  '/assets/images/img01.jpg',
  '/assets/images/img02.jpg',
  '/assets/images/img04.jpg',
  '/assets/images/construction.png',
];

const getStatusStyle = (status: string) => {
  const styles = {
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'PLANNING': 'bg-purple-100 text-purple-800',
    'ON_HOLD': 'bg-gray-100 text-gray-800',
    'PENDING': 'bg-yellow-100 text-yellow-800',
  };
  return styles[status] || 'bg-blue-100 text-blue-800';
};

const getStepStatusStyle = (step: Step) => {
  if (step.is_approved) {
    return 'bg-green-100 text-green-800';
  } else if (step.actual_completed) {
    return 'bg-blue-100 text-blue-800';
  }
  return 'bg-yellow-100 text-yellow-800';
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

export default function ProjectDetailsPage({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${params.projectId}/`, {
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
          const currentIdx = data.steps.findIndex(step => !step.is_approved);
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
  }, [token, router, clearToken, params.projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error || 'Project not found'}</div>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentStep = project.steps[currentStepIndex] || null;
  const getSupervisorDisplayName = () => {
    if (!project.supervisor) return 'Not Assigned';
    if (project.supervisor.first_name && project.supervisor.last_name) {
      return `${project.supervisor.first_name} ${project.supervisor.last_name}`;
    }
    return project.supervisor.username;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Back Button */}
      <div>
        <button 
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FiChevronLeft className="mr-1" /> Back to Projects
        </button>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-gray-800">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        </motion.div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(project.status)}`}
        >
          {project.status === 'IN_PROGRESS' ? 'In Progress' : 
           project.status === 'COMPLETED' ? 'Completed' : 
           project.status === 'PLANNING' ? 'Planning' : 'On Hold'}
        </motion.span>
      </div>

      {/* Project Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCalendar className="text-blue-600 w-5 h-5" />
            <span className="ml-2 text-sm text-gray-500">Start Date</span>
          </div>
          <p className="mt-2 text-lg font-medium">
            {new Date(project.start_date).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiClock className="text-blue-600 w-5 h-5" />
            <span className="ml-2 text-sm text-gray-500">Estimated End Date</span>
          </div>
          <p className="mt-2 text-lg font-medium">
            {new Date(project.estimated_end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiUsers className="text-blue-600 w-5 h-5" />
            <span className="ml-2 text-sm text-gray-500">Supervisor</span>
          </div>
          <p className="mt-2 text-lg font-medium truncate">{getSupervisorDisplayName()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiClipboard className="text-blue-600 w-5 h-5" />
            <span className="ml-2 text-sm text-gray-500">Progress</span>
          </div>
          <div className="mt-2">
            <div className="flex items-center">
              <span className="text-lg font-medium">{project.progress}%</span>
              <div className="flex-1 ml-4 h-2 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3D Plan and Project Images */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* 3D Plan Viewer (Placeholder) */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <h2 className="text-lg font-medium text-gray-800 p-4 border-b">3D Plan Viewer</h2>
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">3D model would be displayed here</p>
            {/* In a real implementation, you would integrate a 3D viewer library here */}
          </div>
        </div>

        {/* Project Images Slideshow */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <h2 className="text-lg font-medium text-gray-800 p-4 border-b">Project Images</h2>
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
              {sampleImages.map((image, index) => (
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
              ))}
            </Swiper>
          </div>
        </div>
      </motion.div>

      {/* Project Steps and Current Step Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Steps List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Project Steps</h2>
          <div className="space-y-4">
            {project.steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center p-4 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                  index === currentStepIndex ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setCurrentStepIndex(index)}
              >
                <div className="mr-4 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepStatusStyle(step)}`}>
                    {getStepIcon(step)}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-medium text-gray-800">Step {step.order}: {step.title}</h3>
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStepStatusStyle(step)}`}>
                      {getStepStatus(step)}
                    </span>
                    {step.expected_budget && (
                      <span className="ml-2 text-xs text-gray-500">
                        Budget: ${step.expected_budget.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <FiChevronRight className={`w-5 h-5 text-gray-400 ${index === currentStepIndex ? 'transform rotate-90' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Current Step Details</h2>
          {currentStep ? (
            <div>
              <div className="mb-4">
                <h3 className="text-md font-medium">{currentStep.title}</h3>
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStepStatusStyle(currentStep)}`}>
                  {getStepStatus(currentStep)}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Expected Materials</h4>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                    {Object.keys(currentStep.expected_materials).length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(currentStep.expected_materials).map(([key, value]) => (
                          <li key={key}>{key}: {value}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No materials specified</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Budget</h4>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-medium">${currentStep.expected_budget?.toLocaleString() || 'Not specified'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        currentStep.is_approved ? 'bg-green-500' : 
                        currentStep.actual_completed ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></div>
                      <p>{getStepStatus(currentStep)}</p>
                    </div>
                    {currentStep.actual_completed && (
                      <p className="text-sm text-gray-500 mt-1">
                        Completed on: {new Date(currentStep.actual_completed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No steps available for this project</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
