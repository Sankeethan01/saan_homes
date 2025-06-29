'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  RiMailLine,
  RiDeleteBinLine,
  RiRecycleLine,
  RiSendPlaneLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiEyeLine,
  RiRestartLine,
  RiNotificationLine,
  RiUserLine,
  RiToolsLine,
  RiFileListLine,
  RiTimeLine,
  RiReplyLine,
  RiSearchLine,
} from 'react-icons/ri';
import { FiBell, FiMail, FiClock, FiUser, FiTool, FiTrash2 } from 'react-icons/fi';

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
    message: 'I would like to know more about your construction services for a residential project.',
    date: '2024-03-15',
    status: 'unread',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    subject: 'Equipment Rental Question',
    message: 'Do you have excavators available for rent next month?',
    date: '2024-03-14',
    status: 'read',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    subject: 'Service Pricing',
    message: 'Could you provide a quote for commercial construction services?',
    date: '2024-03-13',
    status: 'replied',
    reply: 'Thank you for your inquiry. We will send you a detailed quote within 24 hours.',
  },
];

const initialRentalRequests: RentalRequest[] = [
  {
    id: '1',
    customerName: 'Alice Smith',
    equipmentName: 'Excavator CAT 320',
    startDate: '2024-03-20',
    endDate: '2024-03-25',
    status: 'pending',
    totalAmount: 2500,
  },
  {
    id: '2',
    customerName: 'Bob Johnson',
    equipmentName: 'Concrete Mixer',
    startDate: '2024-03-18',
    endDate: '2024-03-22',
    status: 'approved',
    totalAmount: 800,
  },
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
  {
    id: '3',
    projectName: 'Residential Complex Phase 2',
    supervisorName: 'David Brown',
    action: 'Material Delivered',
    details: 'All construction materials have been delivered to the site',
    date: '2024-03-16',
    isRead: true,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Calculate statistics
  const unreadMessages = messages.filter(msg => msg.status === 'unread').length;
  const unreadProjectAlerts = projectAlerts.filter(alert => !alert.isRead).length;
  const pendingRentals = rentalRequests.filter(req => req.status === 'pending').length;
  const totalNotifications = unreadMessages + unreadProjectAlerts + pendingRentals;

  // Navigation handlers
  const handleViewProject = (projectName: string) => {
    router.push(`/dashboard/admin/projects/${encodeURIComponent(projectName)}`);
  };

  const handleViewRental = (rentalId: string) => {
    router.push(`/dashboard/admin/equipments/rentalmanagment/${rentalId}`);
  };

  // Message handling functions
  const handleMessageReply = async (message: ContactMessage) => {
    if (replyText.trim()) {
      setActionLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedMessages = messages.map((msg) =>
        msg.id === message.id
          ? { ...msg, status: 'replied' as const, reply: replyText }
          : msg
      );
      setMessages(updatedMessages);
      setReplyingTo(null);
      setReplyText('');
      setActionLoading(false);
    }
  };

  const handleMarkMessageAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, status: 'read' as const } : msg
    ));
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

  // Recycle bin functions
  const handleRestoreItem = (item: DeletedItem) => {
    if (item.type === 'message') {
      setMessages([...messages, item.content as ContactMessage]);
    } else if (item.type === 'rental') {
      setRentalRequests([...rentalRequests, item.content as RentalRequest]);
    } else {
      setProjectAlerts([...projectAlerts, item.content as ProjectAlert]);
    }
    setDeletedItems(deletedItems.filter((i) => i.id !== item.id));
  };

  const handlePermanentDelete = (id: string) => {
    setDeletedItems(deletedItems.filter((item) => item.id !== id));
  };

  // Filter functions
  const getFilteredData = () => {
    if (!searchTerm) {
      return {
        messages,
        projectAlerts,
        rentalRequests,
        deletedItems
      };
    }

    return {
      messages: messages.filter(msg => 
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      projectAlerts: projectAlerts.filter(alert =>
        alert.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.action.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      rentalRequests: rentalRequests.filter(rental =>
        rental.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      deletedItems
    };
  };

  const filteredData = getFilteredData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'replied':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#1b4965] bg-clip-text text-transparent">
            Notifications & Communications
          </h1>
          <p className="text-slate-600 mt-1">Manage messages, alerts, and rental requests</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-200">
            <FiBell className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Total Pending:</span>
            <span className="text-sm font-bold text-blue-600">{totalNotifications}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Unread Messages</p>
              <p className="text-2xl font-bold text-slate-900">{unreadMessages}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiMail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Project Alerts</p>
              <p className="text-2xl font-bold text-slate-900">{unreadProjectAlerts}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <RiAlertLine className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Rentals</p>
              <p className="text-2xl font-bold text-slate-900">{pendingRentals}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiTool className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Deleted Items</p>
              <p className="text-2xl font-bold text-slate-900">{deletedItems.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiTrash2 className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notifications, messages, or alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-sm border border-slate-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all relative ${
              activeTab === 'messages'
                ? 'bg-gradient-to-r from-blue-500 to-[#1b4965] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RiMailLine className="w-4 h-4 mr-2" />
            Contact Messages
            {unreadMessages > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('project-alerts')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all relative ${
              activeTab === 'project-alerts'
                ? 'bg-gradient-to-r from-blue-500 to-[#1b4965] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RiAlertLine className="w-4 h-4 mr-2" />
            Project Alerts
            {unreadProjectAlerts > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadProjectAlerts}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rentals')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all relative ${
              activeTab === 'rentals'
                ? 'bg-gradient-to-r from-blue-500 to-[#1b4965] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RiToolsLine className="w-4 h-4 mr-2" />
            Rental Requests
            {pendingRentals > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRentals}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('recycle')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'recycle'
                ? 'bg-gradient-to-r from-blue-500 to-[#1b4965] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RiRecycleLine className="w-4 h-4 mr-2" />
            Recycle Bin
            {deletedItems.length > 0 && (
              <span className="ml-2 bg-slate-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {deletedItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <AnimatePresence mode="wait">
          {/* Contact Messages */}
          {activeTab === 'messages' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              {filteredData.messages.length > 0 ? (
                <div className="space-y-4">
                  {filteredData.messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        message.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-[#1b4965] rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {message.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">{message.name}</h3>
                              <p className="text-sm text-slate-500">{message.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900">{message.subject}</p>
                              <p className="text-xs text-slate-500">{formatDate(message.date)}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                              {message.status}
                            </span>
                          </div>
                          
                          <p className="text-slate-600 mb-3">{message.message}</p>
                          
                          {message.reply && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                              <p className="text-sm font-medium text-green-800 mb-1">Your Reply:</p>
                              <p className="text-green-700">{message.reply}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                        {message.status === 'unread' && (
                          <button
                            onClick={() => handleMarkMessageAsRead(message.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                          >
                            <RiEyeLine className="w-4 h-4" />
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => setReplyingTo(message)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                        >
                          <RiReplyLine className="w-4 h-4" />
                          Reply
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                          Delete
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
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No messages found</h3>
                  <p className="text-slate-500">
                    {searchTerm ? 'No messages match your search criteria.' : 'No contact messages received yet.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Project Alerts */}
          {activeTab === 'project-alerts' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              {filteredData.projectAlerts.length > 0 ? (
                <div className="space-y-4">
                  {filteredData.projectAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        !alert.isRead ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                              <RiAlertLine className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">{alert.projectName}</h3>
                              <p className="text-sm text-slate-500">Supervisor: {alert.supervisorName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900">{alert.action}</p>
                              <p className="text-xs text-slate-500">{formatDate(alert.date)}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              alert.isRead ? 'bg-slate-100 text-slate-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {alert.isRead ? 'Read' : 'New'}
                            </span>
                          </div>
                          
                          <p className="text-slate-600 mb-3">{alert.details}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleViewProject(alert.projectName)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                        >
                          <RiEyeLine className="w-4 h-4" />
                          View Project
                        </button>
                        {!alert.isRead && (
                          <button
                            onClick={() => handleMarkAlertAsRead(alert.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                          >
                            <RiCheckLine className="w-4 h-4" />
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProjectAlert(alert)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <RiAlertLine className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No project alerts</h3>
                  <p className="text-slate-500">
                    {searchTerm ? 'No alerts match your search criteria.' : 'No project alerts at the moment.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Rental Requests */}
          {activeTab === 'rentals' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              {filteredData.rentalRequests.length > 0 ? (
                <div className="space-y-4">
                  {filteredData.rentalRequests.map((rental, index) => (
                    <motion.div
                      key={rental.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        rental.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <FiTool className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">{rental.equipmentName}</h3>
                              <p className="text-sm text-slate-500">Customer: {rental.customerName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900">${rental.totalAmount}</p>
                              <p className="text-xs text-slate-500">{formatDate(rental.startDate)} - {formatDate(rental.endDate)}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rental.status)}`}>
                              {rental.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">Start Date:</span>
                              <span className="ml-2 font-medium">{formatDate(rental.startDate)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">End Date:</span>
                              <span className="ml-2 font-medium">{formatDate(rental.endDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleViewRental(rental.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                        >
                          <RiEyeLine className="w-4 h-4" />
                          View Details
                        </button>
                        {rental.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateRentalStatus(rental.id, 'approved')}
                              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                            >
                              <RiCheckLine className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateRentalStatus(rental.id, 'rejected')}
                              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                            >
                              <RiCloseLine className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteRental(rental)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FiTool className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No rental requests</h3>
                  <p className="text-slate-500">
                    {searchTerm ? 'No rental requests match your search criteria.' : 'No rental requests at the moment.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Recycle Bin */}
          {activeTab === 'recycle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              {deletedItems.length > 0 ? (
                <div className="space-y-4">
                  {deletedItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="p-4 rounded-lg border border-slate-200 bg-slate-50 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center">
                              <FiTrash2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">
                                {item.type === 'message' && (item.content as ContactMessage).subject}
                                {item.type === 'rental' && `${(item.content as RentalRequest).equipmentName} - ${(item.content as RentalRequest).customerName}`}
                                {item.type === 'project-alert' && `${(item.content as ProjectAlert).projectName} - ${(item.content as ProjectAlert).supervisorName}`}
                              </h3>
                              <p className="text-sm text-slate-500">
                                Deleted on {formatDate(item.deletedAt)}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.type === 'message' ? 'bg-blue-100 text-blue-800' :
                              item.type === 'rental' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {item.type === 'message' ? 'Message' : item.type === 'rental' ? 'Rental' : 'Alert'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleRestoreItem(item)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                        >
                          <RiRestartLine className="w-4 h-4" />
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                          Delete Permanently
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FiTrash2 className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Recycle bin is empty</h3>
                  <p className="text-slate-500">No deleted items to display.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setReplyingTo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-[#1b4965] bg-clip-text text-transparent">
                    Reply to {replyingTo.name}
                  </h2>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                    title="Close modal"
                  >
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Original Message:</p>
                  <p className="text-slate-600">{replyingTo.message}</p>
                </div>

                <div>
                  <label htmlFor="reply-text" className="block text-sm font-medium text-slate-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    id="reply-text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                    disabled={actionLoading}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleMessageReply(replyingTo)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={actionLoading || !replyText.trim()}
                  >
                    <RiSendPlaneLine className="w-4 h-4" />
                    {actionLoading ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
