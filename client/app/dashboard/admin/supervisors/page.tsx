'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiUserAddLine,
  RiDeleteBin6Line,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiAddLine,
  RiBuildingLine,
} from 'react-icons/ri';

interface Project {
  id: string;
  name: string;
  status: 'ongoing' | 'completed' | 'pending';
  startDate: string;
  endDate: string;
  location: string;
}

interface Supervisor {
  id: string;
  name: string;
  photo: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  assignedProjects: Project[];
}

// Sample data
const initialSupervisors: Supervisor[] = [
  {
    id: '1',
    name: 'John Smith',
    photo: '/images/supervisors/john.jpg',
    email: 'john.smith@example.com',
    phone: '+1 234-567-8901',
    specialization: 'Residential Construction',
    experience: '10 years',
    assignedProjects: [
      {
        id: 'p1',
        name: 'Modern Villa Project',
        status: 'ongoing',
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        location: 'Palm Beach',
      },
    ],
  },
  // Add more sample supervisors
];

const availableProjects: Project[] = [
  {
    id: 'p2',
    name: 'Luxury Apartment Complex',
    status: 'pending',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    location: 'Downtown',
  },
  {
    id: 'p3',
    name: 'Commercial Office Building',
    status: 'ongoing',
    startDate: '2024-02-15',
    endDate: '2024-12-31',
    location: 'Business District',
  },
  // Add more available projects
];

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>(initialSupervisors);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignProjectModalOpen, setIsAssignProjectModalOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [newSupervisor, setNewSupervisor] = useState<Partial<Supervisor>>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    assignedProjects: [],
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddSupervisor = () => {
    if (newSupervisor.name && newSupervisor.email) {
      const supervisor: Supervisor = {
        id: Date.now().toString(),
        photo: '/images/supervisors/placeholder.jpg',
        assignedProjects: [],
        ...newSupervisor as Omit<Supervisor, 'id' | 'photo' | 'assignedProjects'>,
      } as Supervisor;
      setSupervisors([...supervisors, supervisor]);
      setIsAddModalOpen(false);
      setNewSupervisor({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        experience: '',
        assignedProjects: [],
      });
    }
  };

  const handleDeleteSupervisor = (id: string) => {
    setSupervisors(supervisors.filter((sup) => sup.id !== id));
  };

  const handleAssignProject = (project: Project) => {
    if (selectedSupervisor) {
      setSupervisors(
        supervisors.map((sup) =>
          sup.id === selectedSupervisor.id
            ? {
                ...sup,
                assignedProjects: [...sup.assignedProjects, project],
              }
            : sup
        )
      );
      setIsAssignProjectModalOpen(false);
      setSelectedSupervisor(null);
    }
  };

  const handleRemoveProject = (supervisorId: string, projectId: string) => {
    setSupervisors(
      supervisors.map((sup) =>
        sup.id === supervisorId
          ? {
              ...sup,
              assignedProjects: sup.assignedProjects.filter(
                (proj) => proj.id !== projectId
              ),
            }
          : sup
      )
    );
  };

  const filteredSupervisors = supervisors.filter((supervisor) =>
    supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supervisor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-800">Supervisors</h1>
          <p className="text-gray-600">Manage construction supervisors and their projects</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <RiUserAddLine />
          Add Supervisor
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search supervisors by name or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Supervisors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredSupervisors.map((supervisor) => (
            <motion.div
              key={supervisor.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Supervisor Header */}
              <div className="relative h-48">
                <Image
                  src={supervisor.photo}
                  alt={supervisor.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">{supervisor.name}</h3>
                  <p className="text-sm opacity-90">{supervisor.specialization}</p>
                </div>
              </div>

              {/* Supervisor Details */}
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {supervisor.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {supervisor.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Experience:</span> {supervisor.experience}
                  </p>
                </div>

                {/* Assigned Projects */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800">Assigned Projects</h4>
                    <button
                      onClick={() => {
                        setSelectedSupervisor(supervisor);
                        setIsAssignProjectModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <RiAddLine />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {supervisor.assignedProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div>
                          <p className="font-medium text-sm">{project.name}</p>
                          <p className="text-xs text-gray-500">{project.location}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              project.status === 'ongoing'
                                ? 'bg-green-100 text-green-800'
                                : project.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {project.status}
                          </span>
                          <button
                            onClick={() => handleRemoveProject(supervisor.id, project.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <RiCloseLine />
                          </button>
                        </div>
                      </div>
                    ))}
                    {supervisor.assignedProjects.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No projects assigned</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => handleDeleteSupervisor(supervisor.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <RiDeleteBin6Line />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Supervisor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Supervisor</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={newSupervisor.name}
                  onChange={(e) =>
                    setNewSupervisor({ ...newSupervisor, name: e.target.value })
                  }
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={newSupervisor.email}
                  onChange={(e) =>
                    setNewSupervisor({ ...newSupervisor, email: e.target.value })
                  }
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newSupervisor.phone}
                  onChange={(e) =>
                    setNewSupervisor({ ...newSupervisor, phone: e.target.value })
                  }
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specialization
                </label>
                <input
                  type="text"
                  value={newSupervisor.specialization}
                  onChange={(e) =>
                    setNewSupervisor({ ...newSupervisor, specialization: e.target.value })
                  }
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Experience
                </label>
                <input
                  type="text"
                  value={newSupervisor.experience}
                  onChange={(e) =>
                    setNewSupervisor({ ...newSupervisor, experience: e.target.value })
                  }
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSupervisor}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Supervisor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Project Modal */}
      {isAssignProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Assign Project to {selectedSupervisor?.name}
            </h2>
            <div className="space-y-4">
              {availableProjects
                .filter(
                  (project) =>
                    !selectedSupervisor?.assignedProjects.some(
                      (p) => p.id === project.id
                    )
                )
                .map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAssignProject(project)}
                  >
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.location}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'ongoing'
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setIsAssignProjectModalOpen(false);
                  setSelectedSupervisor(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
