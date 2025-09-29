"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/auth";
import {
  RiFileTextLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiMoneyDollarCircleLine,
  RiLoader4Line,
  RiArrowLeftLine,
  RiSearchLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiFileWarningLine,
} from "react-icons/ri";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  vendor: string;
  client: string;
  project: string;
  step: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'verified' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  ocrConfidence: number;
}

interface ProjectStepData {
  id: string;
  title: string;
  estimatedCost: number;
  estimatedDuration: number;
  materials: Array<{
    name: string;
    estimatedQuantity: number;
    estimatedRate: number;
    estimatedAmount: number;
  }>;
  labor: Array<{
    type: string;
    estimatedHours: number;
    estimatedRate: number;
    estimatedAmount: number;
  }>;
}

interface VerificationResult {
  item: string;
  type: 'material' | 'labor' | 'other';
  invoiceQuantity: number;
  estimatedQuantity: number;
  invoiceRate: number;
  estimatedRate: number;
  invoiceAmount: number;
  estimatedAmount: number;
  quantityVariance: number;
  rateVariance: number;
  amountVariance: number;
  status: 'match' | 'warning' | 'error';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export default function InvoiceVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [projectStepData, setProjectStepData] = useState<ProjectStepData | null>(null);
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Sample invoice data (same as in the main page)
  const sampleInvoice: Invoice = {
    id: "inv-001",
    invoiceNumber: "INV-2024-001",
    date: "2024-01-15",
    vendor: "SAAN Excellence Engineering PVT LTD",
    client: "ABC Construction Ltd",
    project: "Modern Residential Construction",
    step: "Foundation Work",
    items: [
      {
        description: "Concrete Foundation (Grade 30)",
        quantity: 25,
        rate: 15000,
        amount: 375000
      },
      {
        description: "Steel Reinforcement (Grade 60)",
        quantity: 2.5,
        rate: 120000,
        amount: 300000
      },
      {
        description: "Labor for Foundation Work",
        quantity: 8,
        rate: 25000,
        amount: 200000
      }
    ],
    subtotal: 875000,
    tax: 157500,
    total: 1032500,
    status: 'pending',
    submittedBy: "John Supervisor",
    submittedAt: "2024-01-15T10:30:00Z",
    ocrConfidence: 94.5
  };

  // Sample project step data for comparison
  const sampleProjectStepData: ProjectStepData = {
    id: "step-001",
    title: "Foundation Work",
    estimatedCost: 950000,
    estimatedDuration: 7,
    materials: [
      {
        name: "Concrete Foundation (Grade 30)",
        estimatedQuantity: 22,
        estimatedRate: 14000,
        estimatedAmount: 308000
      },
      {
        name: "Steel Reinforcement (Grade 60)",
        estimatedQuantity: 2.2,
        estimatedRate: 110000,
        estimatedAmount: 242000
      }
    ],
    labor: [
      {
        type: "Labor for Foundation Work",
        estimatedHours: 7,
        estimatedRate: 22000,
        estimatedAmount: 154000
      }
    ]
  };

  useEffect(() => {
    // Load sample data for demonstration
    setInvoice(sampleInvoice);
    setProjectStepData(sampleProjectStepData);
    setLoading(false);
  }, [invoiceId]);

