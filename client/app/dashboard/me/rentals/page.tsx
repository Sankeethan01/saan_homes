'use client';

import { useEffect, useState } from "react";
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
} from 'react-icons/ri';
import Image from 'next/image';

interface Booking {
  id: string;
  equipment: {
    id: string;
    name: string;
    image: string;
    daily_rate: number;
  };
  start_date: string;
  end_date: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';
  notes: string;
  created: string;
  duration: number;
  total_amount: number;
}

export default function RentalHistoryPage() {
  const token = useAuthStore((s) => s.token);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success message from booking creation
  const bookingSuccess = searchParams.get('success');
  const newBookingId = searchParams.get('booking');

  useEffect(() => {
    if (!token) {
      router.push('/dashboard/login');
      return;
    }
    fetchBookings();
  }, [token, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      const response = await fetchWithAuth(`${API_BASE_URL}/equipments/bookings/`);
      
      if (response.ok) {
        const data = await response.json();
        // Filter to only show current user's bookings
        setBookings(data);
      } else {
        throw new Error('Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load rental history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      const response = await fetchWithAuth(`${API_BASE_URL}/equipments/bookings/${bookingId}/cancel/`, {
        method: 'PATCH',
      });

      if (response.ok) {
        // Update the local state to reflect the cancellation
        setBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'CANCELLED' }
              : booking
          )
        );
        alert('Booking cancelled successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to cancel booking: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
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

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/assets/images/equipment.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${imageUrl}`;
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
    <div className="p-8">
      {/* Success Message */}
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
                You'll be notified once it's reviewed.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1b4965]">My Rental History</h2>
          <p className="text-gray-600">Track your equipment rental bookings and payments</p>
        </div>
      </div>

      <div className="space-y-4">
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
                <div className="flex items-start gap-4">
                  {/* Equipment Image */}
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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

                  {/* Booking Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{booking.equipment.name}</h3>
                        <p className="text-gray-600 text-sm">Booking #{booking.id}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <RiCalendarLine className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Rental Period</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <RiTimeLine className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.duration} day{booking.duration > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <RiMoneyDollarCircleLine className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Total Cost</p>
                          <p className="text-sm font-medium text-gray-900">
                            LKR {(booking.duration * booking.equipment.daily_rate).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {actionLoading === booking.id ? (
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
                        <button
                          onClick={() => router.push(`/dashboard/me/rentals/pay?bookingId=${booking.id}`)}
                          className="px-4 py-2 bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 text-white rounded-lg text-sm font-medium hover:from-[#1b4965]/90 hover:to-[#1b4965] transition-all duration-300 shadow-lg flex items-center gap-2"
                        >
                          <RiMoneyDollarCircleLine />
                          Continue to Payment
                        </button>
                      )}

                      {booking.status === 'PAID' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <RiCheckLine />
                          <span className="text-sm font-medium">Payment Complete</span>
                        </div>
                      )}

                      {booking.status === 'REJECTED' && (
                        <div className="flex items-center gap-2 text-red-600">
                          <RiCloseLine />
                          <span className="text-sm font-medium">Booking Rejected</span>
                        </div>
                      )}
                    </div>

                    {/* Status Messages */}
                    {booking.status === 'PENDING' && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          <strong>Awaiting Approval:</strong> Your booking request is being reviewed by our team. 
                          You'll receive a notification once it's approved or if we need additional information.
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
                          We'll contact you with pickup/delivery details soon.
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
              You haven't made any equipment rental bookings yet. 
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