'use client';

import { motion } from 'framer-motion';
import { RiArrowUpSLine, RiArrowDownSLine, RiBankCardLine, RiTruckLine, RiCheckDoubleLine, RiFileList2Line } from 'react-icons/ri';
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

// Mock Data
const rentalSummary = {
    totalSpent: 10650,
    activeRentals: 1,
    completedRentals: 1,
    totalRentals: 2,
};

const monthlySpending = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [1200, 1900, 3000, 5000, 2300, 3200],
};

const rentalActivity = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [2, 3, 5, 8, 4, 6],
};

const chartOptions = (isDark: boolean) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: {
                color: isDark ? '#d1d5db' : '#374151',
            },
        },
        title: {
            display: false,
        },
    },
    scales: {
        x: {
            ticks: {
                color: isDark ? '#9ca3af' : '#6b7280',
            },
            grid: {
                color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
            },
        },
        y: {
            ticks: {
                color: isDark ? '#9ca3af' : '#6b7280',
            },
            grid: {
                color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
            },
        },
    },
});

export default function MePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const lineChartData = {
        labels: monthlySpending.labels,
        datasets: [
            {
                label: 'Monthly Spending',
                data: monthlySpending.data,
                fill: true,
                backgroundColor: 'rgba(105, 108, 255, 0.2)',
                borderColor: 'rgba(105, 108, 255, 1)',
                tension: 0.4,
            },
        ],
    };

    const barChartData = {
        labels: rentalActivity.labels,
        datasets: [
            {
                label: 'Rental Activity',
                data: rentalActivity.data,
                backgroundColor: isDark ? 'rgba(133, 146, 163, 0.6)' : 'rgba(133, 146, 163, 0.8)',
                borderColor: isDark ? 'rgba(133, 146, 163, 1)' : 'rgba(133, 146, 163, 1)',
                borderWidth: 1,
            },
        ],
    };

    const StatCard = ({ icon, title, value, change, isPositive }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[var(--card-bg-color)] p-6 rounded-xl shadow-md flex items-center justify-between"
        >
            <div>
                <div className="flex items-center gap-2 mb-1">
                    {icon}
                    <h3 className="text-[var(--secondary-color)] font-medium">{title}</h3>
                </div>
                <p className="text-3xl font-bold text-[var(--heading-color)]">{value}</p>
            </div>
            {change && (
                <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                    <span>{change}%</span>
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-[var(--primary-color)] to-indigo-600 text-white p-8 rounded-xl shadow-lg"
            >
                <h1 className="text-3xl font-bold mb-2">Congratulations, John! 🎉</h1>
                <p className="text-indigo-100">You have completed 72% more rentals this month. Check your new raising badge in your profile.</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<RiBankCardLine className="text-blue-500 text-2xl" />} title="Total Spent" value={`LKR ${rentalSummary.totalSpent.toLocaleString()}`} change={12.5} isPositive />
                <StatCard icon={<RiTruckLine className="text-green-500 text-2xl" />} title="Active Rentals" value={rentalSummary.activeRentals} />
                <StatCard icon={<RiCheckDoubleLine className="text-purple-500 text-2xl" />} title="Completed Rentals" value={rentalSummary.completedRentals} />
                <StatCard icon={<RiFileList2Line className="text-yellow-500 text-2xl" />} title="Total Rentals" value={rentalSummary.totalRentals} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Spending Chart */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="bg-[var(--card-bg-color)] p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-[var(--heading-color)]">Monthly Spending</h2>
                    <div className="h-64">
                        <Line data={lineChartData} options={chartOptions(isDark)} />
                    </div>
                </motion.div>

                {/* Rental Activity Chart */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="bg-[var(--card-bg-color)] p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-[var(--heading-color)]">Rental Activity</h2>
                    <div className="h-64">
                        <Bar data={barChartData} options={chartOptions(isDark)} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
