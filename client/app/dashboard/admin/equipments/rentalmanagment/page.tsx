'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiEyeLine,
  RiSearchLine,
  RiFilter3Line,
  RiCalendarEventLine,
  RiToolsLine,
  RiFileListLine,
  RiMoneyDollarCircleLine,
  RiTimeLine,
} from 'react-icons/ri';
import { FiClock, FiDollarSign, FiUser } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/useAuthStore';

interface Rental {
  id: string;
  equipment: string;
  equipmentImage: string;
  project: string;
  customer: string;
  customerEmail: string;
  status: 'Pending' | 'Approved' | 'Booked' | 'Completed';
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
  handedOver: boolean;
  payment: {
    paid: boolean;
    amount: number;
    method: string;
    dueDate: string;
  };
  createdAt: string;
}

const mockRentals: Rental[] = [
  {
    id: '1',
    equipment: 'Excavator CAT 320D',
    equipmentImage: '/assets/images/cmixer.jpg',
    project: 'High-Rise Apartment Complex',
    customer: 'John Smith',
    customerEmail: 'john.smith@example.com',
    status: 'Pending',
    startDate: '2024-06-10',
    endDate: '2024-06-15',
    dailyRate: 500,
    totalAmount: 2500,
    handedOver: false,
    payment: { paid: false, amount: 2500, method: 'Bank Transfer', dueDate: '2024-06-09' },
    createdAt: '2024-06-05',
  },
  {
    id: '2',
    equipment: 'Concrete Mixer',
    equipmentImage: '/assets/images/cmixer.jpg',
    project: 'Commercial Office Building',
    customer: 'Sarah Johnson',
    customerEmail: 'sarah.j@company.com',
    status: 'Approved',
    startDate: '2024-06-12',
    endDate: '2024-06-18',
    dailyRate: 150,
    totalAmount: 900,
    handedOver: false,
    payment: { paid: false, amount: 900, method: 'Cash', dueDate: '2024-06-11' },
    createdAt: '2024-06-06',
  },
  {
    id: '3',
    equipment: 'Power Drill Set',
    equipmentImage: '/assets/images/cmixer.jpg',
    project: 'Residential Housing Development',
    customer: 'Mike Wilson',
    customerEmail: 'mike.w@builders.com',
    status: 'Booked',
    startDate: '2024-06-20',
    endDate: '2024-06-22',
    dailyRate: 45,
    totalAmount: 90,
    handedOver: true,
    payment: { paid: true, amount: 90, method: 'Card', dueDate: '2024-06-19' },
    createdAt: '2024-06-15',
  },
  {
    id: '4',
    equipment: 'Lawn Mower',
    equipmentImage: '/assets/images/cmixer.jpg',
    project: 'Landscaping Project',
    customer: 'Emma Davis',
    customerEmail: 'emma.davis@landscape.com',
    status: 'Completed',
    startDate: '2024-05-01',
    endDate: '2024-05-05',
    dailyRate: 75,
    totalAmount: 375,
    handedOver: true,
    payment: { paid: true, amount: 375, method: 'Bank Transfer', dueDate: '2024-04-30' },
    createdAt: '2024-04-25',
  },
];

const statusTabs = [
  { key: 'All', label: 'All Rentals', count: mockRentals.length },
  { key: 'Pending', label: 'Pending', count: mockRentals.filter(r => r.status === 'Pending').length },
  { key: 'Approved', label: 'Approved', count: mockRentals.filter(r => r.status === 'Approved').length },
  { key: 'Booked', label: 'Booked', count: mockRentals.filter(r => r.status === 'Booked').length },
  { key: 'Completed', label: 'Completed', count: mockRentals.filter(r => r.status === 'Completed').length },
];

export default function RentalsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>(mockRentals);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }
  }, [token, router]);

  // Filter rentals based on active tab and search term
  useEffect(() => {
    let result = [...mockRentals];
    
    if (activeTab !== 'All') {
      result = result.filter(rental => rental.status === activeTab);
    }
    
    if (searchTerm) {
      result = result.filter(rental => 
        rental.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRentals(result);
  }, [activeTab, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Booked':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewRental = (rentalId: string) => {
    router.push(`/dashboard/admin/equipments/rentalmanagment/${rentalId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#1b4965] bg-clip-text text-transparent">
            Rental Management
          </h1>
          <p className="text-slate-600 mt-1">Monitor and manage equipment rental requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Rentals</p>
              <p className="text-2xl font-bold text-slate-900">{mockRentals.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <RiFileListLine className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Approval</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockRentals.filter(r => r.status === 'Pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <RiTimeLine className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Rentals</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockRentals.filter(r => r.status === 'Booked').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <RiToolsLine className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Revenue</p>
              <p className="text-2xl font-bold text-slate-900">
                ${mockRentals.filter(r => r.payment.paid).reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <RiMoneyDollarCircleLine className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-500 to-[#1b4965] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by equipment, project, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Rentals Grid */}
      <div className="space-y-4">
        {filteredRentals.length > 0 ? (
          filteredRentals.map((rental, index) => (
            <motion.div
              key={rental.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left Section - Equipment & Project Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={rental.equipmentImage}
                        alt={rental.equipment}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg">{rental.equipment}</h3>
                          <p className="text-slate-600 text-sm">{rental.project}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(rental.status)}`}>
                          {rental.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Customer</p>
                            <p className="text-sm font-medium text-slate-900">{rental.customer}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <RiCalendarEventLine className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Duration</p>
                            <p className="text-sm font-medium text-slate-900">
                              {rental.startDate} - {rental.endDate}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Total Amount</p>
                            <p className="text-sm font-medium text-slate-900">${rental.totalAmount}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">
                              {rental.status === 'Booked' ? 'Days Remaining' : 
                               rental.status === 'Completed' ? 'Completed' : 'Starts In'}
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                              {rental.status === 'Completed' 
                                ? 'Done' 
                                : `${calculateDaysRemaining(rental.status === 'Booked' ? rental.endDate : rental.startDate)} days`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Section - Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewRental(rental.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View details"
                      aria-label="View rental details"
                    >
                      <RiEyeLine className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-12 text-center border border-slate-200"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <RiFileListLine className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No rentals found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {searchTerm 
                ? 'No rentals match your current search criteria. Try adjusting your filters.' 
                : `No ${activeTab.toLowerCase()} rentals available.`}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 