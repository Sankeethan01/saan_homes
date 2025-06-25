'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';

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
}

const getStatusFromProject = (project: Project): 'In Progress' | 'Completed' | 'Planning' | 'On Hold' => {
  if (project.is_completed) return 'Completed';
  
  const now = new Date();
  const startDate = new Date(project.start_date);
  
  if (startDate > now) return 'Planning';
  return 'In Progress';
};

const getStatusStyle = (status: ReturnType<typeof getStatusFromProject>) => {
  const styles = {
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Planning': 'bg-purple-100 text-purple-800',
    'On Hold': 'bg-gray-100 text-gray-800',
  };
  return styles[status] || styles['In Progress'];
};

const getSupervisorDisplayName = (supervisor: Project['supervisor']) => {
  if (!supervisor) return 'Not Assigned';
  if (supervisor.first_name && supervisor.last_name) {
    return `${supervisor.first_name} ${supervisor.last_name}`;
  }
  return supervisor.username;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/`, {
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
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        
        // Fetch supervisor details for each project
        const projectsWithSupervisors = await Promise.all(
          data.map(async (project: Project) => {
            if (!project.supervisor) return project;
            
            try {
              const supervisorResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/${project.supervisor.id}/`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              
              if (supervisorResponse.ok) {
                const supervisorData = await supervisorResponse.json();
                return {
                  ...project,
                  supervisor: {
                    ...project.supervisor,
                    ...supervisorData
                  }
                };
              }
              
              if (supervisorResponse.status === 401) {
                clearToken();
                router.replace('/dashboard/login');
                return project;
              }
            } catch (err) {
              console.error('Error fetching supervisor:', err);
            }
            return project;
          })
        );

        setProjects(projectsWithSupervisors);
        setError(null);
      } catch (err) {
        setError('Error loading projects. Please try again later.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token, router, clearToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-gray-800"
          >
            Projects
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-gray-500 mt-1"
          >
            Manage all ongoing projects and their details
          </motion.p>
        </div>
        
        <Link href="/dashboard/admin/projects/new">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Add Project
          </motion.button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Project Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Start Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Deadline</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Supervisor</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projects.map((project) => {
              const status = getStatusFromProject(project);
              return (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-3 px-4 text-sm text-gray-800">{project.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(project.start_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(project.estimated_end_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {getSupervisorDisplayName(project.supervisor)}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/dashboard/admin/projects/${project.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
