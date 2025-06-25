'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiBuildingLine,
  RiTimeLine,
  RiCheckLine,
  RiTeamLine,
  RiCalendarLine,
  RiBarChartBoxLine,
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

// Sample data
const projectStats = {
  total: 12,
  ongoing: 5,
  completed: 4,
  upcoming: 3,
};

const monthlyProgress = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Project Progress',
      data: [65, 72, 78, 85, 89, 93],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    },
  ],
};

const projectTypes = {
  labels: ['Residential', 'Commercial', 'Industrial'],
  datasets: [
    {
      data: [45, 35, 20],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
    },
  ],
};

const teamPerformance = {
  labels: ['Team A', 'Team B', 'Team C', 'Team D'],
  datasets: [
    {
      label: 'Performance Score',
      data: [88, 92, 85, 90],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    },
  ],
};

const recentActivities = [
  {
    id: 1,
    activity: 'Project milestone completed',
    project: 'Modern Residential Complex',
    time: '2 hours ago',
  },
  {
    id: 2,
    activity: 'New team member added',
    project: 'Tech Innovation Hub',
    time: '5 hours ago',
  },
  {
    id: 3,
    activity: 'Budget update approved',
    project: 'City Center Mall',
    time: '1 day ago',
  },
];

export default function SupervisorDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : 'User';
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Supervisor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {username}</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`text-2xl text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-gray-600">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Progress</h2>
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
                },
              },
            }}
          />
        </motion.div>

        {/* Project Types Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Types Distribution</h2>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut
              data={projectTypes}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Team Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Performance</h2>
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
                },
              },
            }}
          />
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                <div>
                  <p className="text-gray-800 font-medium">{activity.activity}</p>
                  <p className="text-sm text-gray-600">{activity.project}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
