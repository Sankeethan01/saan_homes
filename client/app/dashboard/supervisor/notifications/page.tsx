"use client";

import { useNotifications } from "@/app/hooks/useNotifications";
import { RiCheckLine, RiDeleteBinLine, RiCheckDoubleLine } from "react-icons/ri";

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
  
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const FilterControls = () => (
    <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded shadow">
      <select 
        value={filters.status}
        onChange={(e) => setStatusFilter(e.target.value as any)}
        className="border p-2 rounded"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      
      <label className="flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={filters.showUnreadOnly}
          onChange={toggleUnreadFilter}
        />
        Show Unread Only
      </label>
    </div>
  );

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

  const filteredNotifications = notifications.filter((n) => {
    if (filters.showUnreadOnly && n.is_read) return false;
    if (filters.status !== 'all' && n.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
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
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Add the filter controls */}
      <FilterControls />

      {/* Notifications Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Type</th>
              <th className="p-3">Details</th>
              <th className="p-3">Project</th>
              <th className="p-3">Status</th>
              <th className="p-3">Time</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((n) => (
              <tr
                key={n.id}
                className={`border-b ${
                  !n.is_read ? "bg-blue-50" : "bg-white"
                }`}
              >
                <td className="p-3">
                  {n.type === "success" && "✅"}
                  {n.type === "warning" && "⚠️"}
                  {n.type === "info" && "ℹ️"}
                  {n.type === "error" && "❌"}
                </td>
                <td className="p-3">
                  <p className="font-semibold">{n.text}</p>
                </td>
                <td className="p-3">{n.project_name}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    n.status === 'approved' ? 'bg-green-100 text-green-800' :
                    n.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {n.status}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(n.created).toLocaleString()}
                </td>
                <td className="p-3 flex gap-2 items-center">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      // Show confirmation dialog
                      const isConfirmed = window.confirm('Are you sure you want to delete this notification?');
                      if (isConfirmed) {
                        try {
                          await deleteNotification(n.id);
                        } catch (error) {
                          console.error('Error deleting notification:', error);
                        }
                      }
                    }}
                    className="text-gray-500 hover:text-red-600 p-1"
                    title="Delete"
                  >
                    <RiDeleteBinLine size={18} />
                  </button>
                  {!n.is_read && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await markAsRead(n.id);
                      }}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Mark as read"
                    >
                      <RiCheckLine size={20} />
                    </button>
                  )}
                  {n.status === 'pending' && (
                    <>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await approveAlert(n.id);
                            // Mark as read after approval
                            if (!n.is_read) {
                              await markAsRead(n.id);
                            }
                          } catch (error) {
                            console.error('Error approving:', error);
                          }
                        }}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Approve"
                      >
                        ✓
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await rejectAlert(n.id);
                            // Mark as read after rejection
                            if (!n.is_read) {
                              await markAsRead(n.id);
                            }
                          } catch (error) {
                            console.error('Error rejecting:', error);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Reject"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
