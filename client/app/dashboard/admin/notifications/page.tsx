'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  RiMailLine,
  RiDeleteBin6Line,
  RiRecycleLine,
  RiSendPlaneLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiAlertLine,
  RiEyeLine,
} from 'react-icons/ri';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'unread' | 'read' | 'replied';
  reply?: string;
}

interface RentalRequest {
  id: string;
  customerName: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  totalAmount: number;
}

interface DeletedItem {
  id: string;
  type: 'message' | 'rental' | 'project-alert';
  content: ContactMessage | RentalRequest | ProjectAlert;
  deletedAt: string;
}

interface ProjectAlert {
  id: string;
  projectName: string;
  supervisorName: string;
  action: string;
  details: string;
  date: string;
  isRead: boolean;
}

// Sample data
const initialMessages: ContactMessage[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Project Inquiry',
    message: 'I would like to know more about your construction services.',
    date: '2024-03-15',
    status: 'unread',
  },
  // Add more sample messages
];

const initialRentalRequests: RentalRequest[] = [
  {
    id: '1',
    customerName: 'Alice Smith',
    equipmentName: 'Excavator',
    startDate: '2024-03-20',
    endDate: '2024-03-25',
    status: 'pending',
    totalAmount: 2500,
  },
  // Add more sample rental requests
];

