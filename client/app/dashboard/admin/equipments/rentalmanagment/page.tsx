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
  RiCheckLine,
  RiCloseLine,
} from 'react-icons/ri';
import { FiClock, FiDollarSign, FiUser } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { fetchWithAuth } from '@/app/utils/auth';

interface Booking {
  id: string;
  equipment: {
    id: string;
    name: string;
    image: string;
    daily_rate: number;
  };
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  start_date: string;
  end_date: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';
  notes: string;
  created: string;
  duration: number;
  total_amount: number;
}

const statusTabs = [
  { key: 'All', label: 'All Bookings', count: 0 },
  { key: 'PENDING', label: 'Pending', count: 0 },
  { key: 'APPROVED', label: 'Approved', count: 0 },
  { key: 'PAID', label: 'Paid', count: 0 },
  { key: 'REJECTED', label: 'Rejected', count: 0 },
  { key: 'CANCELLED', label: 'Cancelled', count: 0 },
];

export default function RentalsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }
    fetchBookings();
  }, [token, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      const response = await fetchWithAuth(`${apiBaseUrl}/equipments/bookings/`);
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update status tabs counts
  const updateStatusTabs = () => {
    return statusTabs.map(tab => ({
      ...tab,
      count: tab.key === 'All' ? bookings.length : bookings.filter(b => b.status === tab.key).length
    }));
  };

  // Filter bookings based on active tab and search term
  useEffect(() => {
    let result = [...bookings];
    
    if (activeTab !== 'All') {
      result = result.filter(booking => booking.status === activeTab);
    }
    
    if (searchTerm) {
      result = result.filter(booking => 
        booking.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${booking.user.first_name} ${booking.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredBookings(result);
  }, [activeTab, searchTerm, bookings]);

  const handleApproveBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      const response = await fetchWithAuth(`${apiBaseUrl}/equipments/bookings/${bookingId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      if (response.ok) {
        // Update local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId ? { ...booking, status: 'APPROVED' } : booking
        ));
        alert('Booking approved successfully!');
      } else {
        alert('Failed to approve booking');
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Error approving booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      const response = await fetchWithAuth(`${apiBaseUrl}/equipments/bookings/${bookingId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      if (response.ok) {
        // Update local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId ? { ...booking, status: 'REJECTED' } : booking
        ));
        alert('Booking rejected successfully!');
      } else {
        alert('Failed to reject booking');
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Error rejecting booking');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/assets/images/equipment.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${imageUrl}`;
  };

  const handleViewBooking = (bookingId: string) => {
    router.push(`/dashboard/admin/equipments/rentalmanagment/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const updatedStatusTabs = updateStatusTabs();

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#1b4965] bg-clip-text text-transparent">
            Booking Management
          </h1>
          <p className="text-slate-600 mt-1">Monitor and manage equipment booking requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Bookings</p>
              <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
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
                {bookings.filter(b => b.status === 'PENDING').length}
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
              <p className="text-sm text-slate-600">Active Bookings</p>
              <p className="text-2xl font-bold text-slate-900">
                {bookings.filter(b => b.status === 'PAID').length}
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
                ${bookings.filter(b => b.status === 'PAID').reduce((sum, b) => sum + (b.total_amount || 0), 0).toLocaleString()}
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
          {updatedStatusTabs.map((tab) => (
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
            placeholder="Search by equipment, customer, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left Section - Equipment & Customer Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={getImageUrl(booking.equipment.image)}
                        alt={booking.equipment.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/images/equipment.png';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg">{booking.equipment.name}</h3>
                          <p className="text-slate-600 text-sm">Booking #{booking.id}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Customer</p>
                            <p className="text-sm font-medium text-slate-900">
                              {booking.user.first_name} {booking.user.last_name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <RiCalendarEventLine className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Duration</p>
                            <p className="text-sm font-medium text-slate-900">
                              {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Total Amount</p>
                            <p className="text-sm font-medium text-slate-900">
                              ${(booking.duration * booking.equipment.daily_rate).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Duration</p>
                            <p className="text-sm font-medium text-slate-900">
                              {booking.duration} days
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Section - Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApproveBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Approve booking"
                        >
                          <RiCheckLine className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRejectBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject booking"
                        >
                          <RiCloseLine className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleViewBooking(booking.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View details"
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
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {searchTerm 
                ? 'No bookings match your current search criteria. Try adjusting your filters.' 
                : `No ${activeTab.toLowerCase()} bookings available.`}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 