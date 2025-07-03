'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthStore } from "@/app/stores/useAuthStore";
import { useRouter } from 'next/navigation';
import { 
  RiCheckLine, 
  RiDeleteBinLine, 
  RiLoader4Line, 
  RiErrorWarningLine, 
  RiNotification3Line,
  RiCheckboxCircleLine,
  RiTimeLine
} from 'react-icons/ri';

interface Notification {
  id: string;
  message: string;
  created: string;
  is_read: boolean;
  booking?: {
    id: string;
    equipment_name: string;
    equipment_id: string;
    start_date: string;
    end_date: string;
    total_cost: number;
    status: string;
  };
  status: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/dashboard/login');
      return;
    }
    
    fetchNotifications();
  }, [token, router]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/notifications/rental-requests/`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setLoadingAction(notificationId);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/notifications/rental-requests/${notificationId}/mark-read/`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setLoadingAction(notificationId);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/notifications/rental-requests/${notificationId}/`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-slate-100 text-slate-800 border-slate-200';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rented':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RiLoader4Line className="text-6xl text-[#1b4965] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1b4965] mb-2">Loading Notifications</h2>
          <p className="text-gray-600">Please wait while we fetch your notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <RiErrorWarningLine className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Notifications</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchNotifications}
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {notifications.length > 0 && (
          <span className="bg-[#1b4965] text-white text-sm font-medium px-3 py-1 rounded-full">
            {notifications.filter(n => !n.is_read).length} unread
          </span>
        )}
      </div>

      <div className="space-y-6">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-12 text-center border border-gray-200"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <RiNotification3Line className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-500 mb-6">
              You don&apos;t have any notifications at the moment.
              We&apos;ll notify you about your rental requests and updates.
            </p>
          </motion.div>
        ) : (
          notifications.map((notification, index) => {
            const isPending = notification.status?.toLowerCase() === "pending";
            const isApproved = notification.status?.toLowerCase() === "approved";
            const isRejected = notification.status?.toLowerCase() === "rejected";
            const isRead = notification.is_read;

            const cardBg = isRead ? "bg-white" : "bg-blue-50";
            const equipmentName = notification.booking?.equipment_name || "Equipment";
            
            const initials = equipmentName
              .split(" ")
              .slice(0, 2)
              .map((w: string) => w.charAt(0).toUpperCase())
              .join("");

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden ${cardBg}`}
              >
                <div className="p-6">
                  {/* Top Row */}
                  <div className="flex justify-between items-start gap-4">
                    {/* Avatar & Message */}
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#1b4965] bg-opacity-10 flex items-center justify-center font-semibold text-[#1b4965]">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {isApproved
                            ? "Rental Request Approved"
                            : isPending
                            ? "Pending Approval"
                            : isRejected
                            ? "Rental Request Rejected"
                            : "Rental Update"}
                        </h3>
                        <p className="text-gray-600">
                          {isApproved
                            ? `Your rental request for ${equipmentName} has been approved. Please proceed with payment.`
                            : isPending
                            ? `Your rental request for ${equipmentName} is awaiting admin approval.`
                            : isRejected
                            ? `Your rental request for ${equipmentName} was rejected.`
                            : notification.message || `Update on your ${equipmentName} rental.`}
                        </p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="text-right whitespace-nowrap">
                      <span className="text-sm text-gray-500 block">
                        {notification.created ? formatDate(notification.created) : ""}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusColor(notification.status || '')}`}>
                        {notification.status ? notification.status.toLowerCase() : 'unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Approved Details + CTA */}
                  {isApproved && notification.booking && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <RiTimeLine className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Rental Period</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(notification.booking.start_date)} - {formatDate(notification.booking.end_date)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <RiCheckboxCircleLine className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <p className="text-sm font-medium text-gray-900">
                              {notification.booking.status}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-bold">LKR</span>
                          <div>
                            <p className="text-xs text-gray-500">Total Cost</p>
                            <p className="text-sm font-medium text-gray-900">
                              {notification.booking.total_cost.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Link href={`/dashboard/me/rentals/pay?bookingId=${notification.booking.id}`}>
                        <button className="w-full md:w-auto px-6 py-3 bg-[#1b4965] text-white rounded-lg text-base font-medium hover:bg-[#0d3b59] transition-all duration-300 shadow-md flex items-center justify-center gap-2">
                          Proceed to Payment
                        </button>
                      </Link>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="mt-4 flex items-center gap-6">
                    {!isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={loadingAction === notification.id}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {loadingAction === notification.id ? (
                          <RiLoader4Line className="w-4 h-4 animate-spin" />
                        ) : (
                          <RiCheckLine className="w-4 h-4" />
                        )}
                        Mark as Read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteNotification(notification.id)}
                      disabled={loadingAction === notification.id}
                      className="ml-auto flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      {loadingAction === notification.id ? (
                        <RiLoader4Line className="w-4 h-4 animate-spin" />
                      ) : (
                        <RiDeleteBinLine className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
