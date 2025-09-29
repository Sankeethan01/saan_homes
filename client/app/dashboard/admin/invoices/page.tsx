"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/auth";
import { 
  RiFileTextLine, 
  RiRefreshLine, 
  RiEyeLine, 
  RiCheckLine, 
  RiCloseLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiUserLine,
  RiBuildingLine,
  RiFilePdfLine,
  RiDownloadLine,
  RiEditLine
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
  pdfUrl?: string;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const router = useRouter();

  // Default sample invoice for demonstration
  const defaultInvoice: Invoice = {
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
    ocrConfidence: 94.5,
    pdfUrl: "/sample-invoice.pdf"
  };

  // Always show the default invoice as a static invoice
  useEffect(() => {
    setInvoices([defaultInvoice]);
    setLoading(false);
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/projects/invoices/');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const data = await response.json();
      setInvoices(data.results || data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      // If API fails, keep showing the static invoice
      setInvoices([defaultInvoice]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleOpenInNewPage = (invoice: Invoice) => {
    // Open invoice in new page/tab
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .invoice-details { margin-bottom: 20px; }
              .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: #f2f2f2; }
              .total-section { text-align: right; margin-top: 20px; }
              .status { padding: 5px 10px; border-radius: 5px; color: white; }
              .status.pending { background-color: #f59e0b; }
              .status.verified { background-color: #10b981; }
              .status.rejected { background-color: #ef4444; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>INVOICE</h1>
              <h2>${invoice.invoiceNumber}</h2>
            </div>
            
            <div class="invoice-details">
              <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
              <p><strong>Vendor:</strong> ${invoice.vendor}</p>
              <p><strong>Client:</strong> ${invoice.client}</p>
              <p><strong>Project:</strong> ${invoice.project}</p>
              <p><strong>Step:</strong> ${invoice.step}</p>
              <p><strong>Submitted by:</strong> ${invoice.submittedBy}</p>
              <p><strong>Status:</strong> <span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span></p>
              <p><strong>OCR Confidence:</strong> ${invoice.ocrConfidence}%</p>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>LKR ${item.rate.toLocaleString()}</td>
                    <td>LKR ${item.amount.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              <p><strong>Subtotal: LKR ${invoice.subtotal.toLocaleString()}</strong></p>
              <p><strong>Tax: LKR ${invoice.tax.toLocaleString()}</strong></p>
              <p><strong>Total: LKR ${invoice.total.toLocaleString()}</strong></p>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleVerifyInvoice = async (invoice: Invoice) => {
    // Open verification page in new tab
    const verificationUrl = `/dashboard/admin/invoices/verify/${invoice.id}`;
    window.open(verificationUrl, '_blank');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#e3f0ff] to-[#cbeafe] rounded-xl">
                <RiFileTextLine className="text-[#1b4965] text-xl" />
                        </div>
                        <div>
                <h1 className="text-2xl font-bold text-[#1b4965]">Invoice Management</h1>
                <p className="text-gray-600">Review and approve invoices from supervisors</p>
                <p className="text-sm text-blue-600 mt-1">📄 Static invoice displayed for demonstration</p>
        </div>
      </div>

                <button
              onClick={() => {
                // Just refresh the static invoice for now
                setInvoices([defaultInvoice]);
              }}
              className="flex items-center gap-2 bg-[#1b4965] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                >
              <RiRefreshLine className="text-lg" />
              Refresh
                </button>
            </div>

          {loading ? (
            <div className="p-8 text-center">
              <RiRefreshLine className="text-4xl text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading invoices...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.length > 0 ? (
                invoices.map((invoice, index) => (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <RiFileTextLine className="text-blue-600 text-lg" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {invoice.invoiceNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {invoice.vendor} → {invoice.client}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <RiCalendarLine className="text-gray-400" />
                            <span>{formatDate(invoice.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RiBuildingLine className="text-gray-400" />
                            <span>{invoice.project}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RiUserLine className="text-gray-400" />
                            <span>{invoice.submittedBy}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RiMoneyDollarCircleLine className="text-gray-400" />
                            <span className="font-semibold">{formatCurrency(invoice.total)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
                          {invoice.status.toUpperCase()}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Invoice Details"
                          >
                            <RiEyeLine className="text-lg" />
                          </button>
                          
                          <button
                            onClick={() => handleOpenInNewPage(invoice)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            title="Open in New Page"
                          >
                            <RiFilePdfLine className="text-sm" />
                            Open
                          </button>

                          <button
                            onClick={() => handleVerifyInvoice(invoice)}
                            className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            title="Verify Invoice"
                          >
                            <RiCheckLine className="text-sm" />
                            Verify
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <RiFileTextLine className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices Found</h3>
                  <p className="text-gray-600">No invoices have been submitted yet.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Invoice Detail Modal */}
        <AnimatePresence>
          {showInvoiceModal && selectedInvoice && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#1b4965] to-[#003049] rounded-xl">
                        <RiFileTextLine className="text-white text-xl" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#1b4965]">
                          {selectedInvoice.invoiceNumber}
                        </h2>
                        <p className="text-sm text-gray-600">Invoice Details</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowInvoiceModal(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RiCloseLine className="text-xl" />
                    </button>
                  </div>

                  {/* Invoice Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <p className="text-gray-900">{formatDate(selectedInvoice.date)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                        <p className="text-gray-900">{selectedInvoice.vendor}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                        <p className="text-gray-900">{selectedInvoice.client}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                        <p className="text-gray-900">{selectedInvoice.project}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Step</label>
                        <p className="text-gray-900">{selectedInvoice.step}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
                        <p className="text-gray-900">{selectedInvoice.submittedBy}</p>
                      </div>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-[#1b4965] mb-4">Line Items</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedInvoice.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.rate)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <div className="flex justify-end">
                      <div className="text-right space-y-2">
                        <div className="flex justify-between gap-8">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-medium">{formatCurrency(selectedInvoice.tax)}</span>
                        </div>
                        <div className="flex justify-between gap-8 border-t border-gray-300 pt-2">
                          <span className="text-lg font-semibold text-[#1b4965]">Total:</span>
                          <span className="text-lg font-bold text-[#1b4965]">{formatCurrency(selectedInvoice.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OCR Information */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <RiFilePdfLine className="text-blue-600" />
                      <span className="font-medium text-blue-900">OCR Processing Information</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      This invoice was processed using advanced OCR technology with {selectedInvoice.ocrConfidence}% confidence.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleOpenInNewPage(selectedInvoice)}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <RiFilePdfLine className="text-lg" />
                        Open in New Page
                      </button>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowInvoiceModal(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                      
                      {selectedInvoice.status === 'pending' && (
                        <button
                          onClick={() => handleVerifyInvoice(selectedInvoice)}
                          disabled={verifying}
                          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {verifying ? (
                            <>
                              <RiRefreshLine className="text-lg animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <RiCheckLine className="text-lg" />
                              Verify Invoice
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400 max-w-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-400 rounded-lg">
                    <RiCheckLine className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">Success!</h4>
                    <p className="text-green-100 text-sm">
                      Invoice verified successfully!
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSuccessToast(false)}
                    className="p-1 hover:bg-green-400 rounded-lg transition-colors"
                  >
                    <RiCloseLine className="text-lg" />
                  </button>
                </div>
                <div className="mt-3 bg-green-400 rounded-full h-1">
                  <motion.div
                    className="bg-white h-1 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 