const initialProjectAlerts: ProjectAlert[] = [
  {
    id: '1',
    projectName: 'Modern Villa Construction',
    supervisorName: 'Mike Johnson',
    action: 'Timeline Updated',
    details: 'Project completion date extended by 2 weeks due to weather conditions',
    date: '2024-03-18',
    isRead: false,
  },
  {
    id: '2',
    projectName: 'Office Complex Renovation',
    supervisorName: 'Sarah Williams',
    action: 'Budget Modified',
    details: 'Additional budget allocated for new materials requirement',
    date: '2024-03-17',
    isRead: false,
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'messages' | 'project-alerts' | 'rentals' | 'recycle'>('messages');
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [projectAlerts, setProjectAlerts] = useState<ProjectAlert[]>(initialProjectAlerts);
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>(initialRentalRequests);
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [replyingTo, setReplyingTo] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingRental, setEditingRental] = useState<RentalRequest | null>(null);

  // Calculate unread counts
  const unreadMessages = messages.filter(msg => msg.status === 'unread').length;
  const unreadProjectAlerts = projectAlerts.filter(alert => !alert.isRead).length;
  const pendingRentals = rentalRequests.filter(req => req.status === 'pending').length;

  // Navigation handlers
  const handleViewProject = (projectName: string) => {
    // Navigate to the project details page
    router.push(`/dashboard/admin/projects/${encodeURIComponent(projectName)}`);
  };

  const handleViewRental = (rentalId: string) => {
    // Navigate to the rental details page
    router.push(`/dashboard/admin/rentals/${rentalId}`);
  };

  // Message handling functions
  const handleMessageReply = (message: ContactMessage) => {
    if (replyText.trim()) {
      const updatedMessages = messages.map((msg) =>
        msg.id === message.id
          ? { ...msg, status: 'replied' as const, reply: replyText }
          : msg
      );
      setMessages(updatedMessages);
      setReplyingTo(null);
      setReplyText('');
    }
  };

  const handleDeleteMessage = (message: ContactMessage) => {
    setMessages(messages.filter((msg) => msg.id !== message.id));
    setDeletedItems([
      ...deletedItems,
      {
        id: Date.now().toString(),
        type: 'message',
        content: message,
        deletedAt: new Date().toISOString(),
      },
    ]);
  };

  // Rental request handling functions
  const handleUpdateRentalStatus = (id: string, status: RentalRequest['status']) => {
    setRentalRequests(
      rentalRequests.map((req) =>
        req.id === id ? { ...req, status } : req
      )
    );
  };

  const handleDeleteRental = (rental: RentalRequest) => {
    setRentalRequests(rentalRequests.filter((req) => req.id !== rental.id));
    setDeletedItems([
      ...deletedItems,
      {
        id: Date.now().toString(),
        type: 'rental',
        content: rental,
        deletedAt: new Date().toISOString(),
      },
    ]);
  };

  // Recycle bin functions
  const handleRestoreItem = (item: DeletedItem) => {
    if (item.type === 'message') {
      setMessages([...messages, item.content as ContactMessage]);
    } else {
      setRentalRequests([...rentalRequests, item.content as RentalRequest]);
    }
    setDeletedItems(deletedItems.filter((i) => i.id !== item.id));
  };

  const handlePermanentDelete = (id: string) => {
    setDeletedItems(deletedItems.filter((item) => item.id !== id));
  };

  // Project alert handling functions
  const handleMarkAlertAsRead = (alertId: string) => {
    setProjectAlerts(
      projectAlerts.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const handleDeleteProjectAlert = (alert: ProjectAlert) => {
    setProjectAlerts(projectAlerts.filter(a => a.id !== alert.id));
    setDeletedItems([
      ...deletedItems,
      {
        id: Date.now().toString(),
        type: 'project-alert',
        content: alert,
        deletedAt: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs with Notification Counts */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center px-4 py-2 rounded-lg relative ${
            activeTab === 'messages'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <RiMailLine className="mr-2" />
          Contact Messages
          {unreadMessages > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadMessages}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('project-alerts')}
          className={`flex items-center px-4 py-2 rounded-lg relative ${
            activeTab === 'project-alerts'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <RiAlertLine className="mr-2" />
          Project Alerts
          {unreadProjectAlerts > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadProjectAlerts}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`flex items-center px-4 py-2 rounded-lg relative ${
            activeTab === 'rentals'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <RiEditLine className="mr-2" />
          Rental Requests
          {pendingRentals > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingRentals}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('recycle')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'recycle'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <RiRecycleLine className="mr-2" />
          Recycle Bin
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <AnimatePresence mode="wait">
          {activeTab === 'messages' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-x-auto"
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium">{message.name}</span>
                          <span className="text-sm text-gray-500">{message.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{message.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{message.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            message.status === 'unread'
                              ? 'bg-red-100 text-red-800'
                              : message.status === 'read'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {message.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setReplyingTo(message)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <RiSendPlaneLine />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'project-alerts' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-x-auto"
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supervisor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projectAlerts.map((alert) => (
                    <tr key={alert.id} className={!alert.isRead ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4">
                        <span className="font-medium">{alert.projectName}</span>
                      </td>
                      <td className="px-6 py-4">{alert.supervisorName}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{alert.action}</span>
                          <span className="text-sm text-gray-500">{alert.details}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{alert.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            alert.isRead
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {alert.isRead ? 'Read' : 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProject(alert.projectName)}
                            className="text-green-600 hover:text-green-800"
                            title="View Project"
                          >
                            <RiEyeLine />
                          </button>
                          {!alert.isRead && (
                            <button
                              onClick={() => handleMarkAlertAsRead(alert.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Mark as Read"
                            >
                              <RiCheckLine />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteProjectAlert(alert)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Alert"
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'rentals' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-x-auto"
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rentalRequests.map((rental) => (
                    <tr key={rental.id}>
                      <td className="px-6 py-4">{rental.customerName}</td>
                      <td className="px-6 py-4">{rental.equipmentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>Start: {rental.startDate}</span>
                          <span>End: {rental.endDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${rental.totalAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            rental.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : rental.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {rental.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewRental(rental.id)}
                            className="text-green-600 hover:text-green-800"
                            title="View Rental Details"
                          >
                            <RiEyeLine />
                          </button>
                          {rental.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateRentalStatus(rental.id, 'approved')}
                                className="text-green-600 hover:text-green-800"
                                title="Approve Rental"
                              >
                                <RiCheckLine />
                              </button>
                              <button
                                onClick={() => handleUpdateRentalStatus(rental.id, 'rejected')}
                                className="text-red-600 hover:text-red-800"
                                title="Reject Rental"
                              >
                                <RiCloseLine />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteRental(rental)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Rental"
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'recycle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-x-auto"
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deleted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deletedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.type === 'message'
                              ? 'bg-blue-100 text-blue-800'
                              : item.type === 'rental'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {item.type === 'message' ? 'Contact Message' : item.type === 'rental' ? 'Rental Request' : 'Project Alert'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.type === 'message'
                          ? (item.content as ContactMessage).subject
                          : item.type === 'rental'
                          ? `${(item.content as RentalRequest).equipmentName} - ${
                              (item.content as RentalRequest).customerName
                            }`
                          : `${(item.content as ProjectAlert).projectName} - ${
                              (item.content as ProjectAlert).supervisorName
                            }`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(item.deletedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRestoreItem(item)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <RiArrowLeftLine />
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Reply to {replyingTo.name}</h2>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Original Message:</p>
              <p className="bg-gray-50 p-3 rounded">{replyingTo.message}</p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="w-full p-3 border rounded mb-4 h-32"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMessageReply(replyingTo)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
