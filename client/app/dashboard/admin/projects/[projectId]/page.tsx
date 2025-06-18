'use client';

import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUsers, FiClipboard } from 'react-icons/fi';

type StatusType = 'In Progress' | 'Completed' | 'Planning' | 'On Hold' | 'Pending' | 'Available' | 'Maintenance';

interface ProjectDetails {
  name: string;
  startDate: string;
  deadline: string;
  status: 'In Progress' | 'Completed' | 'Planning' | 'On Hold';
  description: string;
  progress: number;
  tasks: {
    name: string;
    status: 'Completed' | 'In Progress' | 'Pending';
    dueDate: string;
  }[];
  team: {
    name: string;
    role: string;
    image: string;
  }[];
  equipment: {
    name: string;
    status: 'In Use' | 'Available' | 'Maintenance';
    assignedTo: string;
  }[];
}

// Sample data - this would typically come from an API
const projectDetails: ProjectDetails = {
  name: 'Grandview Residences',
  startDate: '2023-08-15',
  deadline: '2024-06-30',
  status: 'In Progress',
  description: 'Luxury residential complex featuring modern amenities and sustainable design elements.',
  progress: 45,
  tasks: [
    {
      name: 'Foundation Work',
      status: 'Completed',
      dueDate: '2023-09-30',
    },
    {
      name: 'Structural Framework',
      status: 'In Progress',
      dueDate: '2023-12-15',
    },
    {
      name: 'Electrical Installation',
      status: 'Pending',
      dueDate: '2024-02-28',
    },
    {
      name: 'Interior Finishing',
      status: 'Pending',
      dueDate: '2024-04-30',
    },
  ],
  team: [
    {
      name: 'John Smith',
      role: 'Project Manager',
      image: '/placeholder.jpg',
    },
    {
      name: 'Sarah Johnson',
      role: 'Site Engineer',
      image: '/placeholder.jpg',
    },
    {
      name: 'Mike Wilson',
      role: 'Construction Supervisor',
      image: '/placeholder.jpg',
    },
  ],
  equipment: [
    {
      name: 'Excavator',
      status: 'In Use',
      assignedTo: 'Foundation Team',
    },
    {
      name: 'Crane',
      status: 'In Use',
      assignedTo: 'Structure Team',
    },
    {
      name: 'Concrete Mixer',
      status: 'Available',
      assignedTo: '-',
    },
  ],
};

const getStatusStyle = (status: StatusType) => {
  const styles = {
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Planning': 'bg-purple-100 text-purple-800',
    'On Hold': 'bg-gray-100 text-gray-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Available': 'bg-green-100 text-green-800',
    'Maintenance': 'bg-orange-100 text-orange-800',
  } as const;
  return styles[status] || styles['In Progress'];
};

export default function ProjectDetailsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-gray-800">{projectDetails.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{projectDetails.description}</p>
        </motion.div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(projectDetails.status)}`}
        >
          {projectDetails.status}
        </motion.span>
      </div>

      {/* Project Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCalendar className="text-blue-600 w-5 h-5" />
            <span className="ml-2 text-sm text-gray-500">Start Date</span>
          </div>
          <p className="mt-2 text-lg font-medium">
            {new Date(projectDetails.startDate).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiClock className="text-blue-600 w-5 h-5" />
            <span className="ml-2 text-sm text-gray-500">Deadline</span>
          </div>
          <p className="mt-2 text-lg font-medium">
            {new Date(projectDetails.deadline).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiUsers className="text-blue-600 w-5 h-5" />
            <span className="ml-2 text-sm text-gray-500">Team Members</span>
          </div>
          <p className="mt-2 text-lg font-medium">{projectDetails.team.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiClipboard className="text-blue-600 w-5 h-5" />
            <span className="ml-2 text-sm text-gray-500">Progress</span>
          </div>
          <div className="mt-2">
            <div className="flex items-center">
              <span className="text-lg font-medium">{projectDetails.progress}%</span>
              <div className="flex-1 ml-4 h-2 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${projectDetails.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-4">Tasks</h2>
          <div className="space-y-4">
            {projectDetails.tasks.map((task) => (
              <div key={task.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">{task.name}</h3>
                  <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(task.status)}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Equipment Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-4">Equipment</h2>
          <div className="space-y-4">
            {projectDetails.equipment.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                  <p className="text-xs text-gray-500">Assigned to: {item.assignedTo}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(item.status as StatusType)}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-4">Team Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectDetails.team.map((member) => (
              <div key={member.name} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-gray-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">{member.name}</h3>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
