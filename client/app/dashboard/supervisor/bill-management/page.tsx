"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { fetchWithAuth } from "@/app/utils/auth";
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
  RiUploadLine,
  RiRefreshLine,
} from "react-icons/ri";

interface Bill {
  id: string;
  step: string;
  step_title?: string;
  project_name?: string;
  pdf: string;
  ocr_data: {
    items?: Array<{
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
    total?: number;
  };
  uploaded_at: string;
  verified: boolean;
  uploaded_by: string;
  uploaded_by_name: string;
  is_submitted_to_admin: boolean;
  file_size?: number;
}

interface Step {
  id: string;
  title: string;
  project: {
    id: string;
    name: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  supervisor: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function BillManagement() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        // Fetch bills, steps, and projects in parallel
        const [billsResponse, stepsResponse, projectsResponse] = await Promise.all([
          fetchWithAuth('/projects/bills/'),
          fetchWithAuth('/projects/steps/'),
          fetchWithAuth('/projects/supervisor_projects/')
        ]);

        if (!billsResponse.ok) {
          throw new Error(`Failed to fetch bills: ${billsResponse.statusText}`);
        }

        if (!stepsResponse.ok) {
          throw new Error(`Failed to fetch steps: ${stepsResponse.statusText}`);
        }

        if (!projectsResponse.ok) {
          throw new Error(`Failed to fetch projects: ${projectsResponse.statusText}`);
        }

        const billsData = await billsResponse.json();
        const stepsData = await stepsResponse.json();
        const projectsData = await projectsResponse.json();

        // Filter bills for current supervisor's projects
        const supervisorProjectIds = projectsData.map((project: Project) => project.id);
        const supervisorBills = billsData.filter((bill: Bill) => {
          const step = stepsData.find((s: Step) => s.id === bill.step);
          // Check if the bill's step belongs to one of the supervisor's projects
          return step && step.project && supervisorProjectIds.includes(step.project.id);
        });

        // Enrich bills with step and project information
        const enrichedBills = supervisorBills.map((bill: Bill) => {
          const step = stepsData.find((s: Step) => s.id === bill.step);
          return {
            ...bill,
            step_title: step?.title,
            project_name: step?.project?.name
          };
        });

        // Filter steps to only include steps from supervisor's projects
        const supervisorSteps = stepsData.filter((step: Step) => 
          supervisorProjectIds.includes(step.project.id)
        );

        setBills(enrichedBills);
        setSteps(supervisorSteps);
        setProjects(projectsData);
        setError(null);
      } catch (err: unknown) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user]);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.step_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.uploaded_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "verified" && bill.verified) ||
                         (statusFilter === "pending" && !bill.verified) ||
                         (statusFilter === "submitted" && bill.is_submitted_to_admin);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (bill: Bill) => {
    if (bill.is_submitted_to_admin) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (bill.verified) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (bill: Bill) => {
    if (bill.is_submitted_to_admin) {
      return <RiCheckLine className="text-sm" />;
    } else if (bill.verified) {
      return <RiCheckLine className="text-sm" />;
    } else {
      return <RiTimeLine className="text-sm" />;
    }
  };

  const getStatusText = (bill: Bill) => {
    if (bill.is_submitted_to_admin) {
      return 'SUBMITTED';
    } else if (bill.verified) {
      return 'VERIFIED';
    } else {
      return 'PENDING';
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

  // CRUD Operations
  const handleUploadBill = async (stepId: string, file: File) => {
    // Since we're already filtering steps to only show supervisor's project steps,
    // we can trust that the selected step is valid
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('step', stepId);

      const response = await fetchWithAuth('/projects/bills/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const newBill = await response.json();
      setBills(prev => [newBill, ...prev]);
      setShowCreateModal(false);
      setError(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditBill = async (billId: string, file: File) => {
    // Validate that the bill belongs to supervisor's projects
    const bill = bills.find(b => b.id === billId);
    if (!bill) {
      setError("Bill not found or you don't have permission to edit this bill.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetchWithAuth(`/projects/bills/${billId}/`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      const updatedBill = await response.json();
      setBills(prev => prev.map(bill => 
        bill.id === billId ? { ...bill, ...updatedBill } : bill
      ));
      setShowEditModal(false);
      setSelectedBill(null);
      setError(null);
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    // Validate that the bill belongs to supervisor's projects
    const bill = bills.find(b => b.id === billId);
    if (!bill) {
      setError("Bill not found or you don't have permission to delete this bill.");
      return;
    }

    if (!confirm('Are you sure you want to delete this bill?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`/projects/bills/${billId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      setBills(prev => prev.filter(bill => bill.id !== billId));
      setError(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleDownloadBill = async (billId: string) => {
    // Validate that the bill belongs to supervisor's projects
    const bill = bills.find(b => b.id === billId);
    if (!bill) {
      setError("Bill not found or you don't have permission to download this bill.");
      return;
    }

    try {
      const response = await fetchWithAuth(`/projects/bills/${billId}/download/`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill-${billId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const handleSubmitToAdmin = async (billId: string) => {
    // Validate that the bill belongs to supervisor's projects
    const bill = bills.find(b => b.id === billId);
    if (!bill) {
      setError("Bill not found or you don't have permission to submit this bill.");
      return;
    }

    try {
      const response = await fetchWithAuth(`/projects/bills/${billId}/submit_to_admin/`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Submit failed: ${response.statusText}`);
      }

      setBills(prev => prev.map(bill => 
        bill.id === billId ? { ...bill, is_submitted_to_admin: true } : bill
      ));
      setError(null);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Submit failed');
    }
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
              value: bills.filter(b => !b.verified && !b.is_submitted_to_admin).length,
              icon: RiTimeLine,
              color: "yellow",
            },
            {
              title: "Verified",
              value: bills.filter(b => b.verified && !b.is_submitted_to_admin).length,
              icon: RiCheckLine,
              color: "green",
            },
            {
              title: "Submitted",
              value: bills.filter(b => b.is_submitted_to_admin).length,
              icon: RiCheckLine,
              color: "blue",
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
                  placeholder="Search bills by step, project, or uploaded by..."
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
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="submitted">Submitted</option>
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
                    Step & Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
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
                          Bill #{bill.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {bill.file_size ? `${(bill.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bill.step_title || 'Unknown Step'}</div>
                      <div className="text-sm text-gray-500">{bill.project_name || 'Unknown Project'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bill.uploaded_by_name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bill.ocr_data?.total ? formatCurrency(bill.ocr_data.total) : 'Not processed'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(bill)}`}>
                        {getStatusIcon(bill)}
                        {getStatusText(bill)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(bill.uploaded_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDownloadBill(bill.id)}
                          className="text-[#1b4965] hover:text-[#003049] transition-colors"
                          title="View/Download"
                        >
                          <RiEyeLine className="text-lg" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedBill(bill);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Replace Bill"
                        >
                          <RiEditLine className="text-lg" />
                        </button>
                        <button 
                          onClick={() => handleDownloadBill(bill.id)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Download PDF"
                        >
                          <RiDownloadLine className="text-lg" />
                        </button>
                        {!bill.is_submitted_to_admin && (
                          <button 
                            onClick={() => {
                              const step = steps.find(s => s.id === bill.step);
                              if (step) {
                                router.push(`/dashboard/supervisor/bill-management/invoice-generation?billId=${bill.id}&projectId=${step.project}&stepId=${bill.step}`);
                              }
                            }}
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                            title="Generate Invoice & Send to Admin"
                          >
                            <RiUploadLine className="text-lg" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteBill(bill.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Bill"
                        >
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

        {/* Create Bill Modal */}
        {showCreateModal && (
          <CreateBillModal
            projects={projects}
            steps={steps}
            onClose={() => setShowCreateModal(false)}
            onUpload={handleUploadBill}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />
        )}

        {/* Edit Bill Modal */}
        {showEditModal && selectedBill && (
          <EditBillModal
            bill={selectedBill}
            onClose={() => {
              setShowEditModal(false);
              setSelectedBill(null);
            }}
            onUpdate={handleEditBill}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />
        )}
      </div>
    </div>
  );
}

// Create Bill Modal Component
function CreateBillModal({ 
  projects,
  steps, 
  onClose, 
  onUpload, 
  uploading, 
  uploadProgress 
}: {
  projects: Project[];
  steps: Step[];
  onClose: () => void;
  onUpload: (stepId: string, file: File) => void;
  uploading: boolean;
  uploadProgress: number;
}) {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStep, setSelectedStep] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectSteps, setProjectSteps] = useState<Step[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);

  // Filter steps based on selected project
  const filteredSteps = selectedProject 
    ? steps.filter(step => step.project.id === selectedProject)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStep && selectedFile) {
      onUpload(selectedStep, selectedFile);
    }
  };

  const fetchStepsForProject = async (projectId: string) => {
    setLoadingSteps(true);
    try {
      // Fetch steps for the specific project from the backend
      const response = await fetchWithAuth(`/projects/steps/?project=${projectId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch steps: ${response.statusText}`);
      }
      
      const projectSteps = await response.json();
      console.log('Fetched steps for project:', projectSteps);
      setProjectSteps(projectSteps);
    } catch (error) {
      console.error('Error fetching steps:', error);
      setProjectSteps([]);
    } finally {
      setLoadingSteps(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedStep(""); // Reset step selection when project changes
    setProjectSteps([]); // Clear previous steps
    
    if (projectId) {
      fetchStepsForProject(projectId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1b4965]">Upload New Bill</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
              required
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Step <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStep}
              onChange={(e) => setSelectedStep(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={!selectedProject || loadingSteps}
            >
              <option value="">
                {loadingSteps 
                  ? "Loading steps..." 
                  : selectedProject 
                    ? "Choose a step..." 
                    : "First select a project"
                }
              </option>
              {projectSteps.map((step) => (
                <option key={step.id} value={step.id}>
                  {step.title}
                </option>
              ))}
            </select>
            {selectedProject && !loadingSteps && projectSteps.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No steps available for this project.
              </p>
            )}
            {loadingSteps && (
              <p className="text-sm text-blue-500 mt-1">
                Loading steps for selected project...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
              required
            />
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#1b4965] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#003049] transition-colors disabled:opacity-50"
              disabled={!selectedProject || !selectedStep || !selectedFile || uploading || loadingSteps}
            >
              {uploading ? "Uploading..." : "Upload Bill"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Edit Bill Modal Component
function EditBillModal({ 
  bill, 
  onClose, 
  onUpdate, 
  uploading, 
  uploadProgress 
}: {
  bill: Bill;
  onClose: () => void;
  onUpdate: (billId: string, file: File) => void;
  uploading: boolean;
  uploadProgress: number;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onUpdate(bill.id, selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1b4965]">Replace Bill</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Current Bill:</strong> {bill.step_title} - {bill.project_name}
          </p>
          <p className="text-sm text-gray-500">
            Uploaded: {new Date(bill.uploaded_at).toLocaleDateString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New PDF File
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
              required
            />
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#1b4965] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#003049] transition-colors disabled:opacity-50"
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Updating..." : "Replace Bill"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
