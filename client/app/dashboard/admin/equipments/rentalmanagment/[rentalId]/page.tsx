'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  RiArrowLeftLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiToolsLine,
  RiUserLine,
  RiMailLine,
  RiAlertLine,
  RiTruckLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri';
import { FiDollarSign, FiCalendar, FiCheck, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/app/stores/useAuthStore';
import toast, { Toaster } from 'react-hot-toast';

interface Booking {
  id: string;
  equipment: {
    id: string;
    name: string;
    image: string;
    daily_rate: number;
  };
  equipment_name: string;
  equipment_image: string;
  equipment_daily_rate: number;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  user_name: string;
  user_email: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'RENTED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  notes: string;
  total_cost: number;
  duration: number;
  created: string;
}

// API utility function
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };
  
  const response = await fetch(url, config);

  if (!response.ok) {
    // Try to parse error as JSON
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
    } catch {
      errorMessage = `HTTP error! status: ${response.status}. ${errorText}`;
    }
    throw new Error(errorMessage);
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

  const fetchBookingDetails = useCallback(async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      const data = await fetchWithAuth(`${API_BASE_URL}/equipments/bookings/${params.rentalId}/`);
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [params.rentalId]);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    fetchBookingDetails();
  }, [params.rentalId, token, router, fetchBookingDetails]);

  const formatCurrency = (amount: number | string) => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return 'LKR 0.00';
    }
    return `LKR ${Number(amount).toFixed(2)}`;
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/assets/images/equipments/excavator.jpeg';
    if (imageUrl.startsWith('http')) return imageUrl;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${imageUrl}`;
  };

  const handleApproveRental = async () => {
    if (!booking) return;
    
    const loadingToast = toast.loading('Approving rental...');
    setActionLoading(true);
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      // Use the dedicated approve endpoint
      const updatedBooking = await fetchWithAuth(
        `${API_BASE_URL}/equipments/bookings/${params.rentalId}/approve/`,
        {
          method: 'PATCH'
        }
      );
      
      // Update the local state with the updated booking
      setBooking(updatedBooking);
      
      toast.dismiss(loadingToast);
      toast.success(updatedBooking.message || 'Rental approved successfully!');
    } catch (err) {
      console.error('Error approving rental:', err);
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : 'Failed to approve rental. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRental = async () => {
    if (!booking) return;
    
    const loadingToast = toast.loading('Rejecting rental...');
    setActionLoading(true);
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      // Use the dedicated reject endpoint
      const updatedBooking = await fetchWithAuth(
        `${API_BASE_URL}/equipments/bookings/${params.rentalId}/reject/`,
        {
          method: 'PATCH'
        }
      );
      
      // Update the local state with the updated booking
      setBooking(updatedBooking);
      
      toast.dismiss(loadingToast);
      toast.success(updatedBooking.message || 'Rental rejected successfully!');
    } catch (err) {
      console.error('Error rejecting rental:', err);
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : 'Failed to reject rental. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsRented = async () => {
    if (!booking) return;
    
    const loadingToast = toast.loading('Marking as rented...');
    setActionLoading(true);
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      // Use the dedicated mark_rented endpoint
      const updatedBooking = await fetchWithAuth(
        `${API_BASE_URL}/equipments/bookings/${params.rentalId}/mark_rented/`,
        {
          method: 'PATCH'
        }
      );
      
      // Update the local state with the updated booking
      setBooking(updatedBooking);
      
      toast.dismiss(loadingToast);
      toast.success(updatedBooking.message || 'Rental marked as rented successfully!');
    } catch (err) {
      console.error('Error marking rental as rented:', err);
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : 'Failed to update rental status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!booking) return;
    
    const loadingToast = toast.loading('Marking as completed...');
    setActionLoading(true);
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      // Use the dedicated complete endpoint
      const updatedBooking = await fetchWithAuth(
        `${API_BASE_URL}/equipments/bookings/${params.rentalId}/complete/`,
        {
          method: 'PATCH'
        }
      );
      
      // Update the local state with the updated booking
      setBooking(updatedBooking);
      
      toast.dismiss(loadingToast);
      toast.success(updatedBooking.message || 'Rental marked as completed successfully!');
    } catch (err) {
      console.error('Error marking rental as completed:', err);
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : 'Failed to update rental status. Please try again.');
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RENTED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      {/* Toast notifications */}
      <Toaster position="top-right" />
      
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
          <h1 className="text-2xl font-bold bg-[#1b4965] bg-clip-text text-transparent">
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
                  src={getImageUrl(booking.equipment_image || booking.equipment?.image)}
                  alt={booking.equipment_name || booking.equipment?.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/equipments/excavator.jpeg';
                  }}
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{booking.equipment_name || booking.equipment?.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Daily Rate</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(booking.equipment_daily_rate || booking.equipment?.daily_rate)}/day</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(booking.total_cost)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Rental Period</p>
                <p className="font-semibold text-slate-900">
                  {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Duration</p>
                <p className="font-semibold text-slate-900">{booking.duration} days</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Time Remaining</p>
                <p className="font-semibold text-slate-900">
                  {booking.status === 'PAID' 
                    ? `${calculateDaysRemaining(booking.end_date)} days until return`
                    : `${calculateDaysRemaining(booking.start_date)} days`}
                </p>
              </div>
              
              {booking.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Project Description</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{booking.notes}</p>
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
                  {booking.status === 'PAID' ? (
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
                <p className="font-semibold text-slate-900">{formatCurrency(booking.total_cost)}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Duration</p>
                <p className="font-semibold text-slate-900">{booking.duration} days</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Daily Rate</p>
                <p className="font-semibold text-slate-900">{formatCurrency(booking.equipment_daily_rate || booking.equipment?.daily_rate)}/day</p>
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
              <div className="flex items-center gap-3">
                <RiUserLine className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Customer Name</p>
                  <p className="font-semibold text-slate-900">{booking.user_name || `${booking.user?.first_name || ''} ${booking.user?.last_name || ''}`}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <RiMailLine className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-semibold text-slate-900">{booking.user_email || booking.user?.email}</p>
                </div>
              </div>
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
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiDollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-slate-600 mb-4">Payment received. Equipment ready for pickup/delivery.</p>
                </div>
                <button
                  onClick={handleMarkAsRented}
                  disabled={actionLoading}
                  className="w-full px-4 py-3 bg-[#1b4965] text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RiTruckLine className="w-5 h-5" />
                  {actionLoading ? 'Updating...' : 'Mark as Rented (Equipment Handed Over)'}
                </button>
              </div>
            )}
            
            {booking.status === 'RENTED' && (
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RiTruckLine className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-slate-600 mb-4">Equipment is currently rented out.</p>
                </div>
                <button
                  onClick={handleMarkAsCompleted}
                  disabled={actionLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RiCheckboxCircleLine className="w-5 h-5" />
                  {actionLoading ? 'Updating...' : 'Mark as Completed (Equipment Returned)'}
                </button>
              </div>
            )}
            
            {booking.status === 'COMPLETED' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RiCheckboxCircleLine className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-slate-600 mb-4">Rental completed successfully. Equipment has been returned.</p>
              </div>
            )}
            
            {booking.status === 'REJECTED' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiX className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-slate-600 mb-4">Rental has been rejected.</p>
              </div>
            )}
            
            {booking.status === 'CANCELLED' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RiCloseLine className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-slate-600 mb-4">Rental has been cancelled by the customer.</p>
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
                  <div className={`w-3 h-3 rounded-full ${booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? 'bg-red-600' : 'bg-green-600'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {booking.status === 'CANCELLED' ? 'Cancelled' : 
                       booking.status === 'REJECTED' ? 'Rejected' : 'Approved'}
                    </p>
                    <p className="text-xs text-slate-500">Status updated</p>
                  </div>
                </div>
              )}
              
              {(booking.status === 'PAID' || booking.status === 'RENTED' || booking.status === 'COMPLETED') && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Payment Received</p>
                    <p className="text-xs text-slate-500">Customer paid</p>
                  </div>
                </div>
              )}

              {(booking.status === 'RENTED' || booking.status === 'COMPLETED') && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Equipment Handed Over</p>
                    <p className="text-xs text-slate-500">Customer received equipment</p>
                  </div>
                </div>
              )}

              {booking.status === 'COMPLETED' && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
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