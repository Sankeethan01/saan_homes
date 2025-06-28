'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiChevronLeft } from 'react-icons/fi';
import { use } from 'react';

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
}

export default function EditProjectPage({ params }: { params: { projectId: string } }) {
  const { projectId } = use(params);
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  // Form state
  const [formData, setFormData] = useState<Partial<Project>>({});

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
        
        // Initialize form data with project data
        setFormData({
          name: data.name,
          description: data.description,
          project_type: data.project_type,
          priority: data.priority,
          start_date: data.start_date,
          estimated_end_date: data.estimated_end_date,
          location: data.location,
          address: data.address,
          client_name: data.client_name,
          client_email: data.client_email,
          client_phone: data.client_phone,
          is_completed: data.is_completed,
          supervisor: data.supervisor?.id || null,
        });
        
        setError(null);
      } catch (err) {
        setError('Error loading project. Please try again later.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSupervisors = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/supervisors/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Don't throw an error, just set empty supervisors
          setSupervisors([]);
          return;
        }

        const data = await response.json();
        setSupervisors(data);
      } catch (err) {
        // Don't show error, just set empty supervisors
        console.error('Error fetching supervisors:', err);
        setSupervisors([]);
      }
    };

    fetchProject();
    fetchSupervisors();
  }, [token, router, clearToken, projectId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        supervisor: formData.supervisor || null,
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          router.replace('/dashboard/login');
          return;
        }
        throw new Error('Failed to update project');
      }

      // Navigate back to project details page
      router.push(`/dashboard/admin/projects/${projectId}`);
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors duration-200 hover:scale-105 transform"
          >
            <FiChevronLeft className="mr-1" /> Back to Project
          </button>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Edit Project
                </h1>
                <p className="text-gray-600">Update project details and settings</p>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <FiSave className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-4 mb-6 flex items-center shadow-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information - Enhanced */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter project name..."
                />
              </div>
              
              <div>
                <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type
                </label>
                <select
                  id="project_type"
                  name="project_type"
                  value={formData.project_type || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="RESIDENTIAL">🏠 Residential</option>
                  <option value="COMMERCIAL">🏢 Commercial</option>
                  <option value="INDUSTRIAL">🏭 Industrial</option>
                  <option value="RENOVATION">🔨 Renovation</option>
                  <option value="INFRASTRUCTURE">🛣️ Infrastructure</option>
                  <option value="OTHER">📋 Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="HIGH">🔴 High Priority</option>
                  <option value="MEDIUM">🟡 Medium Priority</option>
                  <option value="LOW">🟢 Low Priority</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                  placeholder="Describe the project goals and requirements..."
                />
              </div>
              
              <div>
                <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Supervisor
                </label>
                <select
                  id="supervisor"
                  name="supervisor"
                  value={formData.supervisor || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">👤 Not Assigned</option>
                  {supervisors && supervisors.length > 0 ? (
                    supervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        👨‍💼 {supervisor.first_name && supervisor.last_name
                          ? `${supervisor.first_name} ${supervisor.last_name}`
                          : supervisor.username}
                      </option>
                    ))
                  ) : project?.supervisor ? (
                    <option value={project.supervisor.id}>
                      👨‍💼 {project.supervisor.first_name && project.supervisor.last_name
                        ? `${project.supervisor.first_name} ${project.supervisor.last_name}`
                        : project.supervisor.username}
                    </option>
                  ) : null}
                </select>
                {supervisors.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg">
                    ⚠️ Could not load supervisor list. Only the current supervisor is shown.
                  </p>
                )}
              </div>
              
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 w-full">
                  <label htmlFor="is_completed" className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id="is_completed"
                      name="is_completed"
                      checked={formData.is_completed || false}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Mark as Completed</span>
                      <p className="text-xs text-gray-500">Project has been finished</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Project Timeline - Enhanced */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Project Timeline</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
                />
              </div>
              
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200">
                <label htmlFor="estimated_end_date" className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Estimated End Date *
                </label>
                <input
                  type="date"
                  id="estimated_end_date"
                  name="estimated_end_date"
                  value={formData.estimated_end_date || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
                />
              </div>
            </div>
          </div>
          
          {/* Location Information - Enhanced */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Location Details</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50/50 p-4 rounded-xl border border-green-200">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  📍 Location Name
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  placeholder="e.g., Downtown, Business District"
                />
              </div>
              
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  🏠 Full Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
                  placeholder="Enter complete project address..."
                />
              </div>
            </div>
          </div>
          
          {/* Client Information - Enhanced */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold">4</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Client Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 bg-orange-50/50 p-4 rounded-xl border border-orange-200">
                <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Client Name
                </label>
                <input
                  type="text"
                  id="client_name"
                  name="client_name"
                  value={formData.client_name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  placeholder="Client full name"
                />
              </div>
              
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                <label htmlFor="client_email" className="block text-sm font-medium text-gray-700 mb-2">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  id="client_email"
                  name="client_email"
                  value={formData.client_email || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  placeholder="client@example.com"
                />
              </div>
              
              <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-200">
                <label htmlFor="client_phone" className="block text-sm font-medium text-gray-700 mb-2">
                  📞 Phone Number
                </label>
                <input
                  type="tel"
                  id="client_phone"
                  name="client_phone"
                  value={formData.client_phone || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center font-medium hover:scale-105 transform"
              >
                <FiX className="mr-2" /> Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center transform ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {saving ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 