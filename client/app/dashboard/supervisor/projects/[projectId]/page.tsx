"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  RiBuildingLine,
  RiProgress1Line,
  RiTimeLine,
  RiFileTextLine,
  RiEyeLine,
  RiArrowRightLine,
  RiCameraLine,
  RiVideoLine,
  RiUploadLine,
  RiCloseLine,
  RiAddLine,
  RiPlayLine,
  RiDownloadLine,
} from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { fetchWithAuth } from "@/app/utils/auth";

interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  estimated_end_date: string;
  is_completed: boolean;
  status: string;
  progress: number;
  current_step: string;
  steps: Step[];
  thumbnail?: string;
  location: string;
  budget: number;
  media_files: ProjectMedia[];
  supervisor?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Step {
  id: string;
  title: string;
  description: string;
  order: number;
  is_approved: boolean;
  actual_completed: string | null;
  expected_budget: number;
  progress: number;
  status: string;
  logs: ProgressLog[];
  bills: Bill[];
}

interface ProgressLog {
  id: string;
  stepId: string;
  title: string;
  description: string;
  media: MediaFile[];
  timestamp: string;
  type: string;
}

interface MediaFile {
  id: string;
  url: string;
  type: string;
  filename: string;
}

interface ProjectMedia {
  id: string;
  url: string;
  type: string;
  title: string;
  description: string;
  filename: string;
  file_size: number;
  uploaded_by_name: string;
  uploaded_at: string;
}

interface Bill {
  id: string;
  pdf: string;
  uploaded_at: string;
  verified: boolean;
}