  const performVerification = async () => {
    if (!invoice || !projectStepData) return;

    setVerifying(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const results: VerificationResult[] = [];

    // Verify each invoice item against project step data
    invoice.items.forEach(invoiceItem => {
      // Find matching item in project data
      const materialMatch = projectStepData.materials.find(m => 
        m.name.toLowerCase().includes(invoiceItem.description.toLowerCase()) ||
        invoiceItem.description.toLowerCase().includes(m.name.toLowerCase())
      );
      
      const laborMatch = projectStepData.labor.find(l => 
        l.type.toLowerCase().includes(invoiceItem.description.toLowerCase()) ||
        invoiceItem.description.toLowerCase().includes(l.type.toLowerCase())
      );

      const match = materialMatch || laborMatch;
      
      if (match) {
        const estimatedQuantity = 'estimatedQuantity' in match ? match.estimatedQuantity : match.estimatedHours;
        const quantityVariance = ((invoiceItem.quantity - estimatedQuantity) / estimatedQuantity) * 100;
        const rateVariance = ((invoiceItem.rate - match.estimatedRate) / match.estimatedRate) * 100;
        const amountVariance = ((invoiceItem.amount - match.estimatedAmount) / match.estimatedAmount) * 100;

        let status: 'match' | 'warning' | 'error' = 'match';
        let severity: 'low' | 'medium' | 'high' = 'low';
        let message = '';

        // Determine status based on variances
        if (Math.abs(quantityVariance) > 20 || Math.abs(rateVariance) > 15 || Math.abs(amountVariance) > 25) {
          status = 'error';
          severity = 'high';
          message = 'Significant variance detected - requires review';
        } else if (Math.abs(quantityVariance) > 10 || Math.abs(rateVariance) > 8 || Math.abs(amountVariance) > 15) {
          status = 'warning';
          severity = 'medium';
          message = 'Moderate variance - verify quantities and rates';
        } else {
          message = 'Within acceptable variance range';
        }

        results.push({
          item: invoiceItem.description,
          type: materialMatch ? 'material' : 'labor',
          invoiceQuantity: invoiceItem.quantity,
          estimatedQuantity: estimatedQuantity,
          invoiceRate: invoiceItem.rate,
          estimatedRate: match.estimatedRate,
          invoiceAmount: invoiceItem.amount,
          estimatedAmount: match.estimatedAmount,
          quantityVariance,
          rateVariance,
          amountVariance,
          status,
          severity,
          message
        });
      } else {
        // No match found - this is a new item
        results.push({
          item: invoiceItem.description,
          type: 'other',
          invoiceQuantity: invoiceItem.quantity,
          estimatedQuantity: 0,
          invoiceRate: invoiceItem.rate,
          estimatedRate: 0,
          invoiceAmount: invoiceItem.amount,
          estimatedAmount: 0,
          quantityVariance: 0,
          rateVariance: 0,
          amountVariance: 0,
          status: 'warning',
          severity: 'medium',
          message: 'Item not found in project estimates - verify if this is an additional expense'
        });
      }
    });

    setVerificationResults(results);
    setShowSummary(true);
    setVerifying(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'match':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'match':
        return <RiCheckboxCircleLine className="text-green-600" />;
      case 'warning':
        return <RiFileWarningLine className="text-yellow-600" />;
      case 'error':
        return <RiErrorWarningLine className="text-red-600" />;
      default:
        return <RiInformationLine className="text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <RiLoader4Line className="text-4xl text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading verification data...</p>
        </div>
      </div>
    );
  }

  if (!invoice || !projectStepData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <RiErrorWarningLine className="text-4xl text-red-600 mx-auto mb-4" />
          <p className="text-red-600">Invoice or project data not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RiArrowLeftLine className="text-gray-600 text-lg" />
              </button>
              <div className="p-2 bg-gradient-to-br from-[#e3f0ff] to-[#cbeafe] rounded-xl">
                <RiSearchLine className="text-[#1b4965] text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1b4965]">Invoice Verification</h1>
                <p className="text-gray-600">Verify invoice against project estimates</p>
              </div>
            </div>
            
            <button
              onClick={performVerification}
              disabled={verifying}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <>
                  <RiLoader4Line className="text-lg animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <RiSearchLine className="text-lg" />
                  Start Verification
                </>
              )}
            </button>
          </div>

          {/* Invoice Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Invoice</p>
              <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Project</p>
              <p className="font-semibold text-gray-900">{invoice.project}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-semibold text-gray-900">{formatCurrency(invoice.total)}</p>
            </div>
          </div>
        </motion.div>

        {/* Verification Results */}
        <AnimatePresence>
          {showSummary && verificationResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary Stats */}
              <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                <h3 className="text-lg font-semibold text-[#1b4965] mb-4">Verification Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Matched Items</p>
                    <p className="text-2xl font-bold text-green-900">
                      {verificationResults.filter(r => r.status === 'match').length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600 font-medium">Warnings</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {verificationResults.filter(r => r.status === 'warning').length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Errors</p>
                    <p className="text-2xl font-bold text-red-900">
                      {verificationResults.filter(r => r.status === 'error').length}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Total Items</p>
                    <p className="text-2xl font-bold text-blue-900">{verificationResults.length}</p>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                <h3 className="text-lg font-semibold text-[#1b4965] mb-4">Detailed Verification Results</h3>
                
                <div className="space-y-4">
                  {verificationResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <h4 className="font-semibold text-gray-900">{result.item}</h4>
                            <p className="text-sm text-gray-600 capitalize">{result.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(result.status)}`}>
                            {result.status.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(result.severity)}`}>
                            {result.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Quantity</p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{result.invoiceQuantity}</span>
                            <span className="text-gray-400">vs</span>
                            <span className="text-gray-600">{result.estimatedQuantity}</span>
                            {result.quantityVariance !== 0 && (
                              <span className={`text-sm ${result.quantityVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ({result.quantityVariance > 0 ? '+' : ''}{result.quantityVariance.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Rate</p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatCurrency(result.invoiceRate)}</span>
                            <span className="text-gray-400">vs</span>
                            <span className="text-gray-600">{formatCurrency(result.estimatedRate)}</span>
                            {result.rateVariance !== 0 && (
                              <span className={`text-sm ${result.rateVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ({result.rateVariance > 0 ? '+' : ''}{result.rateVariance.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatCurrency(result.invoiceAmount)}</span>
                            <span className="text-gray-400">vs</span>
                            <span className="text-gray-600">{formatCurrency(result.estimatedAmount)}</span>
                            {result.amountVariance !== 0 && (
                              <span className={`text-sm ${result.amountVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ({result.amountVariance > 0 ? '+' : ''}{result.amountVariance.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{result.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {!showSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow border border-gray-100"
          >
            <div className="text-center">
              <RiSearchLine className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Verify Invoice</h3>
              <p className="text-gray-600 mb-4">
                Click "Start Verification" to compare this invoice against the project estimates and identify any discrepancies.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
                <h4 className="font-semibold text-blue-900 mb-2">What will be checked:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Quantity variances (more/less than estimated)</li>
                  <li>Rate differences (higher/lower than estimated)</li>
                  <li>Total amount discrepancies</li>
                  <li>New items not in original estimates</li>
                  <li>Overall cost overruns or savings</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
