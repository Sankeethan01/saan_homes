'use client';

import { useEffect, useState, useCallback } from "react";
import { motion } from 'framer-motion';
import { useAuthStore } from "@/app/stores/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/auth";
import {
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiAlertLine,
  RiLoader4Line,
  RiArrowRightLine,
} from 'react-icons/ri';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';

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
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'RENTED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  notes: string;
  total_cost: number;
  duration: number;
  created: string;
}

export default function RentalHistoryPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookingId, setLoadingBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success message from booking creation
  const bookingSuccess = searchParams.get('success');
  const newBookingId = searchParams.get('booking');
  const paymentSuccess = searchParams.get('payment');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user exists and has an ID before making the API call
      if (!user || !user.id) {
        console.error('User information is missing');
        setError('User information is missing. Please try logging in again.');
        return;
      }
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      // Log the user ID to verify it's a valid UUID
      console.log('Fetching bookings for user ID:', user.id);
      
      // Make the API call with explicit user ID
      const response = await fetch(`${API_BASE_URL}/equipments/bookings/?user=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        } catch {
          // If we can't parse the error as JSON, just use the status text
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('Bookings data received:', data);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load rental history: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (!token) {
      router.push('/dashboard/login');
      return;
    }
    
    // Only fetch bookings if we have a user with an ID
    if (user && user.id) {
      fetchBookings();
    }
  }, [token, user, router, fetchBookings]);



  const handleCancelBooking = async (bookingId: string) => {
    try {
      setLoadingBookingId(bookingId);
      
      const loadingToast = toast.loading('Cancelling booking...');
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      // Use the dedicated cancel endpoint instead of a generic PATCH
      const response = await fetchWithAuth(`${API_BASE_URL}/equipments/bookings/${bookingId}/cancel/`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }
      
      const data = await response.json();
      
      // Update the local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? { ...booking, status: 'CANCELLED' } : booking
        )
      );
      
      toast.dismiss(loadingToast);
      toast.success(data.message || 'Booking cancelled successfully');
      
      // Refresh bookings to ensure we have the latest data
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoadingBookingId(null);
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

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/assets/images/equipments/excavator.jpeg';
    if (imageUrl.startsWith('http')) return imageUrl;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${imageUrl}`;
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'LKR 0.00';
    }
    return `LKR ${amount.toFixed(2)}`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Waiting for admin approval';
      case 'APPROVED':
        return 'Approved, waiting for payment';
      case 'PAID':
        return 'Payment completed, ready for pickup';
      case 'RENTED':
        return 'Equipment rented out';
      case 'COMPLETED':
        return 'Rental completed';
      case 'REJECTED':
        return 'Booking rejected by admin';
      case 'CANCELLED':
        return 'Booking cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RiLoader4Line className="text-6xl text-[#1b4965] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1b4965] mb-2">Loading Your Rentals</h2>
          <p className="text-gray-600">Please wait while we fetch your rental history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <RiAlertLine className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Rentals</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBookings}
            className="bg-[#1b4965] text-white px-6 py-3 rounded-lg hover:bg-[#0d3b59] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Rental History</h1>
      </div>

      {/* Success Message - Booking */}
      {bookingSuccess && newBookingId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
        >
          <div className="flex items-center">
            <RiCheckLine className="text-green-600 text-xl mr-3" />
            <div>
              <h3 className="text-green-800 font-semibold">Booking Submitted Successfully!</h3>
              <p className="text-green-700 text-sm">
                Your booking request has been submitted and is pending admin approval. 
                You&apos;ll be notified once it&apos;s reviewed.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message - Payment */}
      {paymentSuccess === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
        >
          <div className="flex items-center">
            <RiCheckLine className="text-green-600 text-xl mr-3" />
            <div>
              <h3 className="text-green-800 font-semibold">Payment Successful!</h3>
              <p className="text-green-700 text-sm">
                Your payment has been processed successfully. Your equipment rental is now confirmed.
                You&apos;ll be notified with pickup/delivery details soon.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Equipment Image */}
                  <div className="relative w-full md:w-32 h-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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

                  {/* Booking Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{booking.equipment_name || booking.equipment?.name}</h3>
                        <p className="text-gray-600 text-sm">Booking #{booking.id.substring(0, 8)}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <RiCalendarLine className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Rental Period</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <RiTimeLine className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.duration} day{booking.duration > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <RiMoneyDollarCircleLine className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Total Cost</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(booking.total_cost)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={loadingBookingId === booking.id}
                          className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loadingBookingId === booking.id ? (
                            <>
                              <RiLoader4Line className="animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <RiCloseLine />
                              Cancel Booking
                            </>
                          )}
                        </button>
                      )}

                      {booking.status === 'APPROVED' && (
                        <div className="w-full md:w-auto">
                          <button
                            onClick={() => router.push(`/dashboard/me/rentals/pay?bookingId=${booking.id}`)}
                            className="w-full md:w-auto px-6 py-3 bg-[#1b4965] text-white rounded-lg text-base font-medium hover:bg-[#0d3b59] transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                          >
                            <RiMoneyDollarCircleLine className="w-5 h-5" />
                            Pay Now
                            <RiArrowRightLine className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 text-center md:text-left">Complete payment to confirm your booking</p>
                        </div>
                      )}

                      {booking.status === 'PAID' && (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                          <RiCheckLine className="w-5 h-5" />
                          <span className="text-sm font-medium">Payment Complete</span>
                        </div>
                      )}

                      {booking.status === 'REJECTED' && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                          <RiCloseLine className="w-5 h-5" />
                          <span className="text-sm font-medium">Booking Rejected</span>
                        </div>
                      )}
                    </div>

                    {/* Status Messages */}
                    {booking.status === 'PENDING' && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          <strong>Awaiting Approval:</strong> Your booking request is being reviewed by our team. 
                          You&apos;ll receive a notification once it&apos;s approved or if we need additional information.
                        </p>
                      </div>
                    )}

                    {booking.status === 'APPROVED' && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          <strong>Booking Approved!</strong> Your rental has been approved. 
                          Please proceed with payment to confirm your booking.
                        </p>
                      </div>
                    )}

                    {booking.status === 'PAID' && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm">
                          <strong>Ready for Pickup/Delivery:</strong> Your payment has been processed. 
                          We&apos;ll contact you with pickup/delivery details soon.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-12 text-center border border-gray-200"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <RiCalendarLine className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rental History</h3>
            <p className="text-gray-500 mb-6">
              You haven&apos;t made any equipment rental bookings yet. 
              Browse our equipment catalog to get started!
            </p>
            <button
              onClick={() => router.push('/equipments')}
              className="bg-[#1b4965] text-white px-6 py-3 rounded-lg hover:bg-[#0d3b59] transition-colors"
            >
              Browse Equipment
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}