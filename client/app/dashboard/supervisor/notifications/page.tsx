'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiNotification3Line,
  RiCheckLine,
  RiTimeLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiDeleteBin6Line,
  RiCheckDoubleLine,
} from 'react-icons/ri';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  project: string;
  timestamp: string;
  isRead: boolean;
}

const sampleNotifications: Notification[] = [
  {
    id: 1,
    title: "Project Milestone Completed",
    message: "Phase 1 of Modern Residential Complex has been completed successfully.",
    type: "success",
    project: "Modern Residential Complex",
    timestamp: "2024-03-15T10:30:00",
    isRead: false
  },
  {
    id: 2,
    title: "Budget Warning",
    message: "Tech Innovation Hub project is approaching budget limit.",
    type: "warning",
    project: "Tech Innovation Hub",
    timestamp: "2024-03-15T09:15:00",
    isRead: false
  },
  {
    id: 3,
    title: "New Team Member Added",
    message: "John Doe has been assigned to City Center Mall project.",
    type: "info",
    project: "City Center Mall",
    timestamp: "2024-03-14T16:45:00",
    isRead: true
  },
  {
    id: 4,
    title: "Material Shortage Alert",
    message: "Critical shortage of construction materials detected.",
    type: "error",
    project: "Modern Residential Complex",
    timestamp: "2024-03-14T14:20:00",
    isRead: true
  },
  // Add more notifications as needed
];

const notificationTypes = ["All", "Info", "Warning", "Error", "Success"];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [selectedType, setSelectedType] = useState("All");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <RiInformationLine className="text-blue-500" />;
      case 'warning':
        return <RiErrorWarningLine className="text-yellow-500" />;
      case 'error':
        return <RiErrorWarningLine className="text-red-500" />;
      case 'success':
        return <RiCheckLine className="text-green-500" />;
      default:
        return <RiNotification3Line className="text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedType !== "All" && notification.type !== selectedType.toLowerCase()) return false;
    if (showUnreadOnly && notification.isRead) return false;
    return true;
  });

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600">
            {notifications.filter(n => !n.isRead).length} unread notifications
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RiCheckDoubleLine />
          Mark All as Read
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              {notificationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Show Unread Only
            </label>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <motion.tr
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={notification.isRead ? 'bg-white' : 'bg-blue-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {notification.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{notification.project}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-3">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <RiCheckLine className="text-xl" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <RiNotification3Line className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
