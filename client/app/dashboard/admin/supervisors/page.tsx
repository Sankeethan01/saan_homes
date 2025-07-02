'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  RiUserAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiSearchLine,
  RiUserLine,
  RiTeamLine,
  RiFileListLine,
} from 'react-icons/ri';
import { FiMail, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);
  const [searchTerm, setSearchTerm] = useState('');

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



  const handleDeleteSupervisor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supervisor?')) {
      return;
    }

    setActionLoading(true);
    const loadingToast = toast.loading('Deleting supervisor...');

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
      console.error('Error deleting supervisor:', err);
      toast.error('Failed to delete supervisor');
    } finally {
      setActionLoading(false);
      toast.dismiss(loadingToast);
    }
  };



  const filteredSupervisors = supervisors.filter(
    (supervisor) =>
      supervisor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supervisor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supervisor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supervisor.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStats = () => {
    const totalSupervisors = supervisors.length;
    const activeSupervisors = supervisors.filter(s => s.assigned_projects?.length > 0).length;
    const totalProjects = supervisors.reduce((sum, s) => sum + (s.assigned_projects?.length || 0), 0);
    
    return {
      total: totalSupervisors,
      active: activeSupervisors,
      inactive: totalSupervisors - activeSupervisors,
      projects: totalProjects,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 px-4 py-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <RiUserLine className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Error loading supervisors</h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-[#1b4965] bg-clip-text text-transparent">
            Supervisors Management
          </h1>
          <p className="text-slate-600 mt-1">Manage site supervisors and their project assignments</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/admin/supervisors/new')}
          disabled={actionLoading}
          className="bg-[#1b4965] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-[#1b4965] transition-colors shadow-sm disabled:opacity-50"
        >
          <RiUserAddLine className="w-4 h-4" />
          Add Supervisor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Supervisors</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <RiTeamLine className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Supervisors</p>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Available</p>
              <p className="text-2xl font-bold text-slate-900">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <RiUserLine className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900">{stats.projects}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <RiFileListLine className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search supervisors by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Supervisors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSupervisors.length > 0 ? (
            filteredSupervisors.map((supervisor, index) => (
              <motion.div
                key={supervisor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.05 * index }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
              >
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {supervisor.profile_image ? (
                      <Image
                        src={supervisor.profile_image}
                        alt={`${supervisor.first_name} ${supervisor.last_name}`}
                        width={64}
                        height={64}
                        className="rounded-full object-cover border-2 border-slate-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-[#1b4965] flex items-center justify-center border-2 border-slate-200">
                        <span className="text-xl font-bold text-white">
                          {supervisor.first_name?.[0] || ''}
                          {supervisor.last_name?.[0] || ''}
                        </span>
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      supervisor.assigned_projects?.length > 0 ? 'bg-green-500' : 'bg-slate-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {supervisor.first_name} {supervisor.last_name}
                    </h3>
                    <p className="text-sm text-slate-500">@{supervisor.username}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      supervisor.assigned_projects?.length > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {supervisor.assigned_projects?.length > 0 ? 'Active' : 'Available'}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FiMail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{supervisor.email}</span>
                  </div>
                  
                  {supervisor.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiMapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{supervisor.address}</span>
                    </div>
                  )}
                  
                  {supervisor.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiCalendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(supervisor.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Project Assignment */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Assigned Projects</span>
                    <span className="text-xs text-slate-500">
                      {supervisor.assigned_projects?.length || 0} projects
                    </span>
                  </div>
                  
                  {supervisor.assigned_projects?.length > 0 ? (
                    <div className="space-y-1">
                      {supervisor.assigned_projects.slice(0, 2).map((project) => (
                        <div key={project.id} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                          {project.name}
                        </div>
                      ))}
                      {supervisor.assigned_projects.length > 2 && (
                        <div className="text-xs text-slate-500">
                          +{supervisor.assigned_projects.length - 2} more projects
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded text-center">
                      No projects assigned
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/admin/supervisors/edit/${supervisor.id}`)}
                    disabled={actionLoading}
                    className="flex-1 px-3 py-2 bg-[#1b4965] text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                  >
                    <RiEditLine className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSupervisor(supervisor.id)}
                    disabled={actionLoading}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-16"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <RiTeamLine className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No supervisors found</h3>
              <p className="text-slate-500 text-center max-w-md">
                {searchTerm 
                  ? 'No supervisors match your search criteria. Try adjusting your search terms.' 
                  : 'No supervisors have been added yet. Add your first supervisor to get started.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/dashboard/admin/supervisors/new')}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] transition-colors"
                >
                  Add First Supervisor
                </button>
              )}
            </motion.div>
          )}
      </div>




    </div>
  );
}
