'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import axios from 'axios';
import {
  RiBuildingLine,
  RiCalendarLine,
  RiMapPinLine,
  RiUserLine,
  RiFileTextLine,
  RiCameraLine,
  RiVideoLine,
  RiUploadLine,
  RiCheckLine,
  RiTimeLine,
  RiProgress1Line,
  RiEyeLine,
  RiEditLine,
  RiDownloadLine,
  RiArrowRightLine,
  RiPlayLine,
  RiPauseLine,
} from 'react-icons/ri';

interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  estimated_end_date: string;
  boq_file?: string;
  is_completed: boolean;
  location: string;
  status: boolean;
  currentStep: string;
  client: string;
  budget: number;
  progress:number;
  steps: ProjectStep[];
}

interface ProjectStep {
  id: string;
  name: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
  progress: number;
  logs: ProgressLog[];
}

interface ProgressLog {
  id: string;
  stepId: string;
  title: string;
  description: string;
  media: MediaFile[];
  timestamp: string;
  type: 'TEXT' | 'PHOTO' | 'VIDEO';
}

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video' | 'pdf';
  filename: string;
}

export default function SupervisorProjectsPage() {
  const token = useAuthStore((s) => s.token);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'timeline' | 'invoices'>('overview');

  useEffect(() => {
    if (!token) return;
    
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/projects/supervisor_projects/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        } finally {
        setLoading(false);
      }
    };
        
      

    fetchProjects();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl mb-6 animate-pulse hover:animate-none hover:scale-110 transition-all duration-500">
            <RiBuildingLine className="text-white text-3xl animate-bounce" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4 tracking-tight animate-fade-in">
            <span className="inline-block animate-slide-in-left">Site</span>{' '}
            <span className="inline-block animate-slide-in-right">Supervisor</span>{' '}
            <span className="inline-block animate-slide-in-up">Dashboard</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in-delay">
            Manage assigned projects and track construction progress with{' '}
            <span className="text-blue-600 font-bold animate-pulse">precision</span> and{' '}
            <span className="text-indigo-600 font-bold animate-pulse">efficiency</span>
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-bounce-in">
              <span className="flex items-center gap-2">
                <RiPlayLine className="animate-pulse" />
                Active Projects: {projects.filter(p => p.status).length}
              </span>
            </div>
            <div className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-bounce-in-delay">
              <span className="flex items-center gap-2">
                <RiProgress1Line className="animate-spin" />
                Total: {projects.length}
              </span>
            </div>
          </div>
        </div>

        {/* Project Selection */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-12 border border-white/30">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Assigned Projects</h2>
              <p className="text-slate-600 font-medium">Select a project to view detailed information and manage progress</p>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
                <span className="text-sm font-semibold text-green-800">Active Projects: {projects.filter(p => p.status).length}</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-200">
                <span className="text-sm font-semibold text-blue-800">Total: {projects.length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-700 hover:scale-105 hover:shadow-3xl ${
                  selectedProject?.id === project.id
                    ? 'ring-4 ring-blue-500/30 shadow-3xl'
                    : 'shadow-2xl hover:shadow-4xl'
                }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  selectedProject?.id === project.id
                    ? 'from-blue-500/10 via-indigo-500/10 to-purple-500/10'
                    : 'from-slate-50 via-white to-blue-50/40'
                } group-hover:from-blue-100/60 group-hover:via-indigo-100/60 group-hover:to-purple-100/60 transition-all duration-700`}></div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full translate-y-16 -translate-x-16"></div>
                
                {/* Content */}
                <div className="relative p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-500 leading-tight">
                      {project.name}
                    </h3>
                    <div className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg ${
                      project.status 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                        : 'bg-gradient-to-r from-slate-400 to-gray-500 text-white'
                    }`}>
                      {project.status ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl backdrop-blur-sm border border-white/50">
                      <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                        <RiMapPinLine className="text-white text-lg" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">Location</div>
                        <div className="text-slate-600">{project.location}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl backdrop-blur-sm border border-white/50">
                      <div className="p-3 bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl shadow-lg">
                        <RiCalendarLine className="text-white text-lg" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-700">Timeline</div>
                        <div className="text-sm text-slate-600">
                          {new Date(project.start_date).toLocaleDateString()} - {new Date(project.estimated_end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOQ File */}
                  {project.boq_file && (
                    <div className="mb-6">
                      <a
                        href={`http://localhost:8000${project.boq_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-xl hover:shadow-2xl group/btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RiDownloadLine className="text-xl group-hover/btn:scale-110 transition-transform duration-300" />
                        <span className="font-semibold">Download BOQ</span>
                      </a>
                    </div>
                  )}

                  {/* Current Step */}
                  <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 mb-6 group-hover:from-indigo-100 group-hover:to-purple-100 transition-all duration-500">
                    <div className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      Current Phase
                    </div>
                    <div className="text-lg font-bold text-indigo-900 animate-pulse">{project.currentStep}</div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
                      <span>Overall Progress</span>
                      <span className="text-blue-600 animate-pulse font-bold">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner group-hover:h-5 transition-all duration-500">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-1500 ease-out shadow-lg group-hover:shadow-xl relative overflow-hidden progress-animate"
                        style={{ width: `${project.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>

                  {/* Animated Action Button */}
                  <div className="mt-6">
                    <button 
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group/btn btn-animate"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                    >
                      <span className="group-hover/btn:translate-x-1 transition-transform duration-300">View Details</span>
                      <RiArrowRightLine className="text-xl group-hover/btn:translate-x-2 transition-transform duration-300" />
                    </button>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-indigo-600/0 group-hover:from-blue-600/5 group-hover:to-indigo-600/5 transition-all duration-700 rounded-3xl"></div>
                  
                  {/* Floating Animation Elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute bottom-4 left-4 w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/2 right-8 w-1 h-1 bg-purple-400 rounded-full animate-float"></div>
                  <div className="absolute bottom-1/3 left-6 w-1.5 h-1.5 bg-blue-300 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Details */}
        {selectedProject && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/30">
            {/* Tab Navigation */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
              <div className="flex space-x-2 p-6">
                {[
                  { id: 'overview', label: 'Project Overview', icon: RiEyeLine },
                  { id: 'progress', label: 'Progress Logs', icon: RiProgress1Line },
                  { id: 'timeline', label: 'Project Timeline', icon: RiTimeLine },
                  { id: 'invoices', label: 'Invoices & Billing', icon: RiFileTextLine }
                ].map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl scale-105 animate-pulse'
                        : 'text-slate-600 hover:text-blue-700 hover:bg-white/80 hover:shadow-lg'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <tab.icon className={`text-xl ${activeTab === tab.id ? 'animate-bounce' : 'group-hover:animate-pulse'}`} />
                    <span className="relative">
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-white animate-slide-in-left"></div>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-10">
              {activeTab === 'overview' && <ProjectOverview project={selectedProject} />}
              {activeTab === 'progress' && <ProgressLogs project={selectedProject} />} 
              {activeTab === 'timeline' && <ProjectTimeline project={selectedProject} />}
              {/* {activeTab === 'invoices' && <ProjectInvoices project={selectedProject} />} */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Project Overview Component
function ProjectOverview({ project }: { project: Project }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Project Overview</h2>
        <p className="text-slate-600 font-medium">Comprehensive project information and current status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Details Card */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg">
              <RiBuildingLine className="text-white text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Project Details</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/70 rounded-2xl backdrop-blur-sm">
              <span className="text-slate-600 font-medium">Project Name:</span>
              <span className="font-semibold text-slate-800">{project.name}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/70 rounded-2xl backdrop-blur-sm">
              <span className="text-slate-600 font-medium">Description:</span>
              <span className="font-semibold text-slate-800 max-w-xs text-right">{project.description}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/70 rounded-2xl backdrop-blur-sm">
              <span className="text-slate-600 font-medium">Start Date:</span>
              <span className="font-semibold text-slate-800">{new Date(project.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/70 rounded-2xl backdrop-blur-sm">
              <span className="text-slate-600 font-medium">End Date:</span>
              <span className="font-semibold text-slate-800">{new Date(project.estimated_end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/70 rounded-2xl backdrop-blur-sm">
              <span className="text-slate-600 font-medium">BOQ File:</span>
              <span className="font-semibold">
                {project.boq_file ? (
                  <a
                    href={`http://localhost:8000${project.boq_file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-slate-400">Not available</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/70 rounded-2xl backdrop-blur-sm">
              <span className="text-slate-600 font-medium">Status:</span>
              <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                project.is_completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {project.is_completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Status Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl border border-emerald-200 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl shadow-lg">
              <RiProgress1Line className="text-white text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Current Status</h3>
          </div>
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="p-6 bg-white/70 rounded-2xl backdrop-blur-sm">
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
                <span>Overall Progress</span>
                <span className="text-emerald-600 animate-pulse font-bold">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-full transition-all duration-1500 ease-out shadow-lg progress-animate"
                  style={{ width: `${project.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>

            {/* Current Phase */}
            <div className="p-6 bg-white/70 rounded-2xl backdrop-blur-sm text-center group hover:bg-white/90 transition-all duration-300">
              <div className="text-sm font-semibold text-emerald-800 mb-2 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Current Phase
              </div>
              <div className="text-2xl font-bold text-emerald-900 animate-pulse group-hover:scale-105 transition-transform duration-300">{project.currentStep}</div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/70 rounded-2xl backdrop-blur-sm text-center group hover:bg-white/90 transition-all duration-300 hover-lift">
                <div className="text-2xl font-bold text-slate-800 animate-pulse group-hover:scale-110 transition-transform duration-300">{project.steps.length}</div>
                <div className="text-sm text-slate-600">Total Phases</div>
              </div>
              <div className="p-4 bg-white/70 rounded-2xl backdrop-blur-sm text-center group hover:bg-white/90 transition-all duration-300 hover-lift">
                <div className="text-2xl font-bold text-slate-800 animate-pulse group-hover:scale-110 transition-transform duration-300">
                  {project.steps.filter(step => step.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-slate-600">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Description */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50 border border-slate-200 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg">
            <RiFileTextLine className="text-white text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Project Description</h3>
        </div>
        <div className="bg-white/70 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-slate-700 leading-relaxed text-lg">{project.description}</p>
        </div>
      </div>
    </div>
  );
}

// Progress Logs Component
function ProgressLogs({ project }: { project: Project }) {
  const [selectedStep, setSelectedStep] = useState<ProjectStep | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Progress Logs</h2>
        <p className="text-slate-600 font-medium">Track and manage project progress through detailed logs and documentation</p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg">
            <RiProgress1Line className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Project Phases</h3>
            <p className="text-slate-600">Select a phase to view detailed progress logs</p>
          </div>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 group/upload"
        >
          <RiUploadLine className="text-xl group-hover/upload:animate-bounce" />
          <span className="group-hover/upload:translate-x-1 transition-transform duration-300">Add Progress Log</span>
        </button>
      </div>

      {/* Steps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.steps.map((step) => (
          <div
            key={step.id}
            onClick={() => setSelectedStep(step)}
            className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
              selectedStep?.id === step.id
                ? 'ring-4 ring-blue-500 ring-opacity-50 shadow-2xl'
                : 'shadow-xl hover:shadow-3xl'
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${
              selectedStep?.id === step.id
                ? 'from-blue-500/10 via-purple-500/10 to-indigo-500/10'
                : 'from-gray-50 via-white to-blue-50/30'
            } group-hover:from-blue-100/50 group-hover:via-purple-100/50 group-hover:to-indigo-100/50 transition-all duration-500`}></div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full translate-y-8 -translate-x-8"></div>
            
            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                  {step.name}
                </h4>
                <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                  step.status === 'COMPLETED' 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                    : step.status === 'IN_PROGRESS'
                    ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                }`}>
                  {step.status}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{step.description}</p>

              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span className="font-bold animate-pulse text-blue-600">{step.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden group-hover:h-4 transition-all duration-500">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${step.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>

              {/* Logs Count */}
              <div className="flex items-center gap-2 p-3 bg-white/60 rounded-xl backdrop-blur-sm group-hover:bg-white/80 transition-all duration-300">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <RiFileTextLine className="text-white text-sm animate-pulse" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  <span className="animate-pulse font-bold">{step.logs.length}</span> logs submitted
                </span>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-500 rounded-2xl"></div>
              
              {/* Floating Animation Elements */}
              <div className="absolute top-3 right-3 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute bottom-3 left-3 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

     {/* Selected Step Logs */}
        {selectedStep && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 shadow-xl border border-gray-100">
          <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <RiFileTextLine className="text-white text-xl" />
            </div>
            {selectedStep.name} - Progress Logs
          </h4>
          <div className="space-y-6">
            {selectedStep.logs.map((log) => (
              <div key={log.id} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                      {log.title}
                    </h5>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                        <RiTimeLine className="text-white text-sm" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-4 leading-relaxed">{log.description}</p>
                  
                  {/* Media Files */}
                  {log.media.length > 0 && (
                    <div className="space-y-3">
                      <h6 className="font-semibold text-gray-700 flex items-center gap-2">
                        <RiCameraLine className="text-blue-500" />
                        Attached Media ({log.media.length})
                      </h6>
                      <div className="flex gap-3 flex-wrap">
                        {log.media.map((media) => (
                          <div key={media.id} className="group/media relative overflow-hidden w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center hover:from-blue-100 hover:to-purple-100 transition-all duration-300 shadow-md hover:shadow-lg">
                            {media.type === 'image' && (
                              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                                <RiCameraLine className="text-white text-xl" />
                              </div>
                            )}
                            {media.type === 'video' && (
                              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                                <RiVideoLine className="text-white text-xl" />
                              </div>
                            )}
                            {media.type === 'pdf' && (
                              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                                <RiFileTextLine className="text-white text-xl" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-all duration-300 rounded-xl"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Log Type Badge */}
                  <div className="mt-4 flex justify-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                      log.type === 'PHOTO' 
                        ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                        : log.type === 'VIDEO'
                        ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                    }`}>
                      {log.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Add Progress Log</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Step</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {project.steps.map((step) => (
                    <option key={step.id} value={step.id}>{step.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter log title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the progress made..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Media</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <RiUploadLine className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Drag and drop files here or click to browse</p>
                  <input type="file" multiple className="hidden" />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700"
                >
                  Submit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Project Timeline Component
function ProjectTimeline({ project }: { project: Project }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Project Timeline</h2>
        <p className="text-slate-600 font-medium">Visual representation of project phases and milestones</p>
      </div>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
        
        <div className="space-y-10">
          {project.steps.map((step, index) => (
            <div key={step.id} className="relative flex items-start">
              {/* Timeline Dot */}
              <div className={`absolute left-6 w-5 h-5 rounded-full border-4 shadow-lg ${
                step.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 animate-pulse' :
                step.status === 'IN_PROGRESS' ? 'bg-blue-500 border-blue-500 animate-ping' :
                'bg-slate-300 border-slate-300'
              }`}>
                {step.status === 'IN_PROGRESS' && (
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
              
              {/* Content */}
              <div className="ml-16 bg-white/90 backdrop-blur-sm border border-white/30 rounded-3xl p-8 flex-1 shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-slate-800">{step.name}</h4>
                  <div className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg ${
                    step.status === 'COMPLETED' 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                      : step.status === 'IN_PROGRESS'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gradient-to-r from-slate-400 to-gray-500 text-white'
                  }`}>
                    {step.status}
                  </div>
                </div>
                
                <p className="text-slate-600 mb-6 leading-relaxed text-lg">{step.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-slate-500 mb-6">
                  {step.startDate && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
                        <RiCalendarLine className="text-white text-sm" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700">Start Date</div>
                        <div className="text-slate-600">{new Date(step.startDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                  {step.endDate && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-md">
                        <RiCalendarLine className="text-white text-sm" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700">End Date</div>
                        <div className="text-slate-600">{new Date(step.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md">
                      <RiProgress1Line className="text-white text-sm" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-700">Progress</div>
                      <div className="text-slate-600">{step.progress}% Complete</div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1500 ease-out shadow-lg"
                      style={{ width: `${step.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {step.logs.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg shadow-md">
                        <RiFileTextLine className="text-white text-sm" />
                      </div>
                      Recent Progress Logs ({step.logs.length})
                    </h5>
                    <div className="space-y-3">
                      {step.logs.slice(0, 3).map((log) => (
                        <div key={log.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200 border border-slate-100">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-md"></div>
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-slate-700">{log.title}</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Project Invoices Component
function ProjectInvoices({ project }: { project: Project }) {
  const [invoices, setInvoices] = useState([
    {
      id: '1',
      phase: 'Foundation',
      amount: 25000,
      status: 'DRAFT',
      submittedDate: '2024-01-15',
      verified: false,
      bills: ['foundation_materials.pdf', 'labor_costs.pdf']
    },
    {
      id: '2',
      phase: 'Framing',
      amount: 35000,
      status: 'PENDING_VERIFICATION',
      submittedDate: '2024-01-20',
      verified: false,
      bills: ['framing_materials.pdf', 'contractor_bill.pdf']
    }
  ]);
}
  // return (
  //   <div className="space-y-6">
  //     <div className="flex justify-between items-center">
  //       <h3 className="text-2xl font-semibold text-gray-800">Project Invoices</h3>
  //       <button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg">
  //         <RiFileTextLine className="text-lg" />
  //         Generate Invoice
  //       </button>
  //     </div>

  //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //       {invoices.map((invoice) => (
  //         <div key={invoice.id} className="bg-white border border-gray-200 rounded-xl p-6">
  //           <div className="flex items-center justify-between mb-4">
  //             <h4 className="text-lg font-semibold text-gray-800">{invoice.phase}</h4>
  //             <span className={`px-3 py-1 rounded-full text-xs font-medium ${
  //               invoice.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
  //               invoice.status === 'PENDING_VERIFICATION' ? 'bg-blue-100 text-blue-700' :
  //               invoice.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
  //               'bg-gray-100 text-gray-700'
  //             }`}>
  //               {invoice.status.replace('_', ' ')}
  //             </span>
  //           </div>
            
  //           <div className="space-y-3 mb-4">
  //             <div className="flex justify-between">
  //               <span className="text-gray-600">Amount:</span>
  //               <span className="font-semibold">${invoice.amount.toLocaleString()}</span>
  //             </div>
  //             <div className="flex justify-between">
  //               <span className="text-gray-600">Submitted:</span>
  //               <span>{new Date(invoice.submittedDate).toLocaleDateString()}</span>
  //             </div>
  //             <div className="flex justify-between">
  //               <span className="text-gray-600">Bills:</span>
  //               <span>{invoice.bills.length} files</span>
  //             </div>
  //           </div>

  //           <div className="space-y-2 mb-4">
  //             <h5 className="font-medium text-gray-800">Attached Bills:</h5>
  //             {invoice.bills.map((bill, index) => (
  //               <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
  //                 <span className="text-sm text-gray-600">{bill}</span>
  //                 <button className="text-blue-600 hover:text-blue-700">
  //                   <RiDownloadLine className="text-lg" />
  //                 </button>
  //               </div>
  //             ))}
  //           </div>

  //           <div className="flex gap-3">
  //             <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
  //               <RiEyeLine />
  //               View Invoice
  //             </button>
  //             <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
  //               <RiCheckLine />
  //               Verify
  //             </button>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );


