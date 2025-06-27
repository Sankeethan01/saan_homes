'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { motion } from 'framer-motion';
import { FiMapPin, FiUser, FiMail, FiPhone, FiTag, FiFlag, FiCheckCircle, FiAlertCircle, FiDollarSign, FiList, FiPackage } from 'react-icons/fi';

interface Supervisor {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface MaterialDetail {
  quantity?: number;
  unit?: string;
  rate?: number;
}

interface BoqPreviewData {
  total_budget: number;
  material_count: number;
  columns_found: Record<string, string>;
  sheet_name?: string;
  phases?: Array<{
    name: string;
    budget: number;
    percentage: number;
    material_count: number;
  }>;
  sample_materials: Array<{
    name: string;
    details: MaterialDetail;
  }>;
}

export default function NewProjectPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clear);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type: 'RESIDENTIAL',
    priority: 'MEDIUM',
    start_date: '',
    estimated_end_date: '',
    location: '',
    address: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    supervisor: '',
  });
  
  const [boqFile, setBoqFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [model3dFile, setModel3dFile] = useState<File | null>(null);
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // BOQ Preview states
  const [boqPreviewLoading, setBoqPreviewLoading] = useState(false);
  const [boqPreviewError, setBoqPreviewError] = useState<string | null>(null);
  const [boqPreviewData, setBoqPreviewData] = useState<BoqPreviewData | null>(null);

  // Fetch supervisors on component mount
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/?role=SUPERVISOR`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch supervisors');
        
        const data = await response.json();
        setSupervisors(data);
      } catch (err) {
        console.error('Error fetching supervisors:', err);
        setError('Failed to load supervisors. Please try again.');
      }
    };

    fetchSupervisors();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      const requiredFields = [
        { key: 'name', label: 'Project Name' },
        { key: 'start_date', label: 'Start Date' },
        { key: 'estimated_end_date', label: 'Estimated End Date' },
      ];
      
      for (const field of requiredFields) {
        if (!formData[field.key as keyof typeof formData]) {
          throw new Error(`${field.label} is required`);
        }
      }
      
      // Validate dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.estimated_end_date);
      
      if (endDate < startDate) {
        throw new Error('Estimated End Date cannot be earlier than Start Date');
      }
      
      // Validate BOQ file
      if (!boqFile) {
        throw new Error('BOQ file is required');
      }
      
      const fileExt = boqFile.name.split('.').pop()?.toLowerCase();
      if (fileExt !== 'xlsx' && fileExt !== 'xls') {
        throw new Error('Only Excel files (.xlsx, .xls) are supported for BOQ');
      }

      // Create FormData instance for file upload
      const formDataToSend = new FormData();
      
      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          // Rename supervisor field to supervisor_id for the API
          if (key === 'supervisor') {
            formDataToSend.append('supervisor_id', value);
          } else {
            formDataToSend.append(key, value);
          }
        }
      });
      
      // Add files
      if (boqFile) {
        formDataToSend.append('boq_file', boqFile);
      }
      
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile);
      }
      
      if (model3dFile) {
        formDataToSend.append('model_3d', model3dFile);
      }
      
      // Handle multiple project images
      if (projectImages.length > 0) {
        const imagesList = [];
        for (let i = 0; i < projectImages.length; i++) {
          const file = projectImages[i];
          const fileName = `project_image_${i}_${Date.now()}.${file.name.split('.').pop()}`;
          formDataToSend.append(`project_image_${i}`, file);
          imagesList.push(fileName);
        }
        formDataToSend.append('images', JSON.stringify(imagesList));
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || 'Failed to create project');
      }

      // Redirect to projects list on success
      router.push('/dashboard/admin/projects');
      router.refresh();
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setProjectImages(filesArray);
    }
  };

  const handleBoqFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBoqFile(file);
    
    if (!file) {
      setBoqPreviewData(null);
      return;
    }
    
    // Only process Excel files
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      setBoqPreviewError('Only Excel files (.xlsx, .xls) are supported for BOQ.');
      return;
    }
    
    // Preview the BOQ file
    setBoqPreviewLoading(true);
    setBoqPreviewError(null);
    
    try {
      // Check if token is available
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const formData = new FormData();
      formData.append('boq_file', file);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/preview-boq/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle authentication error
          clearToken();
          router.replace('/dashboard/login');
          throw new Error('Authentication expired. Please log in again.');
        }
        
        // Try to get error message from response
        let errorMessage = 'Failed to preview BOQ file';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = `Failed to preview BOQ file: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setBoqPreviewData(data);
    } catch (err) {
      console.error('Error previewing BOQ:', err);
      setBoqPreviewError(err instanceof Error ? err.message : 'Failed to preview BOQ file');
      setBoqPreviewData(null);
    } finally {
      setBoqPreviewLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Create New Project</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the project details below</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="project_type" className="block text-sm font-medium text-gray-700">
                  Project Type *
                </label>
                <div className="flex items-center mt-1">
                  <FiTag className="text-gray-400 mr-2" />
                  <select
                    id="project_type"
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  >
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="INDUSTRIAL">Industrial</option>
                    <option value="RENOVATION">Renovation</option>
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <div className="flex items-center mt-1">
                  <FiFlag className="text-gray-400 mr-2" />
                  <select
                    id="priority"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700">
                  Supervisor
                </label>
                <select
                  id="supervisor"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                >
                  <option value="">Select a supervisor</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.first_name && supervisor.last_name 
                        ? `${supervisor.first_name} ${supervisor.last_name}`
                        : supervisor.username} ({supervisor.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Project Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="estimated_end_date" className="block text-sm font-medium text-gray-700">
                  Estimated End Date *
                </label>
                <input
                  type="date"
                  id="estimated_end_date"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.estimated_end_date}
                  onChange={(e) => setFormData({ ...formData, estimated_end_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location Name
                </label>
                <div className="flex items-center mt-1">
                  <FiMapPin className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    id="location"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., Downtown, North Side"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="address"
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Client Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="client_name" className="block text-sm font-medium text-gray-700">
                  Client Name
                </label>
                <div className="flex items-center mt-1">
                  <FiUser className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    id="client_name"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="client_email" className="block text-sm font-medium text-gray-700">
                  Client Email
                </label>
                <div className="flex items-center mt-1">
                  <FiMail className="text-gray-400 mr-2" />
                  <input
                    type="email"
                    id="client_email"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="client_phone" className="block text-sm font-medium text-gray-700">
                  Client Phone
                </label>
                <div className="flex items-center mt-1">
                  <FiPhone className="text-gray-400 mr-2" />
                  <input
                    type="tel"
                    id="client_phone"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Files & Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="boq_file" className="block text-sm font-medium text-gray-700">
                  BOQ File *
                </label>
                <input
                  type="file"
                  id="boq_file"
                  required
                  accept=".xls,.xlsx"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  onChange={handleBoqFileChange}
                />
                <p className="mt-1 text-xs text-gray-500">Upload Bill of Quantities document (Excel format only)</p>
                
                {/* BOQ Preview Section */}
                {boqPreviewLoading && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <p className="text-sm text-blue-600">Analyzing BOQ file...</p>
                    </div>
                  </div>
                )}
                
                {boqPreviewError && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md">
                    <div className="flex items-center">
                      <FiAlertCircle className="text-red-500 mr-2" />
                      <p className="text-sm text-red-600">{boqPreviewError}</p>
                    </div>
                  </div>
                )}
                
                {boqPreviewData && !boqPreviewLoading && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-100 rounded-md">
                    <div className="flex items-center mb-3">
                      <FiCheckCircle className="text-green-500 mr-2" />
                      <p className="text-sm font-medium text-green-700">BOQ file analyzed successfully</p>
                    </div>
                    
                    {boqPreviewData.sheet_name && (
                      <p className="text-xs text-gray-600 mb-2">Using data from sheet: <span className="font-semibold">{boqPreviewData.sheet_name}</span></p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white p-2 rounded border border-green-100">
                        <div className="flex items-center">
                          <FiDollarSign className="text-green-600 mr-1" />
                          <p className="text-xs text-gray-500">Total Budget</p>
                        </div>
                        <p className="text-sm font-semibold">${boqPreviewData.total_budget.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-white p-2 rounded border border-green-100">
                        <div className="flex items-center">
                          <FiList className="text-green-600 mr-1" />
                          <p className="text-xs text-gray-500">Materials</p>
                        </div>
                        <p className="text-sm font-semibold">{boqPreviewData.material_count} items</p>
                      </div>
                    </div>
                    
                    {boqPreviewData.phases && boqPreviewData.phases.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Construction Phases</p>
                        <div className="space-y-1">
                          {boqPreviewData.phases.map((phase, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center">
                                <FiPackage className="text-green-600 mr-1" />
                                <span>{phase.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-500">{phase.material_count} items</span>
                                <span className="font-medium">${phase.budget.toLocaleString()}</span>
                                <span className="bg-green-100 text-green-800 px-1 rounded">
                                  {phase.percentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {boqPreviewData.sample_materials && boqPreviewData.sample_materials.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Sample Materials</p>
                        <div className="bg-white p-2 rounded border border-green-100 text-xs">
                          <ul className="list-disc pl-4 space-y-1">
                            {boqPreviewData.sample_materials.slice(0, 3).map((material, index) => (
                              <li key={index} className="text-gray-700">
                                {material.name}
                                {material.details.quantity && (
                                  <span className="text-gray-500"> ({material.details.quantity} {material.details.unit || 'units'})</span>
                                )}
                              </li>
                            ))}
                            {boqPreviewData.material_count > 3 && (
                              <li className="text-gray-500">...and {boqPreviewData.material_count - 3} more items</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                  Project Thumbnail
                </label>
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                />
                <p className="mt-1 text-xs text-gray-500">Main project image (optional)</p>
              </div>

              <div>
                <label htmlFor="project_images" className="block text-sm font-medium text-gray-700">
                  Project Images
                </label>
                <input
                  type="file"
                  id="project_images"
                  accept="image/*"
                  multiple
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  onChange={handleImageChange}
                />
                <p className="mt-1 text-xs text-gray-500">Multiple project images (optional)</p>
              </div>

              <div>
                <label htmlFor="model_3d" className="block text-sm font-medium text-gray-700">
                  3D Model
                </label>
                <input
                  type="file"
                  id="model_3d"
                  accept=".glb,.gltf,.obj,.fbx"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  onChange={(e) => setModel3dFile(e.target.files?.[0] || null)}
                />
                <p className="mt-1 text-xs text-gray-500">3D model file (optional)</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md 
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 