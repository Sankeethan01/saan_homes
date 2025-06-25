'use client';

import { motion } from 'framer-motion';
import { RiTeamLine, RiToolsLine, RiHomeGearLine, RiMoneyDollarCircleLine } from 'react-icons/ri';

const stats = [
  { label: 'Projects', value: 12, icon: <RiHomeGearLine className="text-blue-400 w-6 h-6" /> },
  { label: 'Active Rentals', value: 7, icon: <RiToolsLine className="text-purple-400 w-6 h-6" /> },
  { label: 'Equipments', value: 24, icon: <RiToolsLine className="text-green-400 w-6 h-6" /> },
  { label: 'Supervisors', value: 5, icon: <RiTeamLine className="text-yellow-400 w-6 h-6" /> },
  { label: 'Revenue', value: '$42,000', icon: <RiMoneyDollarCircleLine className="text-pink-400 w-6 h-6" /> },
];

const projectStatus = [
  { label: 'In Progress', value: 6, color: '#60a5fa' },
  { label: 'Completed', value: 4, color: '#34d399' },
  { label: 'Planning', value: 2, color: '#a78bfa' },
];

const rentalStatus = [
  { label: 'Pending', value: 2, color: '#fde68a' },
  { label: 'Approved', value: 1, color: '#93c5fd' },
  { label: 'Booked', value: 2, color: '#c4b5fd' },
  { label: 'Completed', value: 2, color: '#bbf7d0' },
];

const equipmentUsage = [
  { label: 'In Use', value: 10, color: '#fca5a5' },
  { label: 'Available', value: 12, color: '#a7f3d0' },
  { label: 'Maintenance', value: 2, color: '#fcd34d' },
];

function BarChart({ data, height = 120 }: { data: { label: string; value: number; color: string }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-4 h-[120px]">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center">
          <div
            className="rounded-t bg-opacity-80"
            style={{ background: d.color, height: `${(d.value / max) * height}px`, width: '24px' }}
            title={d.label}
          ></div>
          <span className="text-xs mt-1 text-gray-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function PieChart({ data, size = 120 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {data.map((d, i) => {
        const startAngle = (cumulative / total) * 2 * Math.PI;
        const endAngle = ((cumulative + d.value) / total) * 2 * Math.PI;
        const x1 = size / 2 + (size / 2 - 10) * Math.cos(startAngle);
        const y1 = size / 2 + (size / 2 - 10) * Math.sin(startAngle);
        const x2 = size / 2 + (size / 2 - 10) * Math.cos(endAngle);
        const y2 = size / 2 + (size / 2 - 10) * Math.sin(endAngle);
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        const pathData = `M${size / 2},${size / 2} L${x1},${y1} A${size / 2 - 10},${size / 2 - 10} 0 ${largeArc} 1 ${x2},${y2} Z`;
        cumulative += d.value;
        return <path key={d.label} d={pathData} fill={d.color} fillOpacity={0.8} />;
      })}
    </svg>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-800 mb-4 tracking-tight"
        >
          Admin Dashboard
        </motion.h1>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
              <div className="bg-gray-100 rounded-full p-4 flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-700">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Graphs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 flex flex-col items-center"
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Project Status</h2>
            <BarChart data={projectStatus} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 flex flex-col items-center"
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Rental Status</h2>
            <PieChart data={rentalStatus} />
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {rentalStatus.map((d) => (
                <span key={d.label} className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: d.color }}></span>
                  {d.label}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 flex flex-col items-center"
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Equipment Usage</h2>
            <PieChart data={equipmentUsage} />
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {equipmentUsage.map((d) => (
                <span key={d.label} className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: d.color }}></span>
                  {d.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
