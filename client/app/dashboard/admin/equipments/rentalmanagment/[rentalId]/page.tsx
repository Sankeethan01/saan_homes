'use client';

import { useState, useEffect } from 'react';
import {
  RiArrowLeftLine,
  RiCalendarEventLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiToolsLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiAlertLine,
} from 'react-icons/ri';
import { FiDollarSign, FiCalendar, FiCheck, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/app/stores/useAuthStore';

interface Booking {
  id: string;
  equipment: number;
  equipment_name: string;
  equipment_image: string;
  equipment_daily_rate: string;
  user: number;
  user_name: string;
  user_email: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED' | 'COMPLETED';
  start_date: string;
  end_date: string;
  project_name: string;
  project_description: string;
  delivery_address: string;
  delivery_required: boolean;
  safety_requirements: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  total_cost: string;
  duration: number;
  created: string;
}

// API utility function
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    fetchBookingDetails();
  }, [params.rentalId, token, router]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`http://localhost:8000/api/equipments/bookings/${params.rentalId}/`);
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRental = async () => {
    if (!booking) return;
    setActionLoading(true);
    
    try {
      const updatedBooking = await fetchWithAuth(
        `http://localhost:8000/api/equipments/bookings/${params.rentalId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'APPROVED' }),
        }
      );
      
      setBooking(updatedBooking);
      alert('Rental approved successfully!');
    } catch (err) {
      console.error('Error approving rental:', err);
      alert('Error approving rental. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRental = async () => {
    if (!booking) return;
    setActionLoading(true);
    
    try {
      await fetchWithAuth(
        `http://localhost:8000/api/equipments/bookings/${params.rentalId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'CANCELLED' }),
        }
      );
      
      alert('Rental rejected successfully!');
      router.back();
    } catch (err) {
      console.error('Error rejecting rental:', err);
      alert('Error rejecting rental. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAID':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-6 px-4 py-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <RiAlertLine className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Rental not found</h3>
          <p className="text-slate-500 mb-6">The rental you&rsquo;re looking for doesn&rsquo;t exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Go back"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#1b4965] bg-clip-text text-transparent">
            Rental Details
          </h1>
          <p className="text-slate-600 mt-1">Manage rental request #{booking.id}</p>
        </div>
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equipment Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <RiToolsLine className="w-5 h-5 text-blue-600" />
              Equipment Information
            </h2>
            
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={booking.equipment_image || '/assets/images/cmixer.jpg'}
                  alt={booking.equipment_name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{booking.equipment_name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Daily Rate</p>
                    <p className="font-semibold text-slate-900">${booking.equipment_daily_rate}/day</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="font-semibold text-slate-900">${booking.total_cost}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <RiCalendarEventLine className="w-5 h-5 text-blue-600" />
              Rental Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Project</p>
                <p className="font-semibold text-slate-900">{booking.project_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Rental Period</p>
                <p className="font-semibold text-slate-900">{booking.start_date} to {booking.end_date}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Duration</p>
                <p className="font-semibold text-slate-900">
                  {booking.duration} days
                </p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {booking.status === 'PAID' ? 'Days Remaining' : 
                   booking.status === 'COMPLETED' ? 'Completed' : 'Starts In'}
                </p>
                <p className="font-semibold text-slate-900">
                  {booking.status === 'COMPLETED' 
                    ? 'Project finished' 
                    : `${calculateDaysRemaining(booking.status === 'PAID' ? booking.end_date : booking.start_date)} days`}
                </p>
              </div>
              
              {booking.delivery_address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Delivery Address</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <RiMapPinLine className="w-4 h-4 text-slate-400" />
                    {booking.delivery_address}
                  </p>
                </div>
              )}
              
              {booking.project_description && (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Project Description</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{booking.project_description}</p>
                </div>
              )}

              {booking.safety_requirements && (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Safety Requirements</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{booking.safety_requirements}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <RiMoneyDollarCircleLine className="w-5 h-5 text-blue-600" />
              Payment Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Payment Status</p>
                <div className="flex items-center gap-2">
                  {booking.status === 'PAID' || booking.status === 'COMPLETED' ? (
                    <>
                      <FiCheck className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">Paid</span>
                    </>
                  ) : (
                    <>
                      <FiX className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-red-600">Not Paid</span>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                <p className="font-semibold text-slate-900">${booking.total_cost}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Duration</p>
                <p className="font-semibold text-slate-900">{booking.duration} days</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Daily Rate</p>
                <p className="font-semibold text-slate-900">${booking.equipment_daily_rate}/day</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <RiUserLine className="w-5 h-5 text-blue-600" />
              Customer Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Name</p>
                <p className="font-semibold text-slate-900">{booking.user_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <a 
                  href={`mailto:${booking.user_email}`}
                  className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  <RiMailLine className="w-4 h-4" />
                  {booking.user_email}
                </a>
              </div>
              
              {booking.emergency_contact_name && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Emergency Contact</p>
                  <p className="font-semibold text-slate-900">{booking.emergency_contact_name}</p>
                  {booking.emergency_contact_phone && (
                    <a 
                      href={`tel:${booking.emergency_contact_phone}`}
                      className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2 mt-1"
                    >
                      <RiPhoneLine className="w-4 h-4" />
                      {booking.emergency_contact_phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions based on status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions</h2>
            
            {booking.status === 'PENDING' && (
              <div className="space-y-3">
                <button
                  onClick={handleApproveRental}
                  disabled={actionLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RiCheckLine className="w-5 h-5" />
                  {actionLoading ? 'Approving...' : 'Approve Rental'}
                </button>
                <button
                  onClick={handleRejectRental}
                  disabled={actionLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RiCloseLine className="w-5 h-5" />
                  {actionLoading ? 'Rejecting...' : 'Reject Rental'}
                </button>
              </div>
            )}
            
            {booking.status === 'APPROVED' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCalendar className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-slate-600 mb-4">Rental has been approved. Waiting for customer payment.</p>
              </div>
            )}
            
            {booking.status === 'PAID' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiDollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-slate-600 mb-4">Payment received. Equipment ready for pickup/delivery.</p>
              </div>
            )}
            
            {booking.status === 'COMPLETED' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-slate-600 mb-4">Rental completed successfully.</p>
              </div>
            )}
            
            {booking.status === 'CANCELLED' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RiCloseLine className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-slate-600 mb-4">Rental has been cancelled.</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <RiTimeLine className="w-5 h-5 text-blue-600" />
              Timeline
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Booking Created</p>
                  <p className="text-xs text-slate-500">{new Date(booking.created).toLocaleDateString()}</p>
                </div>
              </div>
              
              {booking.status !== 'PENDING' && (
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${booking.status === 'CANCELLED' ? 'bg-red-600' : 'bg-green-600'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {booking.status === 'CANCELLED' ? 'Cancelled' : 'Approved'}
                    </p>
                    <p className="text-xs text-slate-500">Status updated</p>
                  </div>
                </div>
              )}
              
              {(booking.status === 'PAID' || booking.status === 'COMPLETED') && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Payment Received</p>
                    <p className="text-xs text-slate-500">Customer paid</p>
                  </div>
                </div>
              )}
              
              {booking.status === 'COMPLETED' && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Rental Completed</p>
                    <p className="text-xs text-slate-500">Equipment returned</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 