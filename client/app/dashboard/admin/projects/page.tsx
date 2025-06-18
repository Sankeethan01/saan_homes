'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Project {
  name: string;
  startDate: string;
  deadline: string;
  status: 'In Progress' | 'Completed' | 'Planning' | 'On Hold';
}

const projects: Project[] = [
  {
    name: 'Grandview Residences',
    startDate: '2023-08-15',
    deadline: '2024-06-30',
    status: 'In Progress',
  },
  {
    name: 'Lakeside Commercial Park',
    startDate: '2022-11-01',
    deadline: '2023-07-15',
    status: 'Completed',
  },
  {
    name: 'Riverbend Infrastructure',
    startDate: '2024-01-20',
    deadline: '2024-12-31',
    status: 'Planning',
  },
  {
    name: 'Mountainview Estates',
    startDate: '2023-05-01',
    deadline: '2024-03-15',
    status: 'In Progress',
  },
  {
    name: 'City Center Redevelopment',
    startDate: '2023-09-01',
    deadline: '2025-01-01',
    status: 'On Hold',
  },
];

const getStatusStyle = (status: Project['status']) => {
  const styles = {
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Planning': 'bg-purple-100 text-purple-800',
    'On Hold': 'bg-gray-100 text-gray-800',
  };
  return styles[status] || styles['In Progress'];
};

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
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
        
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Add Project
        </motion.button>
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.name} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="py-3 px-4 text-sm text-gray-800">{project.name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(project.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(project.deadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/dashboard/admin/projects/${encodeURIComponent(project.name)}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
