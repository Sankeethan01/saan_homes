"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/app/utils/auth";

export interface Notification {
  id: string;
  project_name: string;
  text: string;
  type: "info" | "warning" | "error" | "success";
  status: "pending" | "approved" | "rejected";
  created: string;
  is_read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    showUnreadOnly: false,
    status: 'all' as 'all' | 'pending' | 'approved' | 'rejected'
  });

  // Apply filters whenever notifications or filters change
  useEffect(() => {
    let result = [...notifications];
    
    if (filters.showUnreadOnly) {
      result = result.filter(notification => !notification.is_read);
    }
    
    if (filters.status !== 'all') {
      result = result.filter(notification => notification.status === filters.status);
    }
    
    setFilteredNotifications(result);
  }, [notifications, filters]);

  // Toggle unread filter
  const toggleUnreadFilter = () => {
    setFilters(prev => ({
      ...prev,
      showUnreadOnly: !prev.showUnreadOnly
    }));
  };

  // Set status filter
  const setStatusFilter = (status: 'all' | 'pending' | 'approved' | 'rejected') => {
    setFilters(prev => ({
      ...prev,
      status
    }));
  };

  // Load notifications on mount
  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetchWithAuth("/notifications/project-alerts/");
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP ${res.status}: Failed to fetch notifications`);
        }
        
        const data = await res.json();
        console.log('Notifications API response:', data);
        
        // Handle both array and paginated responses
        const items = Array.isArray(data) ? data : (data?.results || []);
        setNotifications(items);
        
      } catch (err: any) {
        console.error('Error in loadNotifications:', err);
        setError(err.message || 'Failed to load notifications');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      
      const res = await fetchWithAuth(`/notifications/project-alerts/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });
      
      if (!res.ok) {
        // Revert optimistic update on error
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: false } : n)
        );
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: Failed to mark as read`);
      }
      
      return true;
    } catch (err) {
      console.error('Error in markAsRead:', err);
      throw err;
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      if (unreadNotifications.length === 0) return true;
      
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => ({
          ...n,
          is_read: true
        }))
      );
      
      // Mark all as read on the server
      const res = await fetchWithAuth("/notifications/project-alerts/mark_all_read/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: unreadNotifications.map(n => n.id)
        }),
      });
      
      if (!res.ok) {
        // Revert optimistic update on error
        setNotifications(prev => 
          prev.map(n => ({
            ...n,
            is_read: unreadNotifications.some(unread => unread.id === n.id) ? false : n.is_read
          }))
        );
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: Failed to mark all as read`);
      }
      
      return true;
    } catch (err) {
      console.error('Error in markAllAsRead:', err);
      throw err;
    }
  };

  // Approve alert
  const approveAlert = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: "approved" } : n)
      );
      
      const res = await fetchWithAuth(`/notifications/project-alerts/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!res.ok) {
        // Revert optimistic update on error
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, status: "pending" } : n)
        );
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: Failed to approve alert`);
      }
    } catch (err) {
      console.error("Failed to approve alert", err);
      throw err;
    }
  };

  // Reject alert
  const rejectAlert = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: "rejected" } : n)
      );
      
      const res = await fetchWithAuth(`/notifications/project-alerts/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!res.ok) {
        // Revert optimistic update on error
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, status: "pending" } : n)
        );
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: Failed to reject alert`);
      }
    } catch (err) {
      console.error("Failed to reject alert", err);
      throw err;
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      // Optimistic update
      const notificationToDelete = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      const res = await fetchWithAuth(`/notifications/project-alerts/${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) {
        // Revert optimistic update on error
        if (notificationToDelete) {
          setNotifications(prev => [...prev, notificationToDelete].sort((a, b) => 
            new Date(b.created).getTime() - new Date(a.created).getTime()
          ));
        }
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: Failed to delete notification`);
      }
      
      return true;
    } catch (err) {
      console.error('Error in deleteNotification:', err);
      throw err;
    }
  };

  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    loading,
    error,
    filters,
    toggleUnreadFilter,
    setStatusFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    approveAlert,
    rejectAlert,
  };
}
