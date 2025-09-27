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
  RiDeleteBinLine,
  RiCloseLine,
} from 'react-icons/ri';
import Image from 'next/image';
import { FiSearch, FiFilter, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  estimated_end_date: string;
  boq_file?: string;
  is_completed: boolean;
  location: string;
  status: string; // backend returns 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED'
  current_step?: string; // backend field
  currentStep?: string; // optional legacy/local field
  client: string;
  budget: number;
  progress: number;
  steps: ProjectStep[];
  thumbnail?: string;
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

interface Invoice {
  id: string;
  phase: string;
  amount: number;
  status: string;
  submittedDate: string;
  verified: boolean;
  bills: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Shared helper: build absolute URL for media and thumbnails
const toAbsolute = (input?: string) => {
  if (!input) return '';
  let s = String(input).trim();
  // If the string contains multiple 'http' segments (e.g., '.../apihttp://host/media/...'),
  // keep the last absolute URL segment.
  const firstHttp = s.indexOf('http');
  if (firstHttp !== -1) {
    const secondHttp = s.indexOf('http', firstHttp + 1);
    if (secondHttp > 0) {
      s = s.slice(secondHttp);
    } else if (firstHttp > 0) {
      s = s.slice(firstHttp);
    }
  }
  // Normalize accidental '/apihttp' concatenations and '/api ' + http (with whitespace)
  s = s.replace('/apihttp', 'http');
  s = s.replace(/\/api\s+(?=http)/, '');
  // Normalize '/api/media/...' -> '/media/...'
  s = s.replace(/\b\/api\/(?=media\/)/, '/');
  // Determine the backend origin preference
  const backendOrigin = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
  let origin = backendOrigin;
  if (!origin) {
    try {
      const u = new URL(API_BASE);
      origin = u.origin;
    } catch {
      origin = API_BASE.replace(/\/?api\/?$/, '');
    }
  }
  // If already absolute or blob/data, return as-is
  if (s.startsWith('http') || s.startsWith('blob:') || s.startsWith('data:')) return s;
  // If already starts with origin, return
  if (origin && s.startsWith(origin)) return s;
  // Otherwise prefix origin
  if (s.startsWith('/')) return `${origin}${s}`;
  return `${origin}/${s}`;
};

export default function SupervisorProjectsPage() {
  const token = useAuthStore((s) => s.token);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'timeline' | 'invoices'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const router = useRouter();

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b4965] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => (p.status === 'IN_PROGRESS' || p.status === 'PLANNING') && !p.is_completed).length;
  const completedProjects = projects.filter(p => p.is_completed || p.status === 'COMPLETED').length;
  const upcomingProjects = projects.filter(p => p.status === 'PLANNING' && !p.is_completed && new Date(p.start_date) > new Date()).length;

  // Filtered projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && project.status === 'IN_PROGRESS') ||
      (statusFilter === 'Completed' && (project.is_completed || project.status === 'COMPLETED')) ||
      (statusFilter === 'Upcoming' && project.status === 'PLANNING');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-0 px-0">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm py-6 px-2">
          <button onClick={() => router.push('/dashboard/supervisor')} className="text-[#1b4965] hover:text-[#1b4965]">Dashboard</button>
          <span className="mx-2 text-[#1b4965]">/</span>
          <span className="text-[#1b4965] font-semibold">Projects</span>
        </nav>

        {/* Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow p-6 mb-8 border border-white/20">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-full max-w-xs">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent transition-all duration-200 w-full"
              />
            </div>
            <div className="relative w-40">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent transition-all duration-200 appearance-none w-full"
                title="Filter projects by status"
                aria-label="Filter projects by status"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-blue-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <RiBuildingLine className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalProjects}</div>
                <div className="text-xs text-blue-600 font-medium">Total Projects</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-green-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{completedProjects}</div>
                <div className="text-xs text-green-600 font-medium">Completed</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-amber-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <FiClock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeProjects}</div>
                <div className="text-xs text-amber-600 font-medium">Active</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-purple-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{upcomingProjects}</div>
                <div className="text-xs text-purple-600 font-medium">Upcoming</div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:scale-[1.02] overflow-hidden"
                onClick={() => setSelectedProject(project)}
              >
                {/* Thumbnail */}
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-200">
                  {project.thumbnail ? (
                    <Image
                      src={toAbsolute(project.thumbnail)}
                      alt={project.name}
                      width={400}
                      height={160}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector(".fallback");
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center ${project.thumbnail ? 'hidden' : ''}`}>
                    <Image
                      src={toAbsolute(project.thumbnail)}
                      alt={project.name}
                      width={400}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1b4965] transition-colors">
                      {project.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      (project.is_completed || project.status === 'COMPLETED')
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {project.is_completed || project.status === 'COMPLETED' ? 'Completed' : project.status === 'IN_PROGRESS' ? 'Active' : 'Upcoming'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <FiCalendar className="w-4 h-4" />
                    {new Date(project.start_date).toLocaleDateString()} - {new Date(project.estimated_end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <RiMapPinLine className="w-4 h-4" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#1b4965] h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-[#1b4965] font-semibold ml-2">{project.progress}%</span>
                  </div>
                  <button
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-[#1b4965] text-white px-4 py-2 rounded-xl font-semibold hover:transition-transform duration-300 group-hover:translate-x-1"
                    onClick={e => {
                      e.stopPropagation();
                      router.push(`/dashboard/supervisor/projects/${project.id}`);
                    }}
                  >
                    View Details <RiArrowRightLine className="text-lg" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <RiBuildingLine className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 text-center max-w-md">
                No projects match your current search criteria. Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>

        {/* Project Details Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 relative overflow-y-auto max-h-[90vh] flex flex-col items-center border border-slate-200">
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-[#1b4965] focus:outline-none z-10"
                aria-label="Close"
              >
                <RiCloseLine className="text-2xl" />
              </button>
              {/* Tab Navigation and Content */}
              <div className="w-full">
                {/* Tab Navigation */}
                <div className="flex space-x-2 mb-6">
                  {[
                    { id: 'overview', label: 'Project Overview', icon: RiEyeLine },
                    { id: 'progress', label: 'Progress Logs', icon: RiProgress1Line },
                    { id: 'timeline', label: 'Project Timeline', icon: RiTimeLine },
                    { id: 'invoices', label: 'Invoices & Billing', icon: RiFileTextLine }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'overview' | 'progress' | 'timeline' | 'invoices')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-[#1b4965] text-white shadow'
                          : 'text-slate-600 hover:text-[#1b4965]-700 hover:bg-white/80 hover:shadow'
                      }`}
                    >
                      {(() => { const Icon = tab.icon; return <Icon className="text-lg" />; })()}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
                <div className="p-2">
                  {activeTab === 'overview' && <ProjectOverview project={selectedProject} />}
                  {activeTab === 'progress' && <ProgressLogs project={selectedProject} />}
                  {activeTab === 'timeline' && <ProjectTimeline project={selectedProject} />}
                  {activeTab === 'invoices' && <ProjectInvoices project={selectedProject} />}
                </div>
              </div>
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
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

  // Fetch supervisor note for this project
  useEffect(() => {
    if (userRole !== 'SUPERVISOR' || !token || !project.id) return;
    fetch(`${API_BASE}/projects/supervisor-notes/?project=${project.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
        } else {
        }
      })
      .catch(() => {
      });
  }, [project.id, token, userRole]);

  // Add or update note
  // const handleNoteSave = async () => {
  //   setNoteLoading(true);
  //   setNoteError(null);
  //   try {
  //     const url = noteId
  //       ? `${API_BASE}/projects/supervisor-notes/${noteId}/`
  //       : `${API_BASE}/projects/supervisor-notes/`;
  //     const method = noteId ? 'PATCH' : 'POST';
  //     const body = noteId
  //       ? JSON.stringify({ note })
  //       : JSON.stringify({ note, project: project.id });
  //     const res = await fetch(url, {
  //       method,
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body,
  //     });
  //     if (!res.ok) throw new Error('Failed to save note');
  //     const data = await res.json();
  //     setNote(data.note);
  //     setNoteId(data.id);
  //     setNoteEditing(false);
  //   } catch (err) {
  //     setNoteError('Could not save note.');
  //   } finally {
  //     setNoteLoading(false);
  //   }
  // };

  // // Delete note
  // const handleNoteDelete = async () => {
  //   if (!noteId) return;
  //   if (!window.confirm('Delete your note for this project?')) return;
  //   setNoteLoading(true);
  //   setNoteError(null);
  //   try {
  //     const res = await fetch(`${API_BASE}/projects/supervisor-notes/${noteId}/`, {
  //       method: 'DELETE',
  //       headers: { 'Authorization': `Bearer ${token}` },
  //     });
  //     if (!res.ok) throw new Error('Failed to delete note');
  //     setNote('');
  //     setNoteId(null);
  //     setNoteEditing(false);
  //   } catch (err) {
  //     setNoteError('Could not delete note.');
  //   } finally {
  //     setNoteLoading(false);
  //   }
  // };

  // ---- Project Media (for thumbnails) ----
  interface ProjectMediaItem {
    id: string | number;
    url?: string;
    thumbnail_url?: string;
    file?: string;
    filename?: string;
    media_type?: string; // IMAGE | VIDEO | DOCUMENT
    uploaded_at?: string;
    step?: string | number;
    step_id?: string | number;
    project?: string | number;
    type?: 'image' | 'video' | 'pdf';
  }
  const [mediaLoading, setMediaLoading] = useState(false);
  const [projectMedia, setProjectMedia] = useState<ProjectMediaItem[]>([]);
  const [projectMediaRaw, setProjectMediaRaw] = useState<ProjectMediaItem[]>([]);
  // Derived fallback media from step logs when API list is empty
  const fallbackMediaFromLogs: ProjectMediaItem[] = (project?.steps || [])
    .flatMap((st) => (st.logs || []).flatMap((lg) => (lg.media || [])))
    .map((mf) => ({
      id: mf.id,
      url: mf.url,
      filename: mf.filename,
      type: mf.type,
      media_type: (mf.type || 'image').toString().toUpperCase(),
      project: project?.id,
    }));
  const combinedProjectMedia = projectMedia.length > 0
    ? projectMedia
    : (projectMediaRaw.length > 0 ? projectMediaRaw : fallbackMediaFromLogs);

  // Compute API origin(s) in case we need them elsewhere
  const apiOrigin = (() => {
    try {
      const u = new URL(API_BASE);
      return u.origin;
    } catch {
      return API_BASE.replace(/\/?api\/?$/, '');
    }
  })();
  const backendOrigin = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
  const origin = backendOrigin || apiOrigin;

  // Build a usable media URL from url/thumbnail_url/file
  const getMediaSrc = (m: ProjectMediaItem) => {
    const u = m.thumbnail_url || m.url || m.file;
    return toAbsolute(u as string);
  };

  useEffect(() => {
    if (!project?.id || !token) return;
    setMediaLoading(true);
    // Ask backend for media by project; if backend ignores the filter, we filter client-side below
    fetch(`${API_BASE}/projects/project-media/?project=${project.id}&include_deleted=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        const items: ProjectMediaItem[] = Array.isArray(data)
          ? data
          : (Array.isArray((data as any)?.results) ? (data as any).results : []);
        setProjectMediaRaw(items);
        const byProject = items.filter((m) => String((m as any).project ?? project.id) === String(project.id));
        setProjectMedia(byProject);
      })
      .catch(() => setProjectMedia([]))
      .finally(() => setMediaLoading(false));
  }, [project?.id, token]);

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
                (project.is_completed || project.status === 'COMPLETED')
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'IN_PROGRESS'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {project.is_completed || project.status === 'COMPLETED' ? 'Completed' : project.status === 'IN_PROGRESS' ? 'Active' : 'Upcoming'}
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
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span className="font-bold animate-pulse text-blue-600">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1500 ease-out relative overflow-hidden"
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
              <div className="text-2xl font-bold text-emerald-900 animate-pulse group-hover:scale-105 transition-transform duration-300">{project.current_step || project.currentStep || '—'}</div>
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

      {/* Project Media List */}
      <div className="bg-white/90 rounded-3xl p-6 shadow border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <RiCameraLine className="text-blue-600" /> Project Media
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">
            {combinedProjectMedia.length}
          </span>
        </h3>
        {mediaLoading ? (
          <div className="text-gray-500">Loading media...</div>
        ) : combinedProjectMedia.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {combinedProjectMedia.map((m) => {
              const type = (m.type || (m.media_type || '').toLowerCase()) as 'image' | 'video' | 'pdf' | string;
              const src = getMediaSrc(m);
              return (
                <li key={m.id} className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-200 flex items-center justify-center">
                      {type === 'image' && src ? (
                        src.trim() !== "" ? (
                          <img src={src} alt={m.filename || 'Media'} className="w-full h-full object-cover" />
                        ) : null
                      ) : type === 'video' ? (
                        <RiVideoLine className="w-6 h-6 text-gray-500" />
                      ) : (
                        <RiFileTextLine className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{m.filename || 'Media file'}</div>
                      <div className="text-xs text-gray-500 capitalize truncate">{(m.media_type || (type as string) || 'image').toString().toUpperCase()}</div>
                      {/* Submission Status */}
                      <div className="mt-1">
                        {(m as any).is_submitted_to_admin ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                            <RiCheckLine className="w-3 h-3 mr-1" />
                            Submitted to Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <RiTimeLine className="w-3 h-3 mr-1" />
                            Not Submitted
                          </span>
                        )}
                      </div>
                    </div>
                    {src && (
                      <a href={src} target="_blank" rel="noopener noreferrer" download className="text-blue-600 hover:text-blue-800">
                        <RiDownloadLine className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
         
            // Fallback when there is no media
            // combinedProjectMedia.length === 0 && !mediaLoading
          ) : (
            <div className="text-gray-500">No media found for this project.</div>
          )}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-[10px] text-gray-400 space-y-1">
              <div>Debug: apiMediaFiltered={projectMedia.length}, apiMediaRaw={projectMediaRaw.length}, fallbackFromLogs={fallbackMediaFromLogs.length}</div>
              <div>Sample URL: {combinedProjectMedia[0] ? toAbsolute((combinedProjectMedia[0].thumbnail_url || combinedProjectMedia[0].url || combinedProjectMedia[0].file) as string) : 'n/a'}</div>
            </div>
          )}
        </div>

        {/* Site Supervisor Notes Section */}
        {/* <SiteSupervisorNotes projectId={project.id} /> */}
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
      .then(res => res.json())
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
    } catch {
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
    } catch{
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
              title="Supervisor note"
              aria-label="Supervisor note"
              placeholder="Enter your note here..."
            />
            <div className="flex gap-2">
              <button onClick={handleNoteSave} disabled={noteLoading} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"><RiCheckLine />Save</button>
              <button onClick={() => setNoteEditing(false)} disabled={noteLoading} className="flex items-center gap-1 bg-gray-300 px-4 py-2 rounded-xl hover:bg-gray-400 disabled:opacity-50"><RiCloseLine />Cancel</button>
            </div>
            {noteError && <div className="text-red-600 text-sm">{noteError}</div>}
          </div>
        ) : (
          <div className="text-gray-500">No media found for this project.</div>
        )}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-[10px] text-gray-400 space-y-1">
            {/* <div>Debug: apiMediaFiltered={projectMedia.length}, apiMediaRaw={projectMediaRaw.length}, fallbackFromLogs={fallbackMediaFromLogs.length}</div>
            <div>Sample URL: {combinedProjectMedia[0] ? toAbsolute((combinedProjectMedia[0].thumbnail_url || combinedProjectMedia[0].url || combinedProjectMedia[0].file) as string) : 'n/a'}</div> */}
          </div>
        )}
      </div>

      {/* Site Supervisor Notes Section */}
      {/* <SiteSupervisorNotes projectId={project.id} /> */}
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
                <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
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
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
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
                    <h5 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
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
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select project step"
                  aria-label="Select project step">
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
                  <input 
                    type="file" 
                    multiple 
                    className="hidden"
                    title="Upload project media files"
                    aria-label="Upload project media files"
                  />
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
          {project.steps.map((step) => (
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
function ProjectInvoices({ }: { project: Project }) {
  const [invoices] = useState<Invoice[]>([
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-gray-800">Project Invoices</h3>
        <button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg">
          <RiFileTextLine className="text-lg" />
          Generate Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">{invoice.phase}</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                invoice.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                invoice.status === 'PENDING_VERIFICATION' ? 'bg-blue-100 text-blue-700' :
                invoice.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {invoice.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">${invoice.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span>{new Date(invoice.submittedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bills:</span>
                <span>{invoice.bills.length} files</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <h5 className="font-medium text-gray-800">Attached Bills:</h5>
              {invoice.bills.map((bill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{bill}</span>
                  <button className="text-blue-600 hover:text-blue-800">
                    <RiDownloadLine className="text-lg" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <RiEyeLine />
                View Invoice
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <RiCheckLine />
                Verify
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
