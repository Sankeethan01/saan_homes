'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiUserAddLine,
  RiDeleteBin6Line,
  RiEditLine,
} from 'react-icons/ri';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  status: 'ongoing' | 'completed' | 'pending';
  start_date: string;
  estimated_end_date: string;
  location: string;
}

interface Supervisor {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string | null;
  role: string;
  date_of_birth: string;
  address: string;
  assigned_projects: Project[];
}

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSupervisor, setNewSupervisor] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'SUPERVISOR',
    date_of_birth: '',
    address: '',
  });

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    const fetchSupervisors = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/?role=SUPERVISOR`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            clearToken();
            router.replace('/dashboard/login');
            return;
          }
          throw new Error('Failed to fetch supervisors');
        }

        const data = await response.json();
        setSupervisors(data);
        setError(null);
      } catch (err) {
        setError('Error loading supervisors. Please try again later.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisors();
  }, [token, router, clearToken]);

  const handleAddSupervisor = async () => {
    if (!newSupervisor.username || !newSupervisor.password || !newSupervisor.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const loadingToast = toast.loading('Adding supervisor...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newSupervisor.username,
          password: newSupervisor.password,
          email: newSupervisor.email,
          first_name: newSupervisor.first_name,
          last_name: newSupervisor.last_name,
          role: 'SUPERVISOR',
          date_of_birth: newSupervisor.date_of_birth || null,
          address: newSupervisor.address || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add supervisor');
      }

      const data = await response.json();
      setSupervisors([...supervisors, data]);
      setIsAddModalOpen(false);
      setNewSupervisor({
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'SUPERVISOR',
        date_of_birth: '',
        address: '',
      });
      toast.success('Supervisor added successfully');
    } catch (err) {
      console.error('Error adding supervisor:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add supervisor');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleDeleteSupervisor = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/${id}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete supervisor');
      }

      setSupervisors(supervisors.filter((sup) => sup.id !== id));
      toast.success('Supervisor deleted successfully');
    } catch (err) {
      toast.error('Failed to delete supervisor');
    }
  };

  const handleUpdateSupervisor = async (id: string, updatedData: Partial<Supervisor>) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/${id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update supervisor');
      }

      const updatedSupervisor = await response.json();
      setSupervisors(
        supervisors.map((sup) => (sup.id === id ? updatedSupervisor : sup))
      );
      setIsEditModalOpen(false);
      setSelectedSupervisor(null);
      toast.success('Supervisor updated successfully');
    } catch (err) {
      toast.error('Failed to update supervisor');
    }
  };

  const filteredSupervisors = supervisors.filter(
    (supervisor) =>
      supervisor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supervisor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supervisor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-800">Supervisors</h1>
          <p className="text-gray-600">Manage site supervisors and their details</p>
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
          placeholder="Search supervisors by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Supervisors Grid */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredSupervisors.map((supervisor) => (
            <motion.div
              key={supervisor.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    {supervisor.profile_image ? (
                      <Image
                        src={supervisor.profile_image}
                        alt={`${supervisor.first_name} ${supervisor.last_name}`}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-semibold text-gray-500">
                        {supervisor.first_name[0]}
                        {supervisor.last_name[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {supervisor.first_name} {supervisor.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{supervisor.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedSupervisor(supervisor);
                      setIsEditModalOpen(true);
                    }}
                    className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-2"
                  >
                    <RiEditLine className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSupervisor(supervisor.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors flex items-center gap-2"
                  >
                    <RiDeleteBin6Line className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Username</p>
                  <p className="font-medium text-gray-900">{supervisor.username}</p>
                </div>
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{supervisor.address || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {supervisor.date_of_birth
                      ? new Date(supervisor.date_of_birth).toLocaleDateString()
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium text-gray-900">{supervisor.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Supervisor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add New Supervisor</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddSupervisor(); }} className="space-y-4">
              <div>
                <label htmlFor="add-username" className="block text-sm font-medium text-gray-700">Username*</label>
                <input
                  id="add-username"
                  type="text"
                  value={newSupervisor.username}
                  onChange={(e) => setNewSupervisor({ ...newSupervisor, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-password" className="block text-sm font-medium text-gray-700">Password*</label>
                <input
                  id="add-password"
                  type="password"
                  value={newSupervisor.password}
                  onChange={(e) => setNewSupervisor({ ...newSupervisor, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-email" className="block text-sm font-medium text-gray-700">Email*</label>
                <input
                  id="add-email"
                  type="email"
                  value={newSupervisor.email}
                  onChange={(e) => setNewSupervisor({ ...newSupervisor, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-firstname" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  id="add-firstname"
                  type="text"
                  value={newSupervisor.first_name}
                  onChange={(e) => setNewSupervisor({ ...newSupervisor, first_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="add-lastname" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  id="add-lastname"
                  type="text"
                  value={newSupervisor.last_name}
                  onChange={(e) => setNewSupervisor({ ...newSupervisor, last_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="add-dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  id="add-dob"
                  type="date"
                  value={newSupervisor.date_of_birth}
                  onChange={(e) => setNewSupervisor({ ...newSupervisor, date_of_birth: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="add-address" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  id="add-address"
                  type="text"
                  value={newSupervisor.address}
                  onChange={(e) => setNewSupervisor({ ...newSupervisor, address: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Supervisor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supervisor Modal */}
      {isEditModalOpen && selectedSupervisor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit Supervisor</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateSupervisor(selectedSupervisor.id, {
                  first_name: selectedSupervisor.first_name,
                  last_name: selectedSupervisor.last_name,
                  email: selectedSupervisor.email,
                  date_of_birth: selectedSupervisor.date_of_birth,
                  address: selectedSupervisor.address,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={selectedSupervisor.email}
                  onChange={(e) =>
                    setSelectedSupervisor({ ...selectedSupervisor, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-firstname" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  id="edit-firstname"
                  type="text"
                  value={selectedSupervisor.first_name}
                  onChange={(e) =>
                    setSelectedSupervisor({ ...selectedSupervisor, first_name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-lastname" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  id="edit-lastname"
                  type="text"
                  value={selectedSupervisor.last_name}
                  onChange={(e) =>
                    setSelectedSupervisor({ ...selectedSupervisor, last_name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  id="edit-dob"
                  type="date"
                  value={selectedSupervisor.date_of_birth}
                  onChange={(e) =>
                    setSelectedSupervisor({ ...selectedSupervisor, date_of_birth: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  id="edit-address"
                  type="text"
                  value={selectedSupervisor.address}
                  onChange={(e) =>
                    setSelectedSupervisor({ ...selectedSupervisor, address: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedSupervisor(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
