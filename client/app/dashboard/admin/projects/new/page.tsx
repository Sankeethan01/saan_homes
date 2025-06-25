'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { motion } from 'framer-motion';

interface Supervisor {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    estimated_end_date: '',
    supervisor: '',
  });
  
  const [boqFile, setBoqFile] = useState<File | null>(null);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Create FormData instance for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('estimated_end_date', formData.estimated_end_date);
      if (formData.supervisor) {
        formDataToSend.append('supervisor', formData.supervisor);
      }
      if (boqFile) {
        formDataToSend.append('boq_file', boqFile);
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
        throw new Error(errorData.detail || 'Failed to create project');
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

          <div>
            <label htmlFor="boq_file" className="block text-sm font-medium text-gray-700">
              BOQ File *
            </label>
            <input
              type="file"
              id="boq_file"
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              onChange={(e) => setBoqFile(e.target.files?.[0] || null)}
            />
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