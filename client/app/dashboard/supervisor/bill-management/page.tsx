"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/app/stores/useAuthStore";
import {
  RiBillLine,
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiDownloadLine,
  RiEditLine,
  RiDeleteBin6Line,
  RiEyeLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiFileTextLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiAlertLine,
} from "react-icons/ri";

interface Bill {
  id: string;
  bill_number: string;
  project_name: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  due_date: string;
  created_date: string;
  description?: string;
  client_name?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function BillManagement() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    const fetchBills = async () => {
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        // For now, using mock data since we don't have a bills API endpoint yet
        // In the future, replace this with actual API call:
        // const response = await axios.get(`${API_BASE}/bills/`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setBills(response.data);

        // Mock data for demonstration
        const mockBills: Bill[] = [
          {
            id: "1",
            bill_number: "BILL-001",
            project_name: "Green Villa Construction",
            amount: 150000,
            status: "PENDING",
            due_date: "2024-10-15",
            created_date: "2024-09-15",
            description: "Foundation and structure work",
            client_name: "John Smith"
          },
          {
            id: "2",
            bill_number: "BILL-002",
            project_name: "Modern Apartment Complex",
            amount: 250000,
            status: "PAID",
            due_date: "2024-09-30",
            created_date: "2024-09-01",
            description: "Electrical and plumbing installation",
            client_name: "Sarah Johnson"
          },
          {
            id: "3",
            bill_number: "BILL-003",
            project_name: "Luxury House Renovation",
            amount: 180000,
            status: "OVERDUE",
            due_date: "2024-09-20",
            created_date: "2024-08-20",
            description: "Interior design and finishing",
            client_name: "Michael Brown"
          },
          {
            id: "4",
            bill_number: "BILL-004",
            project_name: "Commercial Building",
            amount: 320000,
            status: "PENDING",
            due_date: "2024-10-30",
            created_date: "2024-09-20",
            description: "Complete construction work",
            client_name: "ABC Corporation"
          }
        ];

        setBills(mockBills);
        setError(null);
      } catch (err: unknown) {
        const error = err as AxiosError<{ error?: string }>;
        console.error("Failed to fetch bills:", error);
        setError(error.response?.data?.error || "Failed to fetch bills");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [token]);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <RiCheckLine className="text-sm" />;
      case 'PENDING':
        return <RiTimeLine className="text-sm" />;
      case 'OVERDUE':
        return <RiAlertLine className="text-sm" />;
      case 'CANCELLED':
        return <RiCloseLine className="text-sm" />;
      default:
        return <RiFileTextLine className="text-sm" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b4965] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bill management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold">Error: {error}</p>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-40 h-40 bg-[#e3f0ff] rounded-full blur-3xl opacity-60 -z-10" />
      <div className="fixed top-1/2 right-0 w-48 h-48 bg-[#ffe3ec] rounded-full blur-3xl opacity-50 -z-10" />
      <div className="fixed bottom-0 left-1/3 w-56 h-56 bg-[#e3ffe9] rounded-full blur-3xl opacity-40 -z-10" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white via-[#f0f6ff] to-white rounded-2xl p-6 shadow border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#e3f0ff] to-[#cbeafe] rounded-xl">
                <RiBillLine className="text-[#1b4965] text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1b4965]">Bill Management</h1>
                <p className="text-gray-600">Manage project bills and invoices</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-[#1b4965] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
              >
                <RiAddLine className="text-lg" />
                Create Bill
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Bills",
              value: bills.length,
              icon: RiFileTextLine,
              color: "blue",
            },
            {
              title: "Pending",
              value: bills.filter(b => b.status === 'PENDING').length,
              icon: RiTimeLine,
              color: "yellow",
            },
            {
              title: "Paid",
              value: bills.filter(b => b.status === 'PAID').length,
              icon: RiCheckLine,
              color: "green",
            },
            {
              title: "Overdue",
              value: bills.filter(b => b.status === 'OVERDUE').length,
              icon: RiAlertLine,
              color: "red",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className={`group p-4 rounded-xl shadow border border-gray-100 hover:shadow-md transition-all duration-200 ${
                index === 0
                  ? "bg-gradient-to-br from-[#e3f0ff] to-white"
                  : index === 1
                  ? "bg-gradient-to-br from-[#fffbe3] to-white"
                  : index === 2
                  ? "bg-gradient-to-br from-[#e3ffe9] to-white"
                  : "bg-gradient-to-br from-[#ffe3ec] to-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-[#1b4965]">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${
                  index === 0
                    ? "bg-[#cbeafe]"
                    : index === 1
                    ? "bg-[#fff7c2]"
                    : index === 2
                    ? "bg-[#caffdd]"
                    : "bg-[#ffd6e3]"
                }`}>
                  <stat.icon className="text-xl text-[#1b4965]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-4 rounded-xl shadow border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bills by number, project, or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <RiFilterLine className="text-lg" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <RiDownloadLine className="text-lg" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bills Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill, index) => (
                  <motion.tr
                    key={bill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {bill.bill_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(bill.created_date)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bill.project_name}</div>
                      {bill.description && (
                        <div className="text-sm text-gray-500">{bill.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bill.client_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(bill.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(bill.status)}`}>
                        {getStatusIcon(bill.status)}
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(bill.due_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-[#1b4965] hover:text-[#003049] transition-colors">
                          <RiEyeLine className="text-lg" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 transition-colors">
                          <RiEditLine className="text-lg" />
                        </button>
                        <button className="text-green-600 hover:text-green-800 transition-colors">
                          <RiDownloadLine className="text-lg" />
                        </button>
                        <button className="text-red-600 hover:text-red-800 transition-colors">
                          <RiDeleteBin6Line className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredBills.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-12 rounded-xl shadow border border-gray-100 text-center"
          >
            <RiBillLine className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first bill."}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-[#1b4965] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
            >
              <RiAddLine className="text-lg" />
              Create Bill
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
