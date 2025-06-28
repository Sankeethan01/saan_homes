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

// Type definitions
interface StatItem {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  subtext: string;
  icon: React.ReactNode;
}

interface ActivityItem {
  user: string;
  email: string;
  status: string;
  id: string;
  date: string;
  amount: string;
}

interface ChartDataItem {
  month: string;
  projects: number;
  rentals: number;
}

// Sample data for dashboard
const stats: StatItem[] = [
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
const recentActivity: ActivityItem[] = [
  { user: 'John Smith', email: 'john.smith@example.com', status: 'Approved', id: '#329341', date: '49 min ago', amount: '$738.61' },
  { user: 'Sarah Johnson', email: 'sarah.j@example.com', status: 'Pending', id: '#329342', date: '27 min ago', amount: '$108.16' },
  { user: 'Michael Brown', email: 'mbrown@example.com', status: 'Completed', id: '#329343', date: '40 min ago', amount: '$1,279.80' },
  { user: 'Emma Wilson', email: 'emma.w@example.com', status: 'In Progress', id: '#329344', date: '36 min ago', amount: '$327.86' },
  { user: 'James Davis', email: 'james.d@example.com', status: 'Cancelled', id: '#329345', date: '15 min ago', amount: '$566.12' },
];

// Monthly data for chart
const monthlyData: ChartDataItem[] = [
  { month: 'Jan', projects: 12, rentals: 8 },
  { month: 'Feb', projects: 15, rentals: 10 },
  { month: 'Mar', projects: 18, rentals: 14 },
  { month: 'Apr', projects: 22, rentals: 16 },
  { month: 'May', projects: 27, rentals: 18 },
  { month: 'Jun', projects: 32, rentals: 22 },
];

function BarChart({ data }: { data: ChartDataItem[] }) {
  const maxProjects = Math.max(...data.map(d => d.projects));
  const maxRentals = Math.max(...data.map(d => d.rentals));
  const maxValue = Math.max(maxProjects, maxRentals);

  // Create height classes dynamically
  const getHeightClass = (value: number) => {
    const percentage = Math.round((value / maxValue) * 100);
    return `h-[${percentage}%]`;
  };

  return (
    <div className="mt-4">
      <div className="flex items-end h-[200px] gap-8">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center gap-1 h-full">
              <div 
                className={`w-5 rounded-t-md bg-[#1b4965] ${getHeightClass(item.projects)}`}
                title={`Projects: ${item.projects}`}
              ></div>
              <div 
                className={`w-5 rounded-t-md bg-[#5fa8d3] ${getHeightClass(item.rentals)}`}
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

function getStatusColor(status: string): string {
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
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

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
          {/* Enhanced Revenue Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-[#1b4965] to-[#5fa8d3] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Revenue Analytics</h2>
                  <p className="text-blue-100 mt-1">Projects & Equipment Rentals Performance</p>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-1">
                  <button 
                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                      period === 'week' 
                        ? 'bg-white text-[#1b4965] shadow-sm font-medium' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setPeriod('week')}
                  >
                    Week
                  </button>
                  <button 
                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                      period === 'month' 
                        ? 'bg-white text-[#1b4965] shadow-sm font-medium' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setPeriod('month')}
                  >
                    Month
                  </button>
                  <button 
                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                      period === 'year' 
                        ? 'bg-white text-[#1b4965] shadow-sm font-medium' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setPeriod('year')}
                  >
                    Year
                  </button>
                </div>
              </div>
              
              {/* Quick stats in header */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-blue-100 text-xs font-medium">Total Projects</p>
                  <p className="text-white text-lg font-bold">127</p>
                  <div className="flex items-center text-green-300 text-xs mt-1">
                    <RiArrowUpLine className="mr-1" />
                    +8.2%
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-blue-100 text-xs font-medium">Equipment Rented</p>
                  <p className="text-white text-lg font-bold">1,247</p>
                  <div className="flex items-center text-green-300 text-xs mt-1">
                    <RiArrowUpLine className="mr-1" />
                    +12.5%
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-blue-100 text-xs font-medium">Avg. Project Value</p>
                  <p className="text-white text-lg font-bold">$185K</p>
                  <div className="flex items-center text-green-300 text-xs mt-1">
                    <RiArrowUpLine className="mr-1" />
                    +5.7%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chart Section */}
            <div className="p-6">
              <BarChart data={monthlyData} />
            </div>
            
            {/* Enhanced Bottom Analytics */}
            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">Revenue Breakdown</h3>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">This Month</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#1b4965] rounded-full"></div>
                          <span className="text-sm text-gray-600">Construction Projects</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800">$23,456</p>
                          <p className="text-xs text-green-600">+15.2%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#5fa8d3] rounded-full"></div>
                          <span className="text-sm text-gray-600">Equipment Rentals</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800">$18,924</p>
                          <p className="text-xs text-green-600">+8.7%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm font-semibold text-gray-800">Total Revenue</span>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#1b4965]">$42,380</p>
                          <p className="text-xs text-green-600">+12.1% vs last month</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">Performance Metrics</h3>
                      <button className="text-xs text-[#1b4965] hover:underline">View Details</button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Project Completion Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Equipment Utilization</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-[92%] h-full bg-blue-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">92%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Client Satisfaction</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-[96%] h-full bg-yellow-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">96%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm font-semibold text-gray-800">Overall Score</span>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-[#1b4965]">91%</span>
                          <div className="flex items-center text-green-600 text-xs">
                            <RiArrowUpLine className="w-3 h-3" />
                            +3%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RiCalendarLine className="w-4 h-4" />
                    Last updated: 2 hours ago
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <RiDownloadLine className="w-4 h-4" />
                      Export
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-[#1b4965] rounded-lg hover:bg-[#0d3b59] transition-colors">
                      <RiFileChartLine className="w-4 h-4" />
                      Full Report
                    </button>
                  </div>
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
