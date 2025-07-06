'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  FiChevronLeft, 
  FiCheckCircle, 
  FiClock, 
  FiAlertTriangle, 
  FiDollarSign, 
  FiPackage, 
  FiFileText, 
  FiBarChart2, 
  FiThumbsUp,
  FiDownload,
  FiUpload,
  FiCalendar
} from 'react-icons/fi';
import React, { use } from 'react';

interface Bill {
  id: string;
  pdf: string;
  uploaded_at: string;
  verified: boolean;
}

interface ProgressLog {
  id: string;
  stepId: string;
  title: string;
  description: string;
  media: {
    id: string;
    url: string;
    type: string;
    filename: string;
  }[];
  timestamp: string;
  type: 'TEXT' | 'PHOTO' | 'VIDEO';
}

interface Step {
  id: string;
  order: number;
  title: string;
  description: string;
  is_approved: boolean;
  actual_completed: string | null;
  expected_materials: Record<string, { quantity: number; unit?: string; rate?: number }>;
  expected_quantity: number | null;
  expected_budget: number | null;
  bills: Bill[];
  logs: ProgressLog[];
}

interface Project {
  id: string;
  name: string;
}

export default function StepDetailsPage({ params }: { params: Promise<{ projectId: string; stepId: string }> }) {
  // Unwrap params with React.use()
  const { projectId, stepId } = use(params);
  
  const [step, setStep] = useState<Step | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [uploadingBill, setUploadingBill] = useState(false);
  const [billFile, setBillFile] = useState<File | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [addingLog, setAddingLog] = useState(false);
  const [logTitle, setLogTitle] = useState('');
  const [logDescription, setLogDescription] = useState('');
  const [logMedia, setLogMedia] = useState<File | null>(null);
  const [logType, setLogType] = useState<'TEXT' | 'PHOTO' | 'VIDEO'>('TEXT');
  const [logFilter, setLogFilter] = useState<'ALL' | 'TEXT' | 'PHOTO' | 'VIDEO'>('ALL');
  const [logSort, setLogSort] = useState<'newest' | 'oldest'>('newest');
  
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  // Derived data
  const materials = step ? Object.entries(step.expected_materials).map(([key, details], index) => {
    // Try to extract a proper name from the key if it's a number
    let materialName = key;
    if (!isNaN(Number(key))) {
      // If the key is a number, try to get a name from the details if available
      if (typeof details === 'object' && details !== null) {
        if ('name' in details) {
          materialName = details.name;
        } else if ('description' in details) {
          materialName = details.description;
        } else if ('material' in details) {
          materialName = details.material;
        }
      }
      // If we still have a numeric key with no name, add a generic name
      if (materialName === key) {
        materialName = `Material ${Number(key) + 1}`;
      }
    }

    return {
      id: index,
      name: materialName,
      quantity: details.quantity,
      unit: details.unit || 'units',
      rate: details.rate,
      amount: details.rate ? details.rate * details.quantity : undefined
    };
  }) : [];

  const totalMaterialCost = materials.reduce((sum, material) => sum + (material.amount || 0), 0);
  const billsTotal = step?.bills?.length || 0;
  const verifiedBills = step?.bills?.filter(bill => bill.verified).length || 0;
  const budgetVariance = step?.expected_budget ? totalMaterialCost - step.expected_budget : 0;
  const budgetVariancePercent = step?.expected_budget ? (budgetVariance / step.expected_budget) * 100 : 0;
  
  // Calculate progress percentage based on step status
  const getProgressPercentage = () => {
    if (step?.is_approved) return 100;
    if (step?.actual_completed) return 75;
    if (step?.logs?.length) return 50;
    return 25;
  };
  
  const progressPercentage = getProgressPercentage();

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    const fetchStepDetails = async () => {
      try {
        // Fetch step details
        const stepResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/steps/${stepId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!stepResponse.ok) {
          if (stepResponse.status === 401) {
            clearToken();
            router.replace('/dashboard/login');
            return;
          }
          throw new Error('Failed to fetch step details');
        }

        const stepData = await stepResponse.json();
        setStep(stepData);
        
        // Fetch project basic info
        const projectResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project details');
        }

        const projectData = await projectResponse.json();
        setProject({
          id: projectData.id,
          name: projectData.name
        });
        
        setError(null);
      } catch (err) {
        setError('Error loading data. Please try again later.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStepDetails();
  }, [token, router, clearToken, projectId, stepId]);

  const handleApproveStep = async () => {
    setApproving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/steps/${stepId}/approve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actual_completed: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          router.replace('/dashboard/login');
          return;
        }
        throw new Error('Failed to approve step');
      }

      const updatedStep = await response.json();
      setStep(updatedStep);
      setShowApproveModal(false);
    } catch (err) {
      console.error('Error approving step:', err);
      setError('Failed to approve step. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const handleBillUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billFile) return;
    
    setUploadingBill(true);
    const formData = new FormData();
    formData.append('pdf', billFile);
    formData.append('step', stepId);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          router.replace('/dashboard/login');
          return;
        }
        throw new Error('Failed to upload bill');
      }

      // Refresh step data to get updated bills
      const stepResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/steps/${stepId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!stepResponse.ok) {
        throw new Error('Failed to refresh step data');
      }

      const stepData = await stepResponse.json();
      setStep(stepData);
      setBillFile(null);
      
    } catch (err) {
      console.error('Error uploading bill:', err);
      setError('Failed to upload bill. Please try again.');
    } finally {
      setUploadingBill(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBillFile(e.target.files[0]);
    }
  };

  const handleLogMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogMedia(e.target.files[0]);
      // Set log type based on file type
      const fileType = e.target.files[0].type;
      if (fileType.startsWith('image/')) {
        setLogType('PHOTO');
      } else if (fileType.startsWith('video/')) {
        setLogType('VIDEO');
      } else {
        setLogType('TEXT');
      }
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingLog(true);
    
    try {
      const formData = new FormData();
      formData.append('step', stepId);
      formData.append('title', logTitle);
      formData.append('description', logDescription);
      formData.append('type', logType);
      if (logMedia) {
        formData.append('media', logMedia);
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/logs/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          router.replace('/dashboard/login');
          return;
        }
        throw new Error('Failed to add progress log');
      }

      // Refresh step data to get updated logs
      const stepResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/steps/${stepId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!stepResponse.ok) {
        throw new Error('Failed to refresh step data');
      }

      const stepData = await stepResponse.json();
      setStep(stepData);
      
      // Reset form
      setLogTitle('');
      setLogDescription('');
      setLogMedia(null);
      setLogType('TEXT');
      setShowAddLogModal(false);
      
    } catch (err) {
      console.error('Error adding log:', err);
      setError('Failed to add progress log. Please try again.');
    } finally {
      setAddingLog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !step || !project) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error || 'Step not found'}</div>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  const getStepStatusIcon = () => {
    if (step.is_approved) {
      return <FiCheckCircle className="w-6 h-6 text-green-500" />;
    } else if (step.actual_completed) {
      return <FiClock className="w-6 h-6 text-blue-500" />;
    }
    return <FiAlertTriangle className="w-6 h-6 text-yellow-500" />;
  };

  const getStepStatusText = () => {
    if (step.is_approved) {
      return 'Completed';
    } else if (step.actual_completed) {
      return 'In Progress';
    }
    return 'Pending';
  };

  const getStepStatusClass = () => {
    if (step.is_approved) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (step.actual_completed) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button and Header */}
      <div>
        <button 
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FiChevronLeft className="mr-1" /> Back to Project
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{project.name}</h1>
            <div className="flex items-center mt-1">
              <span className="text-xl font-medium text-gray-700">
                Step {step.order}: {step.title}
              </span>
              <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${getStepStatusClass()}`}>
                {getStepStatusText()}
              </span>
            </div>
            {step.description && (
              <p className="text-sm text-gray-500 mt-2">{step.description}</p>
            )}
          </div>
          
          {!step.is_approved && (
            <button
              onClick={() => setShowApproveModal(true)}
              disabled={approving}
              className="mt-4 md:mt-0 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
            >
              {approving ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Approving...
                </>
              ) : (
                <>
                  <FiThumbsUp className="mr-2" /> Approve Step
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Materials List */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                  <FiPackage className="w-5 h-5 text-blue-600" />
                </div>
                Materials & Quantities
              </h2>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                {materials.length} items
              </span>
            </div>
          
          {materials.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/3">
                      Material
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Unit
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Rate
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                {materials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <div className="truncate max-w-[200px]" title={material.name}>
                        {material.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-right">
                      {material.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-center">
                      {material.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-right">
                      {material.rate ? `LKR ${material.rate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-right">
                      {material.amount ? `LKR ${material.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'}
                    </td>
                  </tr>
                ))}
                
                {/* Total row */}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    Total
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    LKR {totalMaterialCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No materials defined</p>
              <p className="text-gray-400 text-sm">Materials will appear here when added to this step</p>
            </div>
          )}
        </motion.div>

          {/* Budget Summary */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                <FiDollarSign className="w-5 h-5 text-green-600" />
              </div>
              Budget Summary
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="text-sm font-medium text-blue-700">Expected Budget</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  LKR {step.expected_budget?.toLocaleString() || '0'}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <div className="text-sm font-medium text-purple-700">Actual Cost (Materials)</div>
                <div className="text-2xl font-bold text-purple-900 mt-1">
                  LKR {totalMaterialCost.toLocaleString()}
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border ${
                budgetVariance > 0 
                  ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' 
                  : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
              }`}>
                <div className={`text-sm font-medium ${budgetVariance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  Budget Variance
                </div>
                <div className={`text-2xl font-bold mt-1 ${budgetVariance > 0 ? 'text-red-900' : 'text-green-900'}`}>
                  {budgetVariance > 0 ? '+' : ''}LKR {Math.abs(budgetVariance).toLocaleString()} 
                  <span className="text-lg">({Math.abs(budgetVariancePercent).toFixed(1)}%)</span>
                </div>
                <div className={`text-xs mt-1 ${budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {budgetVariance > 0 ? 'Over budget' : 'Under budget'}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <div className="text-sm font-medium text-gray-700">Current Status</div>
                <div className="flex items-center mt-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                    {getStepStatusIcon()}
                  </div>
                  <span className="font-semibold text-gray-900">{getStepStatusText()}</span>
                </div>
                {step.actual_completed && (
                  <div className="text-xs text-gray-600 mt-3 flex items-center bg-white/50 rounded-lg p-2">
                    <FiCalendar className="mr-2 w-4 h-4" /> 
                    Completed on: {new Date(step.actual_completed).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        
        {/* Bills Section */}
        <motion.div 
          className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
            <FiFileText className="mr-2 text-blue-600" /> Bills & Receipts
          </h2>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <form onSubmit={handleBillUpload} className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
              <div className="flex-grow">
                <input
                  type="file"
                  id="bill-upload"
                  onChange={handleFileChange}
                  accept=".pdf"
                  aria-label="Upload bill PDF"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              <button
                type="submit"
                disabled={!billFile || uploadingBill}
                className="px-4 py-2 bg-[#1b4965] text-white rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                {uploadingBill ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" /> Upload Bill
                  </>
                )}
              </button>
            </form>
          </div>
          
          {step.bills && step.bills.length > 0 ? (
            <div className="space-y-3">
              {step.bills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${bill.verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      <FiFileText className={`w-5 h-5 ${bill.verified ? 'text-green-600' : 'text-yellow-600'}`} />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Bill #{bill.id.substring(0, 8)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Uploaded on {new Date(bill.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                    {bill.verified && (
                      <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <a 
                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/media/${bill.pdf}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center text-sm"
                  >
                    <FiDownload className="mr-1" /> View
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiFileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No bills uploaded yet</p>
              <p className="text-sm">Upload bills to track expenses</p>
            </div>
          )}
        </motion.div>
        
        {/* Progress Logs Section */}
        <motion.div 
          className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
            <FiClock className="mr-2 text-blue-600" /> Progress Logs
          </h2>
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              {step.logs?.length || 0} updates from supervisors
            </div>
            <button
              onClick={() => setShowAddLogModal(true)}
              className="px-3 py-1.5 bg-[#1b4965] text-white text-sm rounded-md transition-colors flex items-center"
            >
              <FiUpload className="mr-1" /> Add Progress Update
            </button>
          </div>
          
          {/* Log filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setLogFilter('ALL')}
              className={`px-3 py-1 text-xs rounded-full ${
                logFilter === 'ALL' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              All Updates
            </button>
            <button
              onClick={() => setLogFilter('TEXT')}
              className={`px-3 py-1 text-xs rounded-full ${
                logFilter === 'TEXT' 
                  ? 'bg-gray-100 text-gray-800 border border-gray-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setLogFilter('PHOTO')}
              className={`px-3 py-1 text-xs rounded-full ${
                logFilter === 'PHOTO' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setLogFilter('VIDEO')}
              className={`px-3 py-1 text-xs rounded-full ${
                logFilter === 'VIDEO' 
                  ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Videos
            </button>
            
            <div className="ml-auto flex items-center">
              <span className="text-xs text-gray-500 mr-2">Sort:</span>
              <button
                onClick={() => setLogSort('newest')}
                className={`px-3 py-1 text-xs rounded-l-full ${
                  logSort === 'newest' 
                    ? 'bg-gray-200 text-gray-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setLogSort('oldest')}
                className={`px-3 py-1 text-xs rounded-r-full ${
                  logSort === 'oldest' 
                    ? 'bg-gray-200 text-gray-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Oldest
              </button>
            </div>
          </div>
          
          {step.logs && step.logs.length > 0 ? (
            <div className="space-y-6">
              {/* Show filtered logs count */}
              {(() => {
                const filteredCount = step.logs.filter(log => logFilter === 'ALL' || log.type === logFilter).length;
                if (filteredCount !== step.logs.length) {
                  return (
                    <div className="text-sm text-gray-500 mb-4">
                      Showing {filteredCount} of {step.logs.length} logs
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Display logs */}
              {step.logs
                .filter(log => logFilter === 'ALL' || log.type === logFilter)
                .sort((a, b) => {
                  const dateA = new Date(a.timestamp).getTime();
                  const dateB = new Date(b.timestamp).getTime();
                  return logSort === 'newest' ? dateB - dateA : dateA - dateB;
                })
                .map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{log.title}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        log.type === 'PHOTO' ? 'bg-blue-100 text-blue-800' : 
                        log.type === 'VIDEO' ? 'bg-purple-100 text-purple-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.type}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-700 mb-4">{log.description}</p>
                      
                      {/* Media attachments */}
                      {log.media && log.media.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {log.media.map((media) => (
                              <div key={media.id} className="relative h-32 bg-gray-100 rounded-md overflow-hidden">
                                {media.type === 'image' ? (
                                  <Image
                                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`}
                                    alt={media.filename}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                      <FiFileText className="w-8 h-8 text-gray-400 mx-auto" />
                                      <p className="text-xs text-gray-500 mt-1 truncate px-2">{media.filename}</p>
                                    </div>
                                  </div>
                                )}
                                <a 
                                  href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity"
                                >
                                  <FiDownload className="text-white opacity-0 hover:opacity-100 w-6 h-6" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FiClock className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No progress logs available</p>
              <p className="text-sm">The supervisor has not added any progress updates yet</p>
            </div>
          )}
        </motion.div>

        </div>

        {/* Full Width Analytics Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <FiBarChart2 className="w-5 h-5 text-blue-600" />
              </div>
              Step Analytics & Timeline
            </h2>
          </div>
          
          <div className="p-6">
            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Bills Analytics */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiFileText className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-green-900">{billsTotal}</span>
                </div>
                <div className="text-sm font-medium text-green-700">Bills Uploaded</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-green-600">{verifiedBills} verified</span>
                  <span className="text-xs text-green-600">
                    {billsTotal > 0 ? Math.round((verifiedBills / billsTotal) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-green-200 rounded-full">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500" 
                    style={{ width: `${billsTotal > 0 ? (verifiedBills / billsTotal) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Progress Analytics */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiCheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-900">{progressPercentage}%</span>
                </div>
                <div className="text-sm font-medium text-blue-700">Step Progress</div>
                <div className="text-xs text-blue-600 mt-2">{getStepStatusText()}</div>
                <div className="mt-2 h-2 bg-blue-200 rounded-full">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPercentage === 100 ? 'bg-green-500' : 
                      progressPercentage >= 75 ? 'bg-blue-500' : 
                      progressPercentage >= 50 ? 'bg-yellow-500' : 
                      'bg-gray-400'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Budget Analytics */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className={`text-2xl font-bold ${budgetVariance > 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {Math.abs(budgetVariancePercent).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm font-medium text-purple-700">Budget Variance</div>
                <div className={`text-xs mt-2 ${budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {budgetVariance > 0 ? 'Over budget' : 'Under budget'}
                </div>
                <div className="mt-2 h-2 bg-purple-200 rounded-full">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetVariance > 0 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(Math.abs(budgetVariancePercent), 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Materials Analytics */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-2xl font-bold text-orange-900">{materials.length}</span>
                </div>
                <div className="text-sm font-medium text-orange-700">Materials</div>
                <div className="text-xs text-orange-600 mt-2">
                  LKR {totalMaterialCost.toLocaleString()} total
                </div>
                <div className="mt-2 h-2 bg-orange-200 rounded-full">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: materials.length > 0 ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Enhanced Timeline Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <FiClock className="w-5 h-5 mr-2 text-gray-600" />
                Step Timeline & Progress History
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Timeline Events */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Timeline Events</h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-4 w-4 rounded-full bg-green-500 mt-1"></div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Step Created</div>
                        <div className="text-xs text-gray-500">Project initialization</div>
                      </div>
                    </div>
                    
                    {/* Progress logs in timeline */}
                    {step.logs && step.logs.length > 0 && step.logs.slice(0, 3).map((log) => (
                      <div key={log.id} className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-400 mt-1"></div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Progress Update</div>
                          <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">{log.title}</div>
                        </div>
                      </div>
                    ))}
                    
                    {step.actual_completed && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-500 mt-1"></div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Work Completed</div>
                          <div className="text-xs text-gray-500">{new Date(step.actual_completed).toLocaleDateString()}</div>
                        </div>
                      </div>
                    )}
                    
                    {step.is_approved && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-purple-500 mt-1"></div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Admin Approved</div>
                          <div className="text-xs text-gray-500">Step verified and completed</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Progress Timeline */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Progress Visualization</h4>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="relative">
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-2 bg-gray-200 rounded-full"></div>
                      <div 
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000" 
                        style={{ 
                          width: `${step.is_approved ? '100%' : step.actual_completed ? '75%' : step.logs?.length ? '50%' : '25%'}%` 
                        }}
                      ></div>
                      
                      <div className="relative flex justify-between">
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                            step.logs?.length || step.actual_completed || step.is_approved ? 'bg-blue-500' : 'bg-blue-500'
                          }`}></div>
                          <span className="text-xs mt-2 text-gray-600 font-medium">Created</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                            step.logs?.length || step.actual_completed || step.is_approved ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs mt-2 text-gray-600 font-medium">In Progress</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                            step.actual_completed || step.is_approved ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs mt-2 text-gray-600 font-medium">Completed</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                            step.is_approved ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs mt-2 text-gray-600 font-medium">Approved</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Indicators */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                        <span className="text-xs text-gray-600">Created</span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        <span className="text-xs text-gray-600">In Progress</span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        <span className="text-xs text-gray-600">Completed</span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-xs text-gray-600">Approved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Materials Breakdown */}
              {materials.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Top Materials by Cost</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials
                      .filter(material => material.amount && material.amount > 0)
                      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
                      .slice(0, 6)
                      .map((material, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">
                              {material.name}
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              LKR {material.amount?.toFixed(2)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{material.quantity} {material.unit}</span>
                            <span>LKR {material.rate?.toFixed(2)}/unit</span>
                          </div>
                          <div className="mt-2 h-1.5 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ 
                                width: `${totalMaterialCost > 0 ? ((material.amount || 0) / totalMaterialCost) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {materials.length > 6 && (
                    <div className="text-center mt-4">
                      <span className="text-sm text-gray-500">
                        + {materials.length - 6} more materials
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Approve Step Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Approve Step</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to approve this step as completed? This action marks the step as verified and completes it in the project workflow.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                disabled={approving}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveStep}
                disabled={approving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                {approving ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Approving...
                  </>
                ) : (
                  <>Approve</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Add Progress Log Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Progress Update</h3>
            
            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label htmlFor="log-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="log-title"
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief title for the update"
                />
              </div>
              
              <div>
                <label htmlFor="log-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="log-description"
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed description of the progress made"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="log-media" className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Media (Optional)
                </label>
                <input
                  type="file"
                  id="log-media"
                  onChange={handleLogMediaChange}
                  accept="image/*,video/*"
                  aria-label="Upload media attachment"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPEG, PNG, GIF, MP4, MOV
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  disabled={addingLog}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingLog || !logTitle || !logDescription}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  {addingLog ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>Submit</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 