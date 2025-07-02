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
  RiDeleteBinLine,
  RiCloseLine,
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

interface Bill {
  id: string;
  url: string;
  filename: string;
}

interface Invoice {
  id: string;
  step_title: string;
  status?: string;
  amount?: number;
  bills?: Bill[];
  data: any;
  is_approved: boolean;
  created: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export default function SupervisorProjectsPage() {
  const token = useAuthStore((s) => s.token);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'timeline' | 'invoices'>('overview');
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!token) return;
    
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_BASE}/projects/supervisor_projects/`, {
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

                  {/* Status Section */}
                  <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 mb-6 group-hover:from-emerald-100 group-hover:to-green-100 transition-all duration-500">
                    <div className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      Project Status
                    </div>
                    <div className={`text-lg font-bold px-3 py-1 rounded-full text-sm ${
                      project.is_completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {project.is_completed ? 'Completed' : 'In Progress'}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  {/* <div className="mb-4">
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
                  </div> */}

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
              {activeTab === 'invoices' && <ProjectInvoices project={selectedProject} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Project Overview Component
function ProjectOverview({ project }: { project: Project }) {
  const token = useAuthStore((s) => s.token);
  // Supervisor Notes State
  const [note, setNote] = useState<string>('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteEditing, setNoteEditing] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const supervisorId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

  // Fetch supervisor note for this project
  useEffect(() => {
    if (userRole !== 'SUPERVISOR' || !token || !project.id) return;
    setNoteLoading(true);
    fetch(`${API_BASE}/projects/supervisor-notes/?project=${project.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {
            console.error("Error response body:", text);
            throw new Error("Request failed");
          });
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        } else {
          return res.text().then(text => {
            console.error("Non-JSON response:", text);
            throw new Error("Expected JSON, got something else");
          });
        }
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setNote(data[0].note);
          setNoteId(data[0].id);
        } else {
          setNote('');
          setNoteId(null);
        }
        setNoteLoading(false);
      })
      .catch(() => {
        setNote('');
        setNoteId(null);
        setNoteLoading(false);
      });
  }, [project.id, token, userRole]);

  // Add or update note
  const handleNoteSave = async () => {
    setNoteLoading(true);
    setNoteError(null);
    try {
      const url = noteId
        ? `${API_BASE}/projects/supervisor-notes/${noteId}/`
        : `${API_BASE}/projects/supervisor-notes/`;
      const method = noteId ? 'PATCH' : 'POST';
      const body = noteId
        ? JSON.stringify({ note })
        : JSON.stringify({ note, project: project.id });
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });
      if (!res.ok) throw new Error('Failed to save note');
      const data = await res.json();
      setNote(data.note);
      setNoteId(data.id);
      setNoteEditing(false);
    } catch (err) {
      setNoteError('Could not save note.');
    } finally {
      setNoteLoading(false);
    }
  };

  // Delete note
  const handleNoteDelete = async () => {
    if (!noteId) return;
    if (!window.confirm('Delete your note for this project?')) return;
    setNoteLoading(true);
    setNoteError(null);
    try {
      const res = await fetch(`${API_BASE}/projects/supervisor-notes/${noteId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete note');
      setNote('');
      setNoteId(null);
      setNoteEditing(false);
    } catch (err) {
      setNoteError('Could not delete note.');
    } finally {
      setNoteLoading(false);
    }
  };

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

      

      {/* Site Supervisor Notes Section */}
      <SiteSupervisorNotes projectId={project.id} />
    </div>
  );
}

function SiteSupervisorNotes({ projectId }: { projectId: string }) {
  const token = useAuthStore((s) => s.token);
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const [note, setNote] = useState<string>('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteEditing, setNoteEditing] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    if (userRole !== 'SUPERVISOR' || !token || !projectId) return;
    setNoteLoading(true);
    fetch(`${API_BASE}/projects/supervisor-notes/?project=${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {
            console.error("Error response body:", text);
            throw new Error("Request failed");
          });
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        } else {
          return res.text().then(text => {
            console.error("Non-JSON response:", text);
            throw new Error("Expected JSON, got something else");
          });
        }
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setNote(data[0].note);
          setNoteId(data[0].id);
        } else {
          setNote('');
          setNoteId(null);
        }
        setNoteLoading(false);
      })
      .catch(() => {
        setNote('');
        setNoteId(null);
        setNoteLoading(false);
      });
  }, [projectId, token, userRole]);

  const handleNoteSave = async () => {
    setNoteLoading(true);
    setNoteError(null);
    try {
      const url = noteId
        ? `${API_BASE}/projects/supervisor-notes/${noteId}/`
        : `${API_BASE}/projects/supervisor-notes/`;
      const method = noteId ? 'PATCH' : 'POST';
      const body = noteId
        ? JSON.stringify({ note })
        : JSON.stringify({ note, project: projectId });
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });
      if (!res.ok) throw new Error('Failed to save note');
      const data = await res.json();
      setNote(data.note);
      setNoteId(data.id);
      setNoteEditing(false);
    } catch (err) {
      setNoteError('Could not save note.');
    } finally {
      setNoteLoading(false);
    }
  };

  const handleNoteDelete = async () => {
    if (!noteId) return;
    if (!window.confirm('Delete your note for this project?')) return;
    setNoteLoading(true);
    setNoteError(null);
    try {
      const res = await fetch(`${API_BASE}/projects/supervisor-notes/${noteId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete note');
      setNote('');
      setNoteId(null);
      setNoteEditing(false);
    } catch (err) {
      setNoteError('Could not delete note.');
    } finally {
      setNoteLoading(false);
    }
  };

  if (userRole !== 'SUPERVISOR') return null;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-200 rounded-3xl p-8 shadow-xl mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl shadow-lg">
          <RiUserLine className="text-white text-xl" />
        </div>
        <h3 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
          Site Supervisor Notes
          {!noteEditing && (
            <>
              <button onClick={() => setNoteEditing(true)} className="ml-2 text-blue-600 hover:text-blue-800" title="Edit Note"><RiEditLine /></button>
              {note && <button onClick={handleNoteDelete} className="ml-2 text-red-600 hover:text-red-800" title="Delete Note"><RiDeleteBinLine /></button>}
            </>
          )}
        </h3>
      </div>
      <div className="bg-white/70 rounded-2xl p-6 backdrop-blur-sm">
        {noteLoading ? (
          <div className="text-gray-500">Loading...</div>
        ) : noteEditing ? (
          <div className="space-y-4">
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              disabled={noteLoading}
            />
            <div className="flex gap-2">
              <button onClick={handleNoteSave} disabled={noteLoading} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"><RiCheckLine />Save</button>
              <button onClick={() => setNoteEditing(false)} disabled={noteLoading} className="flex items-center gap-1 bg-gray-300 px-4 py-2 rounded-xl hover:bg-gray-400 disabled:opacity-50"><RiCloseLine />Cancel</button>
            </div>
            {noteError && <div className="text-red-600 text-sm">{noteError}</div>}
          </div>
        ) : (
          <p className="text-emerald-900 leading-relaxed text-lg">{note || <span className="text-slate-400 italic">No notes added yet.</span>}</p>
        )}
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
        {project.steps.slice(0, 6).map((step) => (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-[350px] max-w-full p-6 relative overflow-y-auto max-h-[90vh] flex flex-col items-center">
            {/* Close Icon */}
            <button
              onClick={() => setShowUploadForm(false)}
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-blue-600 focus:outline-none z-10"
              aria-label="Close"
            >
              <RiCloseLine className="text-2xl" />
            </button>
            {/* Modal Header */}
            <div className="w-full flex flex-col items-center mb-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-violet-100 mb-2">
                <RiUploadLine className="text-3xl text-violet-500" />
              </div>
              <h3 className="text-xl font-bold text-violet-700 mb-1 text-center">Add Progress Log</h3>
              <p className="text-gray-500 text-sm text-center mb-2">Document your project progress with details and media</p>
            </div>
            {/* Modal Body */}
            <form className="w-full flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Project Phase</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-base">
                  <option value="">Choose a phase...</option>
                  {project.steps.map((step) => (
                    <option key={step.id} value={step.id}>{step.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Log Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-base"
                  placeholder="Enter a descriptive title..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-base resize-none"
                  placeholder="Describe the progress made, challenges faced, and next steps..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Upload Media Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-violet-400 transition-colors duration-300 group cursor-pointer">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-50 mx-auto mb-2">
                    <RiUploadLine className="text-xl text-violet-500" />
                  </div>
                  <p className="text-sm text-gray-700 mb-1">Drag and drop files here</p>
                  <p className="text-xs text-gray-400">Images, Videos, PDFs (Max 10MB each)</p>
                  <input type="file" multiple className="hidden" accept="image/*,video/*,.pdf" />
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 text-white px-4 py-2 rounded font-semibold hover:bg-violet-700 shadow text-base"
                >
                  Get the chance
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      console.error("Access token not found.");
      setLoading(false);
      return;
    }

    console.log("Token being used for invoices:", token);

    fetch(`${API_BASE}/projects/invoices/?project=${project.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          return res.text().then(text => {
            console.error("Error response body:", text);
            throw new Error(`Request failed with status ${res.status}`);
          });
        }
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        } else {
          return res.text().then(text => {
            console.error("Non-JSON response (status:", res.status, "):", text);
            throw new Error("Expected JSON, got something else");
          });
        }
      })
      .then(data => {
        setInvoices(Array.isArray(data) ? data : data.results || []);
      })
      .catch(error => {
        console.error("Error fetching invoices:", error);
      })
      .finally(() => setLoading(false));
  }, [project.id, token]);

  const handleAddInvoice = async () => {
    const stepId = project.steps[0]?.id;
    if (!stepId) return alert("No steps available for this project.");

    if (!token) {
      alert("You are not logged in.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/invoices/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: stepId,
          data: {
            total: 0,
            items: [],
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error creating invoice:", errorData);
        alert("Failed to create invoice.");
        return;
      }

      // Refetch updated invoice list
      const refreshed = await fetch(`${API_BASE}/projects/invoices/?project=${project.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const newData = await refreshed.json();
      setInvoices(Array.isArray(newData) ? newData : newData.results || []);
    } catch (err) {
      console.error("Error adding invoice:", err);
    }
  };

  if (loading) return <div>Loading invoices...</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Invoices & Billing</h2>

      {invoices.length === 0 ? (
        <div>No invoices yet.</div>
      ) : (
        invoices.map((inv) => (
          <div key={inv.id} className="mb-4 p-4 border rounded bg-gray-50">
            <p><strong>Phase:</strong> {inv.step_title}</p>
            <p><strong>Status:</strong> {inv.is_approved ? "Approved" : "Draft"}</p>
            <p><strong>Amount:</strong> {inv.amount ?? inv.data?.total ?? "N/A"}</p>
            <p><strong>Date:</strong> {new Date(inv.created).toLocaleString()}</p>
            {inv.bills && inv.bills.length > 0 && (
              <div className="mt-2">
                <p><strong>Bills:</strong></p>
                <ul className="list-disc ml-6">
                  {inv.bills.map((bill) => (
                    <li key={bill.id}>
                      {/* {bill.title}: {bill.amount} */}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}

      <button
        onClick={handleAddInvoice}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Invoice
      </button>
    </div>
  );
}




