'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  RiTeamLine, 
  RiToolsLine, 
  RiHomeGearLine, 
  RiMoneyDollarCircleLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiFileChartLine,
  RiCalendarLine,
  RiSearchLine,
  RiFilterLine,
  RiDownloadLine
} from 'react-icons/ri';

// Sample data for dashboard
const stats = [
  { 
    label: 'Total Projects', 
    value: '24', 
    trend: '+10.2%', 
    trendUp: true, 
    subtext: '+3 this month', 
    icon: <RiHomeGearLine className="w-6 h-6" /> 
  },
  { 
    label: 'Active Rentals', 
    value: '12,545', 
    trend: '+20.2%', 
    trendUp: true, 
    subtext: '+1,589 today', 
    icon: <RiToolsLine className="w-6 h-6" /> 
  },
  { 
    label: 'Total Visitors', 
    value: '8,344', 
    trend: '-14.2%', 
    trendUp: false, 
    subtext: '-89 today', 
    icon: <RiTeamLine className="w-6 h-6" /> 
  },
  { 
    label: 'Revenue', 
    value: '$42,189', 
    trend: '+12.6%', 
    trendUp: true, 
    subtext: '+$4,828 today', 
    icon: <RiMoneyDollarCircleLine className="w-6 h-6" /> 
  },
];

// Recent activity data
const recentActivity = [
  { user: 'John Smith', email: 'john.smith@example.com', status: 'Approved', id: '#329341', date: '49 min ago', amount: '$738.61' },
  { user: 'Sarah Johnson', email: 'sarah.j@example.com', status: 'Pending', id: '#329342', date: '27 min ago', amount: '$108.16' },
  { user: 'Michael Brown', email: 'mbrown@example.com', status: 'Completed', id: '#329343', date: '40 min ago', amount: '$1,279.80' },
  { user: 'Emma Wilson', email: 'emma.w@example.com', status: 'In Progress', id: '#329344', date: '36 min ago', amount: '$327.86' },
  { user: 'James Davis', email: 'james.d@example.com', status: 'Cancelled', id: '#329345', date: '15 min ago', amount: '$566.12' },
];

// Monthly data for chart
const monthlyData = [
  { month: 'Jan', projects: 12, rentals: 8 },
  { month: 'Feb', projects: 15, rentals: 10 },
  { month: 'Mar', projects: 18, rentals: 14 },
  { month: 'Apr', projects: 22, rentals: 16 },
  { month: 'May', projects: 27, rentals: 18 },
  { month: 'Jun', projects: 32, rentals: 22 },
];

function BarChart({ data, height = 200 }: { data: any[]; height?: number }) {
  const maxProjects = Math.max(...data.map(d => d.projects));
  const maxRentals = Math.max(...data.map(d => d.rentals));
  const maxValue = Math.max(maxProjects, maxRentals);

  return (
    <div className="mt-4">
      <div className="flex items-end h-[200px] gap-8">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center gap-1 h-full">
              <div 
                className="w-5 rounded-t-md bg-[#1b4965]" 
                style={{ height: `${(item.projects / maxValue) * 100}%` }}
                title={`Projects: ${item.projects}`}
              ></div>
              <div 
                className="w-5 rounded-t-md bg-[#5fa8d3]" 
                style={{ height: `${(item.rentals / maxValue) * 100}%` }}
                title={`Rentals: ${item.rentals}`}
              ></div>
            </div>
            <span className="text-xs text-gray-500 mt-2">{item.month}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#1b4965] rounded-sm"></div>
          <span className="text-xs text-gray-600">Projects</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#5fa8d3] rounded-sm"></div>
          <span className="text-xs text-gray-600">Rentals</span>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'in progress': return 'bg-purple-100 text-purple-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState('month');

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[#1b4965]"
          >
            Dashboard
          </motion.h1>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
              />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 text-sm hover:bg-gray-200 transition-colors">
              <RiFilterLine /> Filter
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1b4965] rounded-lg text-white text-sm hover:bg-[#0d3b59] transition-colors">
              <RiDownloadLine /> Export
            </button>
          </div>
        </div>
        
        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-2 text-gray-800">{stat.value}</h3>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs font-medium flex items-center ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trendUp ? <RiArrowUpLine className="mr-1" /> : <RiArrowDownLine className="mr-1" />}
                      {stat.trend}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{stat.subtext}</span>
                  </div>
                </div>
                <div className={`rounded-full p-3 ${index === 0 ? 'bg-blue-50' : index === 1 ? 'bg-purple-50' : index === 2 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                  <div className={`${index === 0 ? 'text-blue-600' : index === 1 ? 'text-purple-600' : index === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button className="text-xs text-[#1b4965] font-medium hover:underline">
                  View Report
                </button>
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Charts and Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Revenue</h2>
                <p className="text-sm text-gray-500 mt-1">Projects & Rentals Performance</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${period === 'week' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setPeriod('week')}
                >
                  Week
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${period === 'month' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setPeriod('month')}
                >
                  Month
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${period === 'year' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setPeriod('year')}
                >
                  Year
                </button>
              </div>
            </div>
            
            <BarChart data={monthlyData} />
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">$14,324</p>
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <RiArrowUpLine className="mr-1" />
                  +10% from last period
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
                <p className="text-sm text-gray-500 mt-1">Latest updates</p>
              </div>
              <div className="flex items-center">
                <button className="text-sm text-[#1b4965] hover:underline">
                  View All
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[#1b4965] font-medium">
                      {activity.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{activity.user}</p>
                      <p className="text-xs text-gray-500">{activity.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="w-full py-2 bg-gray-50 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                Load More
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Projects Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Projects Overview</h2>
              <p className="text-sm text-gray-500 mt-1">All projects status</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1b4965] rounded-lg text-white text-sm hover:bg-[#0d3b59] transition-colors">
                <RiFileChartLine /> Generate Report
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 bg-gray-50">Project Name</th>
                  <th className="px-4 py-3 bg-gray-50">Client</th>
                  <th className="px-4 py-3 bg-gray-50">Status</th>
                  <th className="px-4 py-3 bg-gray-50">Supervisor</th>
                  <th className="px-4 py-3 bg-gray-50">Deadline</th>
                  <th className="px-4 py-3 bg-gray-50">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">Skyline Apartments</div>
                    <div className="text-xs text-gray-500">#PRJ-001</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">Acme Corporation</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Progress</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">John Smith</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm flex items-center">
                      <RiCalendarLine className="mr-1 text-gray-400" /> Dec 15, 2023
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">$245,000</div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">Riverside Villas</div>
                    <div className="text-xs text-gray-500">#PRJ-002</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">Global Estates</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">Sarah Johnson</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm flex items-center">
                      <RiCalendarLine className="mr-1 text-gray-400" /> Nov 30, 2023
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">$180,000</div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">Sunset Heights</div>
                    <div className="text-xs text-gray-500">#PRJ-003</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">Prestige Homes</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Planning</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">Michael Brown</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm flex items-center">
                      <RiCalendarLine className="mr-1 text-gray-400" /> Jan 20, 2024
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">$320,000</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing 3 of 24 projects
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1 bg-[#1b4965] text-white rounded-md text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded-md text-sm">
                2
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded-md text-sm">
                3
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded-md text-sm">
                Next
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
