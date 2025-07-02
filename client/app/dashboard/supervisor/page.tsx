'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import {
  RiBuildingLine,
  RiTimeLine,
  RiCheckLine,
  RiTeamLine,
  RiCalendarLine,
  RiBarChartBoxLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiRidingLine,
  RiNotificationLine,
  RiSettingsLine,
  RiUserLine,
  RiSearchLine,
} from 'react-icons/ri';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Sample data for charts (keeping these as fallback)
const monthlyProgress = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Project Progress',
      data: [65, 72, 78, 85, 89, 93],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
};

const teamPerformance = {
  labels: ['Team A', 'Team B', 'Team C', 'Team D'],
  datasets: [
    {
      label: 'Performance Score',
      data: [88, 92, 85, 90],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderRadius: 8,
    },
  ],
};

interface ProjectStats {
  total: number;
  ongoing: number;
  completed: number;
  upcoming: number;
  average_progress: number;
  project_types: Record<string, number>;
  recent_activities: Array<{
    id: string;
    activity: string;
    project: string;
    time: string;
    type: string;
    progress: number;
  }>;
}
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
export default function SupervisorDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    total: 0,
    ongoing: 0,
    completed: 0,
    upcoming: 0,
    average_progress: 0,
    project_types: {},
    recent_activities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const token = useAuthStore((s) => s.token);
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : 'User';
  const router = useRouter();

  useEffect(() => {
    const fetchProjectStats = async () => {
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE}/projects/supervisor_stats/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjectStats(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch project stats:', err);
        setError(err.response?.data?.error || 'Failed to fetch project statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectStats();
  }, [token]);

  // Generate project types chart data from API response
  const projectTypes = {
    labels: Object.keys(projectStats.project_types),
    datasets: [
      {
        data: Object.values(projectStats.project_types),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold">Error: {error}</p>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl">
                <RiBuildingLine className="text-white text-2xl" />
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent leading-tight">
                    Supervisor Dashboard
                  </h1>
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full animate-pulse"></div>
                  <p className="text-base text-slate-600 font-medium">
                    Welcome back,{' '}
                    <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                      {username}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                className="p-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl hover:bg-white/90 transition-all duration-300 shadow-lg"
                onClick={() => router.push('/dashboard/supervisor/notifications')}
                aria-label="Notifications"
              >
                <RiNotificationLine className="text-lg text-slate-600" />
              </button>
              
              <button
                className="p-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl hover:bg-white/90 transition-all duration-300 shadow-lg"
                onClick={() => router.push('/dashboard/supervisor/profile')}
                aria-label="Settings"
              >
                <RiSettingsLine className="text-lg text-slate-600" />
              </button>

              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src="/assets/images/user.png"
                      alt="Site Supervisor"
                      className="w-full h-full object-cover rounded-2xl"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const nextSibling = target.nextElementSibling as HTMLElement;
                        if (nextSibling) {
                          nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center" style={{ display: 'none' }}>
                      <RiUserLine className="text-lg text-blue-600" />
                    </div>
                  </div>
                </div>
                {/* Online Status Indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                {/* Profile Tooltip */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
                      <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden">
                        <img
                          src="/assets/images/user.png"
                          alt="Site Supervisor"
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const nextSibling = target.nextElementSibling as HTMLElement;
                            if (nextSibling) {
                              nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center" style={{ display: 'none' }}>
                          <RiUserLine className="text-base text-blue-600" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{username}</p>
                      <p className="text-sm text-slate-600">Site Supervisor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Projects', value: projectStats.total, icon: RiBuildingLine, color: 'blue' },
            { title: 'Ongoing', value: projectStats.ongoing, icon: RiTimeLine, color: 'purple' },
            { title: 'Completed', value: projectStats.completed, icon: RiCheckLine, color: 'green' },
            { title: 'Upcoming', value: projectStats.upcoming, icon: RiCalendarLine, color: 'pink' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="group bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-md border border-white/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 rounded-xl shadow group-hover:scale-105 transition-transform duration-300`}>
                  <stat.icon className="text-base text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-0.5">{stat.value}</h3>
                <p className="text-xs text-slate-600 font-medium">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Project Progress</h2>
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <RiRidingLine />
                {projectStats.average_progress}% average
              </div>
            </div>
            <Line
              data={monthlyProgress}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
                elements: {
                  point: {
                    radius: 6,
                    hoverRadius: 8,
                  },
                },
              }}
            />
          </motion.div>

          {/* Project Types Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Project Types Distribution</h2>
            <div className="h-[300px] flex items-center justify-center">
              {Object.keys(projectStats.project_types).length > 0 ? (
                <Doughnut
                  data={projectTypes}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <p>No project types data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Team Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Team Performance</h2>
              <div className="text-sm text-slate-600">Average: 88.8%</div>
            </div>
            <Bar
              data={teamPerformance}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Activities</h2>
            <div className="space-y-6">
              {projectStats.recent_activities.length > 0 ? (
                projectStats.recent_activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-all duration-300"
                  >
                    <div className={`p-2 rounded-xl ${
                      activity.type === 'success' ? 'bg-green-100 text-green-600' :
                      activity.type === 'info' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      <RiBuildingLine className="text-base" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-800 font-semibold">{activity.activity}</p>
                      <p className="text-sm text-slate-600">{activity.project}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
