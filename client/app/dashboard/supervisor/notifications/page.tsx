"use client";

import { useState } from "react";
import { useNotifications, Notification } from "@/app/hooks/useNotifications";
import { 
  RiCheckLine, 
  RiDeleteBinLine, 
  RiCheckDoubleLine, 
  RiMailLine,
  RiEyeLine,
  RiReplyLine,
  RiSearchLine
} from "react-icons/ri";
import { FiBell, FiMail } from "react-icons/fi";
import { motion } from "framer-motion";

export default function NotificationsPage() {
  const { 
    notifications,
    loading, 
    error, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    approveAlert,
    rejectAlert,
    filters,
    toggleUnreadFilter,
    setStatusFilter,
  } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [replyingTo, setReplyingTo] = useState<Notification | null>(null);
  
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Filter notifications based on search term
  const filteredNotifications = searchTerm 
    ? notifications.filter(n => 
        n.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
        n.project_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : notifications;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-[#1b4965] bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-slate-600 mt-1">Manage your notifications and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-200">
            <FiBell className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Unread:</span>
            <span className="text-sm font-bold text-blue-600">{unreadCount}</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-lg">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await markAllAsRead();
              } catch (error) {
                console.error('Error marking all as read:', error);
              }
            }}
            disabled={unreadCount === 0 || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RiCheckDoubleLine size={20} />
            Mark All as Read
          </button>
          <select
            value={filters.status}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
            <label className="flex items-center gap-2 border rounded px-3 py-2">
              <input 
                type="checkbox" 
                checked={filters.showUnreadOnly}
                onChange={toggleUnreadFilter}
              />
              Unread Only
            </label>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 transition-all hover:bg-slate-50 ${
                  !notification.is_read ? "bg-blue-50" : "bg-white"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-[#1b4965] rounded-full flex items-center justify-center">
                        {notification.type === "success" && <span className="text-white">✅</span>}
                        {notification.type === "warning" && <span className="text-white">⚠️</span>}
                        {notification.type === "info" && <span className="text-white">ℹ️</span>}
                        {notification.type === "error" && <span className="text-white">❌</span>}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{notification.text}</p>
                        <p className="text-sm text-slate-500">Project: {notification.project_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">{new Date(notification.created).toLocaleString()}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.status)}`}>
                          {notification.status}
                  </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                  {!notification.is_read && (
                    <button
                      onClick={async () => {
                        try {
                          await markAsRead(notification.id);
                        } catch (error) {
                          console.error('Error marking as read:', error);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                    >
                      <RiEyeLine className="w-4 h-4" />
                      Mark as Read
                    </button>
                  )}
                  
                  <button
                    onClick={async () => {
                      // Show confirmation dialog
                      const isConfirmed = window.confirm('Are you sure you want to delete this notification?');
                      if (isConfirmed) {
                        try {
                          await deleteNotification(notification.id);
                        } catch (error) {
                          console.error('Error deleting notification:', error);
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                    Delete
                  </button>
                  
                  {notification.status === 'pending' && (
                    <>
                      <button
                        onClick={async () => {
                          try {
                            await approveAlert(notification.id);
                            // Mark as read after approval
                            if (!notification.is_read) {
                              await markAsRead(notification.id);
                            }
                          } catch (error) {
                            console.error('Error approving:', error);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                      >
                        <RiCheckLine className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await rejectAlert(notification.id);
                            // Mark as read after rejection
                            if (!notification.is_read) {
                              await markAsRead(notification.id);
                            }
                          } catch (error) {
                            console.error('Error rejecting:', error);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                      >
                        ✕
                        Reject
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => setReplyingTo(notification)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    <RiReplyLine className="w-4 h-4" />
                    Reply
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiMail className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No notifications found</h3>
            <p className="text-slate-500">
              {searchTerm ? 'No notifications match your search criteria.' : 'You have no notifications at the moment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
