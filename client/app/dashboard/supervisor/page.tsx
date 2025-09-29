"use client";

import { useState, useEffect, memo, useCallback, useMemo, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useOptimizedAPI } from "@/app/hooks/useOptimizedAPI";
import {
  RiBuildingLine,
  RiTimeLine,
  RiCheckLine,
  RiCalendarLine,
  RiRidingLine,
  RiNotificationLine,
  RiSettingsLine,
  RiSearchLine,
} from "react-icons/ri";

// Lazy load heavy chart components with proper error handling
const Line = lazy(() => 
  import("react-chartjs-2").then(module => ({ default: module.Line }))
  .catch(() => ({ default: () => <div className="h-40 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-gray-500">Chart unavailable</div> }))
);

const Bar = lazy(() => 
  import("react-chartjs-2").then(module => ({ default: module.Bar }))
  .catch(() => ({ default: () => <div className="h-40 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-gray-500">Chart unavailable</div> }))
);

const Doughnut = lazy(() => 
  import("react-chartjs-2").then(module => ({ default: module.Doughnut }))
  .catch(() => ({ default: () => <div className="h-40 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-gray-500">Chart unavailable</div> }))
);

// Pre-register Chart.js components to avoid runtime registration
let chartRegistered = false;
const registerCharts = async () => {
  if (chartRegistered) return;
  try {
    const ChartJS = await import("chart.js");
    const { 
      CategoryScale, 
      LinearScale, 
      PointElement, 
      LineElement, 
      BarElement, 
      Title, 
      Tooltip, 
      Legend, 
      ArcElement, 
      Filler 
    } = await import("chart.js");
    
    ChartJS.Chart.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      Title,
      Tooltip,
      Legend,
      ArcElement,
      Filler
    );
    chartRegistered = true;
  } catch (error) {
    console.warn('Chart.js registration failed:', error);
  }
};

// Generate random chart data
const generateRandomData = () => {
  const monthlyProgress = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Project Progress",
        data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 40) + 40),
        borderColor: "#1b4965",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const invoicesOverview = {
    labels: ["Paid", "Pending", "Overdue"],
    datasets: [
      {
        label: "Invoices",
        data: [
          Math.floor(Math.random() * 50) + 80,
          Math.floor(Math.random() * 30) + 20,
          Math.floor(Math.random() * 10) + 5
        ],
        backgroundColor: ["#cbf3f0", "#e7c6ff", "#ffcad4"],
        borderRadius: 8,
        barPercentage: 0.6,
        categoryPercentage: 0.5,
      },
    ],
  };

  const completionRateData = {
    labels: ["Completed", "Ongoing", "Upcoming"],
    datasets: [
      {
        data: [
          Math.floor(Math.random() * 8) + 8,
          Math.floor(Math.random() * 6) + 4,
          Math.floor(Math.random() * 4) + 2
        ],
        backgroundColor: ["#f4acb7", "#9a8c98", "#b7e4c7"],
        borderColor: ["#f4acb7", "#9a8c98", "#b7e4c7"],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  return { monthlyProgress, invoicesOverview, completionRateData };
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
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

// Memoized chart components
const ChartWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="h-40 bg-gray-100 rounded-lg animate-pulse" />}>
    {children}
  </Suspense>
));

ChartWrapper.displayName = 'ChartWrapper';

// Memoized stats card component
const StatsCard = memo(({ stat, index }: { stat: any; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.03, y: -2 }}
    className={`group p-2 rounded-xl shadow border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center ${
      index === 0
        ? "bg-gradient-to-br from-[#e3f0ff] to-white"
        : index === 1
        ? "bg-gradient-to-br from-[#ffe3ec] to-white"
        : index === 2
        ? "bg-gradient-to-br from-[#e3ffe9] to-white"
        : "bg-gradient-to-br from-[#fffbe3] to-white"
    }`}
  >
    <div
      className={
        `p-1 rounded-lg mb-0.5 flex items-center justify-center ` +
        (index === 0
          ? "bg-[#cbeafe]"
          : index === 1
          ? "bg-[#ffd6e3]"
          : index === 2
          ? "bg-[#caffdd]"
          : "bg-[#fff7c2]")
      }
    >
      {stat.icon && (
        <stat.icon className="text-base text-[#1b4965]" />
      )}
    </div>
    <h3 className="text-lg font-bold text-[#1b4965] mb-0.5">
      {stat.value}
    </h3>
    <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
  </motion.div>
));

