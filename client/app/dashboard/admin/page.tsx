'use client';

import { motion } from 'framer-motion';

interface Project {
  name: string;
  currentStep: string;
  status: 'In Progress' | 'Completed';
}

interface Rental {
  equipment: string;
  project: string;
  status: 'In Use';
}

const projects: Project[] = [
  {
    name: 'High-Rise Apartment Complex',
    currentStep: 'Foundation',
    status: 'In Progress',
  },
  {
    name: 'Commercial Office Building',
    currentStep: 'Framing',
    status: 'In Progress',
  },
  {
    name: 'Residential Housing Development',
    currentStep: 'Landscaping',
    status: 'Completed',
  },
];

const rentals: Rental[] = [
  {
    equipment: 'Excavator',
    project: 'High-Rise Apartment Complex',
    status: 'In Use',
  },
  {
    equipment: 'Crane',
    project: 'Commercial Office Building',
    status: 'In Use',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-gray-800"
      >
        Dashboard
      </motion.h1>

      {/* Project Status Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm"
      >
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Project Status</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Project Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Current Step</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr
                    key={project.name}
                    className={index !== projects.length - 1 ? 'border-b border-gray-100' : ''}
                  >
                    <td className="py-3 px-4 text-sm text-gray-800">{project.name}</td>
                    <td className="py-3 px-4 text-sm text-blue-600">{project.currentStep}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>

      {/* Active Rentals Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm"
      >
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Active Rentals</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Equipment</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Project</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental, index) => (
                  <tr
                    key={rental.equipment}
                    className={index !== rentals.length - 1 ? 'border-b border-gray-100' : ''}
                  >
                    <td className="py-3 px-4 text-sm text-gray-800">{rental.equipment}</td>
                    <td className="py-3 px-4 text-sm text-blue-600">{rental.project}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {rental.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
