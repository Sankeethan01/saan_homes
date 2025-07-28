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
import ProgressLogs from "../components/ProgressLogs";
import axios from "axios";

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
  step_id?: string;
  step_title?: string;
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
    step: '', // <-- new required field
    description: '',
    files: [] as File[]
  });
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Add at the top, after useState declarations
  const [showEditMediaModal, setShowEditMediaModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<ProjectMedia | null>(null);
  // Update editMediaForm state to include step and file
  const [editMediaForm, setEditMediaForm] = useState({ title: '', description: '', step: '', file: null as File | null });
  const [editMediaSaving, setEditMediaSaving] = useState(false);

  // Delete media from both project.media_files and all log.media arrays
  const handleDeleteMedia = async (mediaId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this media? This action cannot be undone.");
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("access_token");
      // Find the media object to get filename/url before deletion
      let deletedMedia: any = null;
      setProject((prev) => {
        if (!prev) return prev;
        deletedMedia = prev.media_files.find((media: any) => String(media.id) === String(mediaId));
        return prev;
      });
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/project-media/${mediaId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Also delete ProgressLogMedia with matching filename or url
      if (deletedMedia && project) {
        // Loop through all logs and their media
        for (const step of project.steps) {
          for (const log of step.logs) {
            for (const media of log.media as any[]) {
              // Match by filename or url
              if (
                (media.filename && media.filename === deletedMedia.filename) ||
                (media.url && deletedMedia.url && media.url === deletedMedia.url)
              ) {
                try {
                  await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/progress-media/${media.id}/`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  setToast("Progress log media deleted successfully");
                  setTimeout(() => setToast(null), 3000);
                } catch (err) {
                  console.error("Error deleting progress log media:", err);
                }
              }
            }
          }
        }
      }
      setProject((prev) => {
        if (!prev) return prev;
        // Remove from top-level media_files
        const updatedMediaFiles = prev.media_files.filter(
          (media: any) => String(media.id) !== String(mediaId)
        );
        // Remove from nested logs under each step
        const updatedSteps = prev.steps.map((step) => ({
          ...step,
          logs: step.logs.map((log) => ({
            ...log,
            media: (log.media as any[]).filter(
              (media) => String(media.id) !== String(mediaId) && (!deletedMedia || media.filename !== deletedMedia.filename)
            ),
          })),
        }));
        // Create updated project with all changes
        const updatedProject = {
          ...prev,
          media_files: updatedMediaFiles,
          steps: updatedSteps,
        };
        // Ensure React sees this as a new reference for re-render
        return structuredClone(updatedProject);
      });
      setToast("Media deleted successfully");
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Error deleting media:", error);
      setToast("Failed to delete media");
      setTimeout(() => setToast(null), 3000);
    }
  };
  
  // Handler to open edit modal
  const handleEditMedia = (media: ProjectMedia) => {
    setEditingMedia(media);
    setEditMediaForm({
      title: media.title || '',
      description: media.description || '',
      step: media.step_id || '',
      file: null,
    });
    setShowEditMediaModal(true);
  };

  // Handler to save edit
  const handleEditMediaSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;
    setEditMediaSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      const formData = new FormData();
      formData.append('title', editMediaForm.title);
      formData.append('description', editMediaForm.description);
      if (editMediaForm.step) formData.append('step', editMediaForm.step);
      if (editMediaForm.file) formData.append('file', editMediaForm.file);
      const response = await axios.patch(
        `${apiBaseUrl}/projects/project-media/${editingMedia.id}/`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      // Update project state with new media info
      setProject((prev) => {
        if (!prev) return prev;
        const updatedMediaFiles = prev.media_files.map((m) =>
          m.id === editingMedia.id ? { ...m, ...response.data } : m
        );
        return { ...prev, media_files: updatedMediaFiles };
      });
      setShowEditMediaModal(false);
      setEditingMedia(null);
      setToast("Media updated successfully");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast("Failed to update media");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setEditMediaSaving(false);
    }
  };

  // Add refetchProject function
  const refetchProject = async () => {
    if (!projectId) return;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    const projectResponse = await fetchWithAuth(`${apiBaseUrl}/projects/${projectId}/`);
    if (projectResponse.ok) {
      const updatedProject = await projectResponse.json();
      setProject(updatedProject);
    }
  };

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

  useEffect(() => {
    if (!project) return;
    const fetchInvoices = async () => {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      const res = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/?project=${project.id}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data); // setInvoices should be a useState hook
      }
    };
    fetchInvoices();
  }, [project]);

  // Handle media file selection
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      alert('File selected!');
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
    if (!project || mediaUploadData.files.length === 0 || !mediaUploadData.step) return;

    setUploading(true);
    setError('');
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

      // Prepare form data for ProjectMedia upload
      const formDataToSend = new FormData();
      formDataToSend.append('project', project.id);
      formDataToSend.append('step', mediaUploadData.step);
      formDataToSend.append('description', mediaUploadData.description || '');
      mediaUploadData.files.forEach(file => {
        formDataToSend.append('file', file);
      });

      // If your main urls.py has path('api/projects/', ...)
      const response = await fetchWithAuth(`${apiBaseUrl}/projects/project-media/`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with:', errorText);
        throw new Error('Failed to upload project media');
      }

      // Refresh project data
      const projectResponse = await fetchWithAuth(`${apiBaseUrl}/projects/${project.id}/`);
      if (projectResponse.ok) {
        const updatedProject = await projectResponse.json();
        setProject(updatedProject);
      }

      setMediaUploadData({ step: '', description: '', files: [] });
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
            <ProgressLogs
              project={{
                ...project,
                steps: project.steps.map((step) => ({
                  ...step,
                  logs: step.logs.map((log) => ({
                    ...log,
                    type:
                      log.type === "TEXT" || log.type === "PHOTO" || log.type === "VIDEO"
                        ? log.type
                        : "TEXT",
                    media: log.media.map((media) => ({
                      ...media,
                      type:
                        media.type === "image" || media.type === "video" || media.type === "pdf"
                          ? media.type
                          : "image",
                    })),
                  })),
                })),
              }}
              onMediaEdited={refetchProject}
            />
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
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-xl">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Step</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.steps && project.steps.length > 0 ? (
                      project.steps.map((step) => {
                        const invoice = invoices.find(inv => inv.step && inv.step.title === step.title);
                        let status = '';
                        let badgeClass = '';
                        let amount = '';
                        let date = '';
                        if (invoice) {
                          amount = invoice.data?.amount?.toLocaleString() || step.expected_budget?.toLocaleString() || '0';
                          date = invoice.created ? new Date(invoice.created).toLocaleDateString() : '';
                          if (invoice.is_approved) {
                            status = 'Approved';
                            badgeClass = 'bg-green-100 text-green-800';
                          } else {
                            status = 'Submitted';
                            badgeClass = 'bg-blue-100 text-blue-800';
                          }
                        } else {
                          amount = step.expected_budget?.toLocaleString() || '0';
                          status = 'Auto-generated (not submitted)';
                          badgeClass = 'bg-yellow-100 text-yellow-800';
                        }
                        return (
                          <tr key={step.id} className="border-b last:border-b-0">
                            <td className="px-4 py-2 font-medium">{step.title}</td>
                            <td className="px-4 py-2">{amount}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeClass}`}>{status}</span>
                            </td>
                            <td className="px-4 py-2">{date}</td>
                            <td className="px-4 py-2">
                              {!invoice && step.status === 'COMPLETED' && (
                                <button
                                  className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-800 text-xs"
                                  onClick={() => {
                                    // Open invoice modal for this step (reuse ProgressLogs logic)
                                    // You may need to lift invoice modal state up or trigger a custom event
                                    const logsSection = document.getElementById('progress-logs-section');
                                    if (logsSection) {
                                      logsSection.scrollIntoView({ behavior: 'smooth' });
                                    }
                                    alert('To submit invoice, please use the Progress Logs section for this step.');
                                  }}
                                >
                                  Submit Invoice
                                </button>
                              )}
                              {invoice && (
                                <span className="text-gray-400 text-xs">{status === 'Approved' ? 'Locked' : 'Submitted'}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-500 py-8">No steps found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
                    <div key={media.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow flex flex-col h-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {media.type === 'image' && <RiCameraLine className="w-5 h-5 text-blue-500" />}
                          {media.type === 'video' && <RiVideoLine className="w-5 h-5 text-red-500" />}
                          {media.type === 'vr' && <RiPlayLine className="w-5 h-5 text-purple-500" />}
                          <span className="text-sm text-gray-500">{media.type.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="Download"
                          >
                            <RiDownloadLine className="w-5 h-5" />
                          </a>
                          <button
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                            onClick={() => handleEditMedia(media)}
                          >
                            <RiFileTextLine className="w-5 h-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                            onClick={() => handleDeleteMedia(media.id)}
                          >
                            <RiCloseLine className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 break-words">{media.title || media.filename}</h3>
                      {media.step_title && (
                        <div className="text-xs text-indigo-700 font-semibold mb-1">Step: {media.step_title}</div>
                      )}
                      {media.description && (
                        <p className="text-sm text-gray-600 mb-2 break-words">{media.description}</p>
                      )}
                      <div className="text-xs text-gray-500 space-y-1 mt-auto">
                        <div><span className="font-semibold">File:</span> {media.filename}</div>
                        <div><span className="font-semibold">Size:</span> {(media.file_size / 1024 / 1024).toFixed(2)} MB</div>
                        <div><span className="font-semibold">Uploaded by:</span> {media.uploaded_by_name}</div>
                        <div><span className="font-semibold">Date:</span> {new Date(media.uploaded_at).toLocaleDateString()}</div>
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
                  Step *
                </label>
                <select
                  value={mediaUploadData.step}
                  onChange={e => setMediaUploadData(prev => ({ ...prev, step: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Step</option>
                  {project.steps.map(step => (
                    <option key={step.id} value={step.id}>{step.title}</option>
                  ))}
                </select>
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
                    required
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
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {mediaUploadData.files.map((file, index) => {
                      let fileType = 'file';
                      if (file.type) {
                        if (file.type.startsWith('image')) fileType = 'image';
                        else if (file.type.startsWith('video')) fileType = 'video';
                      } else {
                        // fallback by extension
                        const ext = (file.name.split('.').pop() || '').toLowerCase();
                        if (["jpg","jpeg","png","gif","bmp","webp"].includes(ext)) fileType = 'image';
                        else if (["mp4","avi","mov","wmv","flv","webm"].includes(ext)) fileType = 'video';
                      }
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow flex flex-col h-full">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {fileType === 'image' && <RiCameraLine className="w-5 h-5 text-blue-500" />}
                              {fileType === 'video' && <RiVideoLine className="w-5 h-5 text-red-500" />}
                              {fileType === 'file' && <RiFileTextLine className="w-5 h-5 text-gray-500" />}
                              <span className="text-sm text-gray-500 uppercase">{fileType}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMediaFile(index)}
                              className="text-red-500 hover:text-red-700 ml-2"
                              title="Remove"
                            >
                              <RiCloseLine />
                            </button>
                          </div>
                          <div className="font-medium text-gray-800 mb-1 break-words">{file.name}</div>
                          {mediaUploadData.description && (
                            <div className="text-sm text-gray-600 mb-2 break-words">{mediaUploadData.description}</div>
                          )}
                          <div className="text-xs text-gray-500 space-y-1 mt-auto">
                            <div><span className="font-semibold">File:</span> {file.name}</div>
                            <div><span className="font-semibold">Size:</span> {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                            {mediaUploadData.step && (
                              <div><span className="font-semibold">Step:</span> {project.steps.find(s => s.id === mediaUploadData.step)?.title || mediaUploadData.step}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                  disabled={uploading || mediaUploadData.files.length === 0 || !mediaUploadData.step}
                  className="flex-1 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditMediaModal && editingMedia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Media</h3>
              <button
                onClick={() => setShowEditMediaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditMediaSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editMediaForm.title}
                  onChange={e => setEditMediaForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter media title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editMediaForm.description}
                  onChange={e => setEditMediaForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Enter media description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Step</label>
                <select
                  value={editMediaForm.step}
                  onChange={e => setEditMediaForm(f => ({ ...f, step: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Step</option>
                  {project.steps.map(step => (
                    <option key={step.id} value={step.id}>{step.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Replace File (optional)</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={e => setEditMediaForm(f => ({ ...f, file: e.target.files ? e.target.files[0] : null }))}
                  className="w-full"
                />
                {editingMedia.url && (
                  <div className="mt-2 text-xs text-gray-500">Current file: {editingMedia.filename}</div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditMediaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editMediaSaving}
                  className="flex-1 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editMediaSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