StatsCard.displayName = 'StatsCard';

export default function SupervisorDashboard() {
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    total: 0,
    ongoing: 0,
    completed: 0,
    upcoming: 0,
    average_progress: 0,
    project_types: {},
    recent_activities: [],
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useAuthStore((s) => s.token);
  const username = useMemo(() => 
    typeof window !== "undefined" ? localStorage.getItem("username") : "User", 
    []
  );
  const router = useRouter();

  // Use optimized API hooks with caching - only for projects, skip stats
  const { data: apiProjectsData, loading: projectsLoading, error: projectsError } = useOptimizedAPI(
    `${API_BASE}/projects/supervisor_projects/`,
    { headers: { Authorization: `Bearer ${token}` } },
    { cacheKey: 'supervisor-projects', ttl: 300000 } // 5 minutes cache
  );

  // Debug logging
  useEffect(() => {
    console.log('Dashboard Debug:', {
      token: token ? 'Present' : 'Missing',
      projectsLoading,
      projectsError,
      apiProjectsData: apiProjectsData ? `Array with ${Array.isArray(apiProjectsData) ? apiProjectsData.length : 'unknown'} items` : 'null/undefined'
    });
  }, [token, projectsLoading, projectsError, apiProjectsData]);

  // Update state when API data changes - only projects, generate stats locally
  useEffect(() => {
    if (apiProjectsData && Array.isArray(apiProjectsData)) {
      setProjects(apiProjectsData);
      
      const projectsArr = apiProjectsData;
      const totalCount = projectsArr.length;
      const ongoingCount = projectsArr.filter(
        (p: any) => p.status === "IN_PROGRESS" && !p.is_completed
      ).length;
      const completedCount = projectsArr.filter(
        (p: any) => p.is_completed || p.status === "COMPLETED"
      ).length;
      const upcomingCount = projectsArr.filter(
        (p: any) => p.status === "PLANNING" && !p.is_completed
      ).length;

      // Generate random project types for demo
      const projectTypes = {
        'Residential': Math.floor(Math.random() * 5) + 1,
        'Commercial': Math.floor(Math.random() * 3) + 1,
        'Industrial': Math.floor(Math.random() * 2) + 1,
      };

      // Generate random recent activities
      const recentActivities = [
        {
          id: '1',
          activity: 'Project milestone completed',
          project: projectsArr[0]?.name || 'Sample Project',
          time: '2 hours ago',
          type: 'success',
          progress: 85
        },
        {
          id: '2',
          activity: 'New progress log added',
          project: projectsArr[1]?.name || 'Another Project',
          time: '4 hours ago',
          type: 'info',
          progress: 60
        },
        {
          id: '3',
          activity: 'Invoice submitted',
          project: projectsArr[2]?.name || 'Third Project',
          time: '1 day ago',
          type: 'success',
          progress: 90
        }
      ];

      setProjectStats({
        total: totalCount,
        ongoing: ongoingCount,
        completed: completedCount,
        upcoming: upcomingCount,
        average_progress: Math.floor((ongoingCount * 65 + completedCount * 100 + upcomingCount * 25) / Math.max(totalCount, 1)),
        project_types: projectTypes,
        recent_activities: recentActivities,
      });
    } else if (apiProjectsData === null || (Array.isArray(apiProjectsData) && apiProjectsData.length === 0)) {
      // Handle empty projects case
      setProjects([]);
      setProjectStats({
        total: 0,
        ongoing: 0,
        completed: 0,
        upcoming: 0,
        average_progress: 0,
        project_types: {
          'Residential': 0,
          'Commercial': 0,
          'Industrial': 0,
        },
        recent_activities: [
          {
            id: '1',
            activity: 'No projects available',
            project: 'System',
            time: 'Just now',
            type: 'info',
            progress: 0
          }
        ],
      });
    }
  }, [apiProjectsData]);

  // Update loading state with timeout
  useEffect(() => {
    setLoading(projectsLoading);
    
    // Set a timeout to stop loading after 10 seconds
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [projectsLoading]);

  // Update error state
  useEffect(() => {
    if (projectsError) {
      setError("Failed to load projects. Please try again.");
      setLoading(false); // Stop loading on error
    } else {
      setError(null);
    }
  }, [projectsError]);

  // Handle case when no token - show demo data
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError(null); // Don't show error, just show demo data
      setProjects([]);
      setProjectStats({
        total: 0,
        ongoing: 0,
        completed: 0,
        upcoming: 0,
        average_progress: 0,
        project_types: {
          'Residential': 0,
          'Commercial': 0,
          'Industrial': 0,
        },
        recent_activities: [
          {
            id: '1',
            activity: 'Please log in to view projects',
            project: 'System',
            time: 'Just now',
            type: 'info',
            progress: 0
          }
        ],
      });
    }
  }, [token]);

  // Register charts on component mount
  useEffect(() => {
    registerCharts();
  }, []);

  // Fallback: Show dashboard after 3 seconds even if still loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (loading) {
        console.log('Dashboard fallback: Showing demo data after timeout');
        setLoading(false);
        setError(null);
        setProjects([]);
        setProjectStats({
          total: 0,
          ongoing: 0,
          completed: 0,
          upcoming: 0,
          average_progress: 0,
          project_types: {
            'Residential': 0,
            'Commercial': 0,
            'Industrial': 0,
          },
          recent_activities: [
            {
              id: '1',
              activity: 'Loading projects...',
              project: 'System',
              time: 'Just now',
              type: 'info',
              progress: 0
            }
          ],
        });
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [loading]);

  // Generate random chart data
  const chartData = useMemo(() => generateRandomData(), []);
  
  // Memoize chart data to prevent unnecessary recalculations
  const projectTypes = useMemo(() => ({
    labels: Object.keys(projectStats.project_types),
    datasets: [
      {
        data: Object.values(projectStats.project_types),
        backgroundColor: [
          "#be95c4",
          "#b7b7a4",
          "#bbdefb",
          "#f3d5b5",
          "#a4c3b2",
          "#aeb8fe",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  }), [projectStats.project_types]);

  // Memoize stats data
  const dashboardStatsData = useMemo(() => [
    {
      title: "Total Projects",
      value: projectStats.total,
      icon: RiBuildingLine,
      color: "blue",
    },
    {
      title: "Ongoing",
      value: projectStats.ongoing,
      icon: RiTimeLine,
      color: "purple",
    },
    {
      title: "Completed",
      value: projectStats.completed,
      icon: RiCheckLine,
      color: "green",
    },
    {
      title: "Upcoming",
      value: projectStats.upcoming,
      icon: RiCalendarLine,
      color: "pink",
    },
  ], [projectStats]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="min-h-screen p-4 md:p-6 relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-40 h-40 bg-[#e3f0ff] rounded-full blur-3xl opacity-60 -z-10" />
      <div className="fixed top-1/2 right-0 w-48 h-48 bg-[#ffe3ec] rounded-full blur-3xl opacity-50 -z-10" />
      <div className="fixed bottom-0 left-1/3 w-56 h-56 bg-[#e3ffe9] rounded-full blur-3xl opacity-40 -z-10" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-3">
        {/* Header skeleton */}
        <div className="bg-white rounded-2xl p-3 shadow border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-2 shadow border border-gray-100 animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          <div className="bg-white rounded-2xl p-2 shadow border border-gray-100 animate-pulse">
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-2xl p-2 shadow border border-gray-100 animate-pulse">
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
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
    <div className="min-h-screen  p-4 md:p-6 relative overflow-x-hidden">
      {/* Pastel background blobs */}
      <div className="fixed top-0 left-0 w-40 h-40 bg-[#e3f0ff] rounded-full blur-3xl opacity-60 -z-10" />
      <div className="fixed top-1/2 right-0 w-48 h-48 bg-[#ffe3ec] rounded-full blur-3xl opacity-50 -z-10" />
      <div className="fixed bottom-0 left-1/3 w-56 h-56 bg-[#e3ffe9] rounded-full blur-3xl opacity-40 -z-10" />
      <div className="relative z-10 max-w-7xl mx-auto space-y-3">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white via-[#f0f6ff] to-white rounded-2xl p-2 md:p-3 shadow border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gradient-to-br from-[#e3f0ff] to-[#cbeafe] rounded-xl">
                <RiBuildingLine className="text-[#1b4965] text-base" />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-lg md:text-xl font-bold text-[#1b4965] leading-tight">
                  Supervisor Dashboard
                </h1>
                <p className="text-[11px] text-gray-500 font-medium">
                  Welcome back,{" "}
                  <span className="font-semibold text-[#1b4965]">
                    {username}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="relative">
                <RiSearchLine className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-300 text-xs" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-7 pr-2 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1b4965] focus:border-[#1b4965] min-w-[90px]"
                />
              </div>
              <button
                className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                onClick={() =>
                  router.push("/dashboard/supervisor/notifications")
                }
                aria-label="Notifications"
              >
                <RiNotificationLine className="text-sm text-gray-400" />
              </button>
              <button
                className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                onClick={() => router.push("/dashboard/supervisor/profile")}
                aria-label="Settings"
              >
                <RiSettingsLine className="text-sm text-gray-400" />
              </button>
              {/* Profile Picture */}
              <div className="w-8 h-8 rounded-xl bg-[#eaf3fb] flex items-center justify-center relative">
                <Image
                  src="/assets/images/user.png"
                  alt="Site Supervisor"
                  fill
                  sizes="32px"
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {dashboardStatsData.map((stat: any, index: number) => (
            <StatsCard key={stat.title} stat={stat} index={index} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-2">
          {/* Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-2 rounded-2xl shadow border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-[#1b4965]">
                Project Progress
              </h2>
              <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                <RiRidingLine />
                {projectStats.average_progress}% avg
              </div>
            </div>
            <ChartWrapper>
              <Line
                data={chartData.monthlyProgress}
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
                        color: "rgba(0, 0, 0, 0.05)",
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
                      radius: 4,
                      hoverRadius: 6,
                    },
                  },
                }}
                height={140}
              />
            </ChartWrapper>
          </motion.div>

          {/* Project Types Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-2 rounded-2xl shadow border border-gray-100"
          >
            <h2 className="text-sm font-bold text-[#1b4965] mb-2">
              Project Types Distribution
            </h2>
            <div className="h-[240px] flex items-center justify-center">
              {Object.keys(projectStats.project_types).length > 0 ? (
                <ChartWrapper>
                  <Doughnut
                    data={projectTypes}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                          },
                        },
                      },
                    }}
                    height={140}
                  />
                </ChartWrapper>
              ) : (
                <div className="text-center text-gray-500">
                  <p>No project types data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Project Stats: Invoices Overview and Project Completion Rate as separate cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Invoices Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-2 rounded-2xl shadow border border-gray-100 w-full flex flex-col"
            >
              <h2 className="text-sm font-bold text-[#1b4965] mb-2">
                Invoices Overview
              </h2>
              <div className="w-full h-[190px] flex items-center justify-center">
                <ChartWrapper>
                  <Bar
                    data={chartData.invoicesOverview}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: "#1b4965",
                          titleColor: "#fff",
                          bodyColor: "#fff",
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: "rgba(27, 73, 101, 0.07)",
                          },
                          ticks: {
                            color: "#1b4965",
                            font: { size: 11, weight: "bold" },
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: "#1b4965",
                            font: { size: 11, weight: "bold" },
                          },
                        },
                      },
                    }}
                    height={140}
                  />
                </ChartWrapper>
              </div>
            </motion.div>
            {/* Project Completion Rate Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-white p-2 rounded-3xl shadow border border-gray-100 w-full flex flex-col"
            >
              <h2 className="text-sm font-bold text-[#1b4965] mb-2">
                Project Completion Rate
              </h2>
              <div className="wrap flex-col items-justify justify-center w-full min-h-[140px]">
                <div className="w-full h-[140px] wrap items-justify justify-center">
                  <ChartWrapper>
                    <Doughnut
                      data={chartData.completionRateData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            backgroundColor: "#1b4965",
                            titleColor: "#fff",
                            bodyColor: "#fff",
                          },
                        },
                        cutout: "70%",
                      }}
                      height={140}
                    />
                  </ChartWrapper>
                </div>
                {/* Custom Legend */}
                <div className="mt-1 flex flex-col items-center">
                  {chartData.completionRateData.labels.map((label, idx) => (
                    <div
                      key={label}
                      className="flex items-center gap-1 text-xs text-gray-600 mb-0.5"
                    >
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          idx === 0
                            ? "bg-[#f4acb7]"
                            : idx === 1
                            ? "bg-[#9a8c98]"
                            : "bg-[#b7e4c7]"
                        }`}
                      ></span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Recent Activities Table (wider) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white p-2 rounded-2xl shadow border border-gray-100 w-full"
          >
            <h2 className="text-sm font-bold text-[#1b4965] mb-2">
              Recent Activities
            </h2>
            <div className="space-y-1.5">
              {projectStats.recent_activities.length > 0 ? (
                projectStats.recent_activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-start gap-1.5 p-1.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <div
                      className={`p-1 rounded-lg ${
                        activity.type === "success"
                          ? "bg-[#cdb4db]-100 text-[#cdb4db]"
                          : activity.type === "info"
                          ? "bg-blue-100 text-blue-600"
                          : activity.type === "warning"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      <RiBuildingLine className="text-xs" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#1b4965]">
                        {activity.activity}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {activity.project}
                      </p>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-2 text-xs">
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Invoices Table - new full width section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.87 }}
          className="bg-white p-2 rounded-2xl shadow border border-gray-100 w-full mt-3"
        >
          <h2 className="text-sm font-bold text-[#1b4965] mb-2">
            Recent Invoices
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-[#1b4965] border-b">
                  <th className="py-1 px-1 font-semibold">Invoice #</th>
                  <th className="py-1 px-1 font-semibold">Project</th>
                  <th className="py-1 px-1 font-semibold">Amount</th>
                  <th className="py-1 px-1 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 3).map((project, index) => {
                  const statuses = ['Paid', 'Pending', 'Overdue'];
                  const statusColors = ['text-green-600', 'text-yellow-600', 'text-red-600'];
                  const amounts = ['LKR 120,000', 'LKR 85,000', 'LKR 45,000'];
                  const status = statuses[index] || 'Paid';
                  const color = statusColors[index] || 'text-green-600';
                  const amount = amounts[index] || 'LKR 50,000';
                  
                  return (
                    <tr key={project.id} className="border-b hover:bg-gray-50">
                      <td className="py-1 px-1">INV-{String(index + 1).padStart(3, '0')}</td>
                      <td className="py-1 px-1">{project.name}</td>
                      <td className="py-1 px-1">{amount}</td>
                      <td className={`py-1 px-1 ${color} font-semibold`}>
                        {status}
                      </td>
                    </tr>
                  );
                })}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 px-1 text-center text-gray-500">
                      No projects available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