interface Invoice {
  id: string;
  step: {
    title: string;
  };
  data: any;
  created: string;
  is_approved: boolean;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Media upload states
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [mediaUploadData, setMediaUploadData] = useState({
    title: '',
    description: '',
    files: [] as File[]
  });
  const [uploading, setUploading] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        
        // Fetch project details
        const projectResponse = await fetchWithAuth(`${apiBaseUrl}/projects/${projectId}/`);
        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project data');
        }
        const projectData = await projectResponse.json();
        setProject(projectData);

        // Progress logs and invoices are already included in the project data through steps
        // Extract them from the project data
        if (projectData.steps) {
          const allLogs: ProgressLog[] = [];
          const allInvoices: Invoice[] = [];
          
          projectData.steps.forEach((step: any) => {
            if (step.logs) {
              allLogs.push(...step.logs);
            }
            if (step.invoice) {
              allInvoices.push(step.invoice);
            }
          });
          
          setProgressLogs(allLogs);
          setInvoices(allInvoices);
        }

      } catch (err) {
        console.error('Error fetching project data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Handle media file selection
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaUploadData(prev => ({
        ...prev,
        files: [...prev.files, ...files]
      }));
    }
  };

  // Remove file from selection
  const removeMediaFile = (index: number) => {
    setMediaUploadData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Upload media files
  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || mediaUploadData.files.length === 0) return;

    setUploading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      // Upload each file
      for (const file of mediaUploadData.files) {
        if (!file || !project?.id) {
          console.error('Missing file or project ID');
          continue;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project', project.id);
        formData.append('title', mediaUploadData.title || file.name);
        formData.append('description', mediaUploadData.description || '');

        const response = await fetchWithAuth(`${apiBaseUrl}/projects/project-media/`, {
          method: 'POST',
          body: formData,
        });

        // if (!response.ok) {
        //   const errorText = await response.text();
        //   console.error(`❌ Failed to upload ${file.name}`, errorText);
        // }
      }

      // Refresh project data to get updated media files
      const projectResponse = await fetchWithAuth(`${apiBaseUrl}/projects/${projectId}/`);
      if (projectResponse.ok) {
        const updatedProject = await projectResponse.json();
        setProject(updatedProject);
      }

      // Reset form
      setMediaUploadData({ title: '', description: '', files: [] });
      setShowMediaUpload(false);
      
    } catch (err) {
      console.error('Error uploading media:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  // Calculate stats from real data
  const getStats = () => {
    if (!project) return { totalPhases: 0, completed: 0, active: 0, upcoming: 0 };
    
    const steps = project.steps || [];
    const totalPhases = steps.length;
    const completed = steps.filter(step => step.is_approved).length;
    const active = steps.filter(step => step.actual_completed && !step.is_approved).length;
    const upcoming = steps.filter(step => !step.actual_completed && !step.is_approved).length;
    
    return { totalPhases, completed, active, upcoming };
  };

  // Breadcrumbs
  const breadcrumbs = [
    { name: "Dashboard", path: "/dashboard/supervisor" },
    { name: "Projects", path: "/dashboard/supervisor/projects" },
    { name: project?.name || "Loading...", path: `/dashboard/supervisor/projects/${projectId}` },
  ];

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-0 px-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b4965] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading project data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-0 px-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <RiBuildingLine className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Project</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-0 px-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <RiBuildingLine className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Not Found</h3>
              <p className="text-gray-600">The requested project could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-0 px-0">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm py-6 px-2">
          {breadcrumbs.map((item, idx) => (
            <span key={item.path} className="flex items-center">
              {idx > 0 && <span className="mx-2 text-[#1b4965]">/</span>}
              {idx < breadcrumbs.length - 1 ? (
                <button onClick={() => router.push(item.path)} className="text-[#1b4965] hover:underline">{item.name}</button>
              ) : (
                <span className="text-[#1b4965] font-semibold">{item.name}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow p-6 mb-8 border border-white/20">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-full max-w-xs">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search in project..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent transition-all duration-200 w-full"
              />
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
                <div className="text-2xl font-bold text-gray-900">{stats.totalPhases}</div>
                <div className="text-xs text-blue-600 font-medium">Total Phases</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-green-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <RiProgress1Line className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                <div className="text-xs text-green-600 font-medium">Completed</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-amber-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <RiTimeLine className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                <div className="text-xs text-amber-600 font-medium">Active</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-purple-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <RiFileTextLine className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.upcoming}</div>
                <div className="text-xs text-purple-600 font-medium">Upcoming</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: "overview", label: "Project Overview", icon: RiEyeLine },
            { id: "progress", label: "Progress Logs", icon: RiProgress1Line },
            { id: "timeline", label: "Project Timeline", icon: RiTimeLine },
            { id: "invoices", label: "Invoices & Billing", icon: RiFileTextLine },
            { id: "media", label: "Project Media", icon: RiCameraLine },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#1b4965] text-white shadow"
                  : "text-slate-600 hover:text-[#1b4965]-700 hover:bg-white/80 hover:shadow"
              }`}
            >
              <tab.icon className="text-lg" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow p-6 min-h-[300px]">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Project Overview</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  {project.thumbnail ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/media/${project.thumbnail}`} 
                      alt={project.name} 
                      className="rounded-xl w-full h-48 object-cover mb-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                        console.warn(`Failed to load project thumbnail: ${project.thumbnail}`);
                        console.warn(`Full URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}/media/${project.thumbnail}`);
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center mb-4 ${project.thumbnail ? 'hidden' : ''}`}>
                    <div className="text-center">
                      <RiBuildingLine className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {project.thumbnail ? 'Project image not available' : 'No project image'}
                      </p>
                      {project.thumbnail && (
                        <p className="text-xs text-gray-400 mt-1">
                          File: {project.thumbnail}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {project.name}</div>
                    <div><strong>Description:</strong> {project.description}</div>
                    <div><strong>Location:</strong> {project.location}</div>
                    <div><strong>Status:</strong> {project.status}</div>
                    <div><strong>Progress:</strong> {project.progress}%</div>
                    <div><strong>Current Step:</strong> {project.current_step}</div>
                    <div><strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}</div>
                    <div><strong>End Date:</strong> {new Date(project.estimated_end_date).toLocaleDateString()}</div>
                    <div><strong>Budget:</strong> ${project.budget?.toLocaleString() || '0'}</div>
                    {project.supervisor && (
                      <div><strong>Supervisor:</strong> {project.supervisor.first_name} {project.supervisor.last_name}</div>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  {/* Project Media Section */}
                  <div className="bg-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold mb-2">Project Media</h4>
                    {project.media_files && project.media_files.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {project.media_files.map((media) => (
                          <div key={media.id} className="flex items-center gap-3 border-b border-gray-200 pb-2 mb-2 last:border-b-0 last:mb-0 last:pb-0">
                            {/* Thumbnail or icon */}
                            {media.type === 'image' ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`}
                                alt={media.title || media.filename}
                                className="w-16 h-16 object-cover rounded-lg border"
                              />
                            ) : media.type === 'video' || media.type === 'vr' ? (
                              <button
                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`, '_blank')}
                                className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border hover:from-blue-200 hover:to-purple-200"
                                title="Play Video"
                              >
                                <RiPlayLine className="text-2xl text-purple-600" />
                              </button>
                            ) : (
                              <a
                                href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-lg border"
                                title="Download File"
                              >
                                <RiDownloadLine className="text-2xl text-gray-600" />
                              </a>
                            )}
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate">{media.title || media.filename}</div>
                              <div className="text-xs text-gray-500 truncate">{media.type.toUpperCase()} • {media.uploaded_by_name} • {new Date(media.uploaded_at).toLocaleDateString()}</div>
                            </div>
                            {/* Download button */}
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:text-blue-800"
                              title="Download"
                            >
                              <RiDownloadLine className="w-5 h-5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-4">No media files uploaded yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "progress" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Progress Logs</h2>
              {progressLogs.length > 0 ? (
                <div className="space-y-4">
                  {progressLogs.map((log) => (
                    <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{log.title}</h3>
                        <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{log.description}</p>
                      {log.media && log.media.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {log.media.map((media) => (
                            <div key={media.id} className="text-sm text-blue-600">
                              <a 
                                href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                📎 {media.filename}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">No progress logs found</div>
              )}
            </div>
          )}
          {activeTab === "timeline" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Project Timeline</h2>
              {project.steps && project.steps.length > 0 ? (
                <div className="space-y-4">
                  {project.steps.sort((a, b) => a.order - b.order).map((step) => (
                    <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{step.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          step.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          step.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{step.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Progress: {step.progress}%</span>
                        <span>Budget: ${step.expected_budget?.toLocaleString() || '0'}</span>
                        {step.actual_completed && (
                          <span>Completed: {new Date(step.actual_completed).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">No project steps found</div>
              )}
            </div>
          )}
          {activeTab === "invoices" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Invoices & Billing</h2>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{invoice.step?.title || 'Unknown Step'}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          invoice.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Data: {JSON.stringify(invoice.data)}</span>
                        <span>Created: {new Date(invoice.created).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">No invoices found</div>
              )}
            </div>
          )}
          {activeTab === "media" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Project Media</h2>
                <button
                  onClick={() => setShowMediaUpload(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 transition-colors"
                >
                  <RiAddLine className="w-4 h-4" />
                  Upload Media
                </button>
              </div>
              
              {project.media_files && project.media_files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.media_files.map((media) => (
                    <div key={media.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {media.type === 'image' && <RiCameraLine className="w-5 h-5 text-blue-500" />}
                          {media.type === 'video' && <RiVideoLine className="w-5 h-5 text-red-500" />}
                          {media.type === 'vr' && <RiPlayLine className="w-5 h-5 text-purple-500" />}
                          <span className="text-sm text-gray-500">{media.type.toUpperCase()}</span>
                        </div>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <RiDownloadLine className="w-4 h-4" />
                        </a>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{media.title || media.filename}</h3>
                      {media.description && (
                        <p className="text-sm text-gray-600 mb-2">{media.description}</p>
                      )}
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>File: {media.filename}</div>
                        <div>Size: {(media.file_size / 1024 / 1024).toFixed(2)} MB</div>
                        <div>Uploaded by: {media.uploaded_by_name}</div>
                        <div>Date: {new Date(media.uploaded_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <RiCameraLine className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No media files uploaded yet</p>
                  <p className="text-sm">Click "Upload Media" to add images, videos, or VR content</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Project Media</h3>
              <button
                onClick={() => setShowMediaUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleMediaUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={mediaUploadData.title}
                  onChange={(e) => setMediaUploadData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                  placeholder="Enter media title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={mediaUploadData.description}
                  onChange={(e) => setMediaUploadData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                  rows={3}
                  placeholder="Enter media description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <RiUploadLine className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Drag and drop files here or click to browse</p>
                  <p className="text-sm text-gray-500 mb-4">Supports: Images, Videos, VR Content</p>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*"
                    onChange={handleMediaFileChange}
                    className="hidden" 
                    id="media-upload"
                  />
                  <label 
                    htmlFor="media-upload"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    Choose Files
                  </label>
                </div>
                
                {/* Selected Files */}
                {mediaUploadData.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-700">Selected Files:</h4>
                    {mediaUploadData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeMediaFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <RiCloseLine />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowMediaUpload(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || mediaUploadData.files.length === 0}
                  className="flex-1 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
