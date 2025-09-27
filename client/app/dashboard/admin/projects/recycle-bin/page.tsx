'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiRefreshCw, FiTrash2, FiCalendar, FiClock, FiUsers,} from 'react-icons/fi';
import Image from 'next/image';

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
  deleted_at: string;
  thumbnail: string | null;
}

export default function RecycleBinPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    const fetchDeletedProjects = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/recycle-bin/`;
        console.log('Fetching deleted projects from:', apiUrl);
        
        const response = await fetch(apiUrl, {
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
          if (response.status === 403) {
            setError('Access denied. Only administrators can view the recycle bin.');
            return;
          }
          if (response.status === 404) {
            setError('Recycle bin endpoint not found. Please contact support.');
            return;
          }
          
          // Try to get error message from response
          try {
            const errorData = await response.json();
            setError(errorData.error || `Server error: ${response.status}`);
          } catch {
            setError(`Failed to fetch deleted projects. Server returned status: ${response.status}`);
          }
          return;
        }

        const data = await response.json();
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('Error loading deleted projects. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedProjects();
  }, [token, router, clearToken]);

  const handleRestore = async (projectId: string) => {
    setActionLoading(projectId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/restore/`, {
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
        
        // Try to get error message from response
        try {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to restore project');
        } catch {
          setError(`Failed to restore project. Server returned status: ${response.status}`);
        }
        return;
      }

      // Remove the project from the list
      setProjects(projects.filter(p => p.id !== projectId));
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error restoring project:', err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to restore project. Please try again.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (projectId: string) => {
    setShowDeleteModal(projectId);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(null);
  };

  const handleConfirmDelete = async (projectId: string) => {
    setActionLoading(projectId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/permanent-delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          router.replace('/dashboard/login');
          return;
        }
        
        // Try to get error message from response
        try {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to permanently delete project');
        } catch {
          setError(`Failed to permanently delete project. Server returned status: ${response.status}`);
        }
        return;
      }

      // Remove the project from the list
      setProjects(projects.filter(p => p.id !== projectId));
      setShowDeleteModal(null);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error deleting project:', err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to delete project. Please try again.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
          >
            <FiChevronLeft className="mr-1" /> Back to Projects
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">Project Recycle Bin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Deleted projects are stored here for 30 days before being permanently removed
          </p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <FiTrash2 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Recycle Bin is Empty</h3>
            <p className="text-gray-500">No deleted projects found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Project thumbnail */}
                  <div className="w-full md:w-32 h-24 bg-gray-100 rounded-md overflow-hidden mb-4 md:mb-0 md:mr-4 flex-shrink-0">
                    {project.thumbnail ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/media/${project.thumbnail}`}
                          alt={project.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-200">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Project details */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium text-gray-800">{project.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{project.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" /> Deleted: {formatDate(project.deleted_at)}
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-1" /> Duration: {formatDate(project.start_date)} - {formatDate(project.estimated_end_date)}
                      </div>
                      <div className="flex items-center">
                        <FiUsers className="mr-1" /> Supervisor: {project.supervisor ? 
                          (project.supervisor.first_name && project.supervisor.last_name ? 
                            `${project.supervisor.first_name} ${project.supervisor.last_name}` : 
                            project.supervisor.username) : 
                          'Not Assigned'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex mt-4 md:mt-0 md:ml-4 space-x-2">
                    <button
                      onClick={() => handleRestore(project.id)}
                      disabled={actionLoading === project.id}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                    >
                      {actionLoading === project.id ? (
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                      ) : (
                        <FiRefreshCw className="mr-1" />
                      )}
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteClick(project.id)}
                      disabled={actionLoading === project.id}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center text-sm"
                    >
                      <FiTrash2 className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Permanently Delete Project</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to permanently delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={actionLoading !== null}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => showDeleteModal && handleConfirmDelete(showDeleteModal)}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                {actionLoading === showDeleteModal ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Deleting...
                  </>
                ) : (
                  <>Delete Permanently</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 