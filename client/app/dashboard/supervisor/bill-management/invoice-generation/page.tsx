"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { parseBillData, validateOCRResult } from "@/app/utils/ocrUtils";
import { fetchWithAuth } from "@/app/utils/auth";
import {
  RiFilePdfLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiEditLine,
  RiSendPlaneLine,
  RiArrowLeftLine,
  RiEyeLine,
  RiDownloadLine,
} from "react-icons/ri";

interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
  wordCount: number;
  pageCount: number;
  pages: Array<{
    pageNumber: number;
    text: string;
    confidence: number;
  }>;
}

interface ParsedBillData {
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  total: number;
  subtotal: number;
  tax: number;
  invoiceNumber?: string;
  date?: string;
  vendor?: string;
  project?: string;
  step?: string;
  client?: string;
}

interface InvoiceData {
  billId: string;
  projectId: string;
  stepId: string;
  invoiceNumber: string;
  date: string;
  vendor: string;
  client: string;
  project: string;
  step: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  ocrConfidence: number;
  ocrText: string;
  status: 'processing' | 'editing' | 'verified' | 'sent';
}

export default function InvoiceGenerationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billId = searchParams.get('billId');
  const projectId = searchParams.get('projectId');
  const stepId = searchParams.get('stepId');

  const [currentStep, setCurrentStep] = useState<'processing' | 'editing' | 'verification'>('processing');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [parsedData, setParsedData] = useState<ParsedBillData | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [status, setStatus] = useState({
    currentPage: 0,
    totalPages: 0,
    currentStep: "",
    progress: 0,
  });

  useEffect(() => {
    if (billId && projectId && stepId) {
      startOCRProcessing();
    } else {
      setError("Missing required parameters. Please go back and try again.");
    }
  }, [billId, projectId, stepId]);

  const startOCRProcessing = async () => {
    if (!billId) return;

    setIsProcessing(true);
    setError(null);
    setStatus({
      currentPage: 0,
      totalPages: 0,
      currentStep: "Fetching bill data...",
      progress: 0,
    });

    try {
      // Step 1: Fetch bill data
      setStatus(prev => ({ ...prev, currentStep: "Fetching bill data...", progress: 10 }));
      const billResponse = await fetchWithAuth(`/projects/bills/${billId}/`);
      if (!billResponse.ok) {
        throw new Error("Failed to fetch bill data");
      }
      const billData = await billResponse.json();

      // Step 2: Process PDF with OCR
      setStatus(prev => ({ ...prev, currentStep: "Processing PDF with OCR...", progress: 20 }));
      
      // Create a File object from the bill's PDF URL
      const pdfResponse = await fetch(billData.bill_file);
      const pdfBlob = await pdfResponse.blob();
      const pdfFile = new File([pdfBlob], 'bill.pdf', { type: 'application/pdf' });

      // Process with OCR using our utility functions
      const { convertPDFToImages, processImageWithOCR } = await import("@/app/utils/ocrUtils");
      
      setStatus(prev => ({ ...prev, currentStep: "Converting PDF to images...", progress: 30 }));
      const images = await convertPDFToImages(pdfFile, 2.0, (progress) => {
        setStatus(prev => ({
          ...prev,
          currentStep: progress.currentStep,
          currentPage: progress.currentPage,
          totalPages: progress.totalPages,
          progress: 30 + (progress.progress * 0.4), // 30-70% for PDF conversion
        }));
      });

      setStatus(prev => ({ ...prev, currentStep: "Processing images with OCR...", progress: 70 }));
      const pageResults = [];
      let totalConfidence = 0;

      for (let i = 0; i < images.length; i++) {
        setStatus(prev => ({
          ...prev,
          currentStep: `Processing page ${i + 1} of ${images.length} with OCR...`,
          currentPage: i + 1,
          progress: 70 + ((i + 1) / images.length) * 20, // 70-90% for OCR
        }));

        const result = await processImageWithOCR(images[i], i + 1);
        pageResults.push({
          pageNumber: i + 1,
          text: result.text,
          confidence: result.confidence,
        });
        totalConfidence += result.confidence;
      }

      // Step 3: Parse the OCR text
      setStatus(prev => ({ ...prev, currentStep: "Parsing invoice data...", progress: 90 }));
      const combinedText = pageResults.map(page => 
        `--- Page ${page.pageNumber} ---\n${page.text}\n`
      ).join("\n");

      const parsed = parseBillData(combinedText);
      setParsedData(parsed);

      const processingTime = (Date.now() - Date.now()) / 1000; // This would be calculated properly
      const averageConfidence = totalConfidence / pageResults.length;

      const ocrResult: OCRResult = {
        text: combinedText,
        confidence: Math.round(averageConfidence * 100) / 100,
        processingTime: processingTime,
        wordCount: combinedText.split(/\s+/).filter(word => word.length > 0).length,
        pageCount: images.length,
        pages: pageResults,
      };

      setOcrResult(ocrResult);

      // Step 4: Create initial invoice data
      const invoiceData: InvoiceData = {
        billId: billId,
        projectId: projectId!,
        stepId: stepId!,
        invoiceNumber: parsed.invoiceNumber || `INV-${Date.now()}`,
        date: parsed.date || new Date().toLocaleDateString(),
        vendor: parsed.vendor || "SAAN Excellence Engineering PVT LTD",
        client: parsed.client || "Client Name",
        project: parsed.project || "Project Name",
        step: parsed.step || "Step Name",
        items: parsed.items,
        subtotal: parsed.subtotal,
        tax: parsed.tax,
        total: parsed.total,
        ocrConfidence: ocrResult.confidence,
        ocrText: ocrResult.text,
        status: 'editing'
      };

      setInvoiceData(invoiceData);
      setCurrentStep('editing');
      setStatus(prev => ({ ...prev, currentStep: "OCR processing completed!", progress: 100 }));

    } catch (err) {
      console.error("OCR processing error:", err);
      setError(err instanceof Error ? err.message : "Failed to process PDF with OCR");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateInvoiceData = (field: string, value: any) => {
    setInvoiceData(prev => {
      if (!prev) return prev;
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof InvoiceData] as Record<string, any>),
            [child]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    setInvoiceData(prev => {
      if (!prev) return prev;
      
      const updatedItems = prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      );
      
      // Recalculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.18; // Assuming 18% tax
      const total = subtotal + tax;
      
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        tax,
        total
      };
    });
  };

  const addItem = () => {
    setInvoiceData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        items: [...prev.items, { description: "New Item", quantity: 1, rate: 0, amount: 0 }]
      };
    });
  };

  const removeItem = (index: number) => {
    setInvoiceData(prev => {
      if (!prev) return prev;
      
      const updatedItems = prev.items.filter((_, i) => i !== index);
      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.18;
      const total = subtotal + tax;
      
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        tax,
        total
      };
    });
  };

  const handleSendToAdmin = async () => {
    if (!invoiceData) return;

    setIsSaving(true);
    try {
      const response = await fetchWithAuth('/projects/invoices/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...invoiceData,
          status: 'sent'
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invoice to admin");
      }

      // Redirect back to bill management
      router.push('/dashboard/supervisor/bill-management?success=invoice_sent');
    } catch (err) {
      console.error("Error sending invoice:", err);
      setError(err instanceof Error ? err.message : "Failed to send invoice to admin");
    } finally {
      setIsSaving(false);
    }
  };

  if (!billId || !projectId || !stepId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <RiErrorWarningLine className="text-red-600 text-lg" />
              <div>
                <h3 className="font-semibold text-red-900">Missing Parameters</h3>
                <p className="text-red-800">Required parameters are missing. Please go back and try again.</p>
                <button
                  onClick={() => router.push('/dashboard/supervisor/bill-management')}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
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
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white via-[#f0f6ff] to-white rounded-2xl p-6 shadow border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard/supervisor/bill-management')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RiArrowLeftLine className="text-gray-600 text-lg" />
              </button>
              <div className="p-2 bg-gradient-to-br from-[#e3f0ff] to-[#cbeafe] rounded-xl">
                <RiFilePdfLine className="text-[#1b4965] text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1b4965]">Invoice Generation</h1>
                <p className="text-gray-600">OCR Processing & Invoice Creation</p>
              </div>
            </div>
            
            {currentStep === 'editing' && invoiceData && (
              <div className="flex items-center gap-2 text-green-600">
                <RiCheckLine className="text-lg" />
                <span className="text-sm font-medium">OCR Complete ({invoiceData.ocrConfidence}% confidence)</span>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                currentStep === 'processing' ? 'bg-blue-100 text-blue-800' : 
                currentStep === 'editing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <RiLoader4Line className={`text-sm ${currentStep === 'processing' ? 'animate-spin' : ''}`} />
                OCR Processing
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                currentStep === 'editing' ? 'bg-blue-100 text-blue-800' : 
                currentStep === 'verification' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <RiEditLine className="text-sm" />
                Edit Invoice
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                currentStep === 'verification' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <RiSendPlaneLine className="text-sm" />
                Send to Admin
              </div>
            </div>
          </div>
        </motion.div>

        {/* Processing Status */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-[#1b4965] mb-4">Processing Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <RiLoader4Line className="text-blue-600 text-lg animate-spin" />
                <span className="text-gray-700">{status.currentStep}</span>
              </div>
              
              {status.totalPages > 0 && (
                <div className="text-sm text-gray-600">
                  Page {status.currentPage} of {status.totalPages}
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(status.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#1b4965] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${status.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-3">
              <RiErrorWarningLine className="text-red-600 text-lg" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* OCR Results Summary */}
        {ocrResult && currentStep === 'editing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-[#1b4965] mb-4">OCR Processing Results</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Pages Processed</p>
                <p className="text-2xl font-bold text-blue-900">{ocrResult.pageCount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Confidence</p>
                <p className="text-2xl font-bold text-green-900">{ocrResult.confidence}%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Processing Time</p>
                <p className="text-2xl font-bold text-purple-900">{ocrResult.processingTime}s</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Word Count</p>
                <p className="text-2xl font-bold text-orange-900">{ocrResult.wordCount}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Editable Invoice Form */}
        {currentStep === 'editing' && invoiceData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Invoice Header */}
            <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
              <h3 className="text-lg font-semibold text-[#1b4965] mb-4">Invoice Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => updateInvoiceData('invoiceNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="text"
                      value={invoiceData.date}
                      onChange={(e) => updateInvoiceData('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                    <input
                      type="text"
                      value={invoiceData.vendor}
                      onChange={(e) => updateInvoiceData('vendor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <input
                      type="text"
                      value={invoiceData.client}
                      onChange={(e) => updateInvoiceData('client', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <input
                      type="text"
                      value={invoiceData.project}
                      onChange={(e) => updateInvoiceData('project', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Step</label>
                    <input
                      type="text"
                      value={invoiceData.step}
                      onChange={(e) => updateInvoiceData('step', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1b4965]">Line Items</h3>
                <button
                  onClick={addItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Item
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoiceData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1b4965]"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseFloat(e.target.value);
                              const amount = qty * item.rate;
                              updateItem(index, 'quantity', qty);
                              updateItem(index, 'amount', amount);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1b4965]"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => {
                              const rate = parseFloat(e.target.value);
                              const amount = item.quantity * rate;
                              updateItem(index, 'rate', rate);
                              updateItem(index, 'amount', amount);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1b4965]"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <span className="font-medium">${item.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Subtotal: ${invoiceData.subtotal.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Tax: ${invoiceData.tax.toFixed(2)}</p>
                  <p className="text-lg font-bold text-[#1b4965]">Total: ${invoiceData.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>OCR Confidence: <span className="font-medium text-green-600">{invoiceData.ocrConfidence}%</span></p>
                  <p>Review and edit the invoice data before sending to admin.</p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/dashboard/supervisor/bill-management')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleSendToAdmin}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[#1b4965] text-white px-6 py-2 rounded-lg hover:bg-[#003049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RiSendPlaneLine className="text-lg" />
                    {isSaving ? "Sending..." : "Send to Admin"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
