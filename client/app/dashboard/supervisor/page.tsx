"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

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
  ArcElement,
  Filler
);

// Sample data for charts (keeping these as fallback)
const monthlyProgress = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Project Progress",
      data: [65, 35, 78, 50, 89, 93],
      borderColor: "#1b4965",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.4,
      fill: true,
    },
  ],
};

// Sample data for Invoices Overview
const invoicesOverview = {
  labels: ["Paid", "Pending", "Overdue"],
  datasets: [
    {
      label: "Invoices",
      data: [120, 35, 8],
      backgroundColor: ["#cbf3f0", "#e7c6ff", "#ffcad4"],
      borderRadius: 8,
      barPercentage: 0.6,
      categoryPercentage: 0.5,
    },
  ],
};

// Sample data for Project Completion Rate
const completionRateData = {
  labels: ["Completed", "Ongoing", "Upcoming"],
  datasets: [
    {
      data: [12, 7, 5],
      backgroundColor: ["#f4acb7", "#9a8c98", "#b7e4c7"],
      borderColor: ["#f4acb7", "#9a8c98", "#b7e4c7"],
      borderWidth: 2,
      hoverOffset: 8,
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
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
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
  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") : "User";
  const router = useRouter();

  useEffect(() => {
    const fetchProjectStats = async () => {
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        // Fetch stats as before
        const statsResponse = await axios.get(
          `${API_BASE}/projects/supervisor_stats/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjectStats(statsResponse.data);
        setError(null);

        // Fetch all supervisor projects for frontend calculation
        const projectsResponse = await axios.get(
          `${API_BASE}/projects/supervisor_projects/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjects(projectsResponse.data);

        const projectsArr = Array.isArray(projectsResponse.data) ? projectsResponse.data : [];
        const totalCount = projectsArr.length;
        const ongoingCount = projectsArr.filter(
          (p) => p.status === "ACTIVE" && p.completed !== true
        ).length;
        const completedCount = projectsArr.filter(
          (p) => p.status === "COMPLETED" || p.completed === true
        ).length;
        const upcomingCount = projectsArr.filter(
          (p) => p.status === "PLANNING" && p.completed !== true
        ).length;

        setProjectStats((prev) => ({
          ...prev,
          total: totalCount,
          ongoing: ongoingCount,
          completed: completedCount,
          upcoming: upcomingCount,
        }));
      } catch (err: unknown) {
        const error = err as AxiosError<{ error?: string }>;
        console.error("Failed to fetch project stats or projects:", error);
        setError(
          error.response?.data?.error || "Failed to fetch project statistics"
        );
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b4965] mx-auto mb-4"></div>
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
          {[
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
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
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
                <Bar
                  data={invoicesOverview}
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
                  <Doughnut
                    data={completionRateData}
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
                </div>
                {/* Custom Legend */}
                <div className="mt-1 flex flex-col items-center">
                  {completionRateData.labels.map((label, idx) => (
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
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-1 px-1">INV-0012</td>
                  <td className="py-1 px-1">Green Villa</td>
                  <td className="py-1 px-1">LKR 120,000</td>
                  <td className="py-1 px-1 text-green-600 font-semibold">
                    Paid
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-1 px-1">INV-0013</td>
                  <td className="py-1 px-1">Sunset Homes</td>
                  <td className="py-1 px-1">LKR 85,000</td>
                  <td className="py-1 px-1 text-yellow-600 font-semibold">
                    Pending
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-1 px-1">INV-0014</td>
                  <td className="py-1 px-1">Skyline Towers</td>
                  <td className="py-1 px-1">LKR 45,000</td>
                  <td className="py-1 px-1 text-red-600 font-semibold">
                    Overdue
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
