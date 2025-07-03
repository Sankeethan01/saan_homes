'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { 
  RiArrowUpSLine, 
  RiArrowDownSLine, 
  RiBankCardLine, 
  RiTruckLine, 
  RiCheckDoubleLine, 
  RiFileList2Line,
  RiLoader4Line
} from 'react-icons/ri';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { useTheme } from './layout';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
);

interface RentalSummary {
  totalSpent: number;
  activeRentals: number;
  completedRentals: number;
  totalRentals: number;
}

export default function MePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rentalSummary, setRentalSummary] = useState<RentalSummary>({
    totalSpent: 0,
    activeRentals: 0,
    completedRentals: 0,
    totalRentals: 0
  });
  
  // Monthly data for charts
  const [monthlySpending, setMonthlySpending] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [0, 0, 0, 0, 0, 0],
  });
  
  const [rentalActivity, setRentalActivity] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [0, 0, 0, 0, 0, 0],
  });

  useEffect(() => {
    if (!token) {
      router.push('/dashboard/login');
      return;
    }
    
    fetchDashboardData();
  }, [token, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        // Mock data
        setRentalSummary({
          totalSpent: 10650,
          activeRentals: 1,
          completedRentals: 2,
          totalRentals: 3
        });
        
        setMonthlySpending({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [1200, 1900, 3000, 5000, 2300, 3200],
        });
        
        setRentalActivity({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [2, 3, 5, 8, 4, 6],
        });
        
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const chartOptions = (isDark: boolean) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#d1d5db' : '#374151',
          boxWidth: 12,
          padding: 15
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#111827',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
        },
        grid: {
          color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
        },
        grid: {
          color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
          drawBorder: false,
        },
        beginAtZero: true,
      },
    },
  });

  const lineChartData = {
    labels: monthlySpending.labels,
    datasets: [
      {
        label: 'Monthly Spending (LKR)',
        data: monthlySpending.data,
        fill: true,
        backgroundColor: 'rgba(27, 73, 101, 0.2)',
        borderColor: '#1b4965',
        tension: 0.4,
        pointBackgroundColor: '#1b4965',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const barChartData = {
    labels: rentalActivity.labels,
    datasets: [
      {
        label: 'Rental Activity',
        data: rentalActivity.data,
        backgroundColor: '#5fa8d3',
        borderColor: '#1b4965',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const StatCard = ({ icon, title, value, change, isPositive }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h3 className="text-gray-600 font-medium">{title}</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      {change && (
        <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <RiArrowUpSLine className="text-xl" /> : <RiArrowDownSLine className="text-xl" />}
          <span>{change}%</span>
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RiLoader4Line className="text-6xl text-[#1b4965] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1b4965] mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we prepare your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="text-5xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-[#1b4965] text-white px-6 py-3 rounded-lg hover:bg-[#0d3b59] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#1b4965] text-white p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username || 'User'}! 🎉</h1>
        <p className="text-blue-100">
          {rentalSummary.totalRentals > 0 
            ? `You have ${rentalSummary.activeRentals} active rental${rentalSummary.activeRentals !== 1 ? 's' : ''} and have completed ${rentalSummary.completedRentals} rental${rentalSummary.completedRentals !== 1 ? 's' : ''} so far.`
            : 'Browse our equipment catalog to start your first rental!'}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<RiBankCardLine className="text-blue-500 text-2xl" />} 
          title="Total Spent" 
          value={`LKR ${rentalSummary.totalSpent.toLocaleString()}`} 
          change={12.5} 
          isPositive 
        />
        <StatCard 
          icon={<RiTruckLine className="text-green-500 text-2xl" />} 
          title="Active Rentals" 
          value={rentalSummary.activeRentals} 
        />
        <StatCard 
          icon={<RiCheckDoubleLine className="text-purple-500 text-2xl" />} 
          title="Completed Rentals" 
          value={rentalSummary.completedRentals} 
        />
        <StatCard 
          icon={<RiFileList2Line className="text-yellow-500 text-2xl" />} 
          title="Total Rentals" 
          value={rentalSummary.totalRentals} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6 }} 
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Spending</h2>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions(isDark)} />
          </div>
        </motion.div>

        {/* Rental Activity Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6 }} 
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Rental Activity</h2>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions(isDark)} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
