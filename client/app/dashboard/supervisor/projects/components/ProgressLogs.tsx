"use client";

import { useState, useEffect, useRef } from "react";
import {
  RiFileTextLine,
  RiCameraLine,
  RiVideoLine,
  RiDownloadLine,
  RiCheckLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
} from "react-icons/ri";
import { fetchWithAuth } from "@/app/utils/auth";
import SupervisorInvoiceModal from "./SupervisorInvoiceModal";
import InvoiceGenerationModal from "./InvoiceGenerationModal";

// PDF processing utilities
const extractBillDataFromPDF = async (file: File): Promise<any[]> => {
  try {
    // TODO: Implement real PDF extraction using pdfplumber or similar library
    // For production, you would:
    // 1. Install pdfplumber: npm install pdfplumber
    // 2. Use pdfplumber.open() to read the PDF
    // 3. Extract tables and text using pdf.pages[].extract_tables()
    // 4. Parse the extracted data to identify items, quantities, prices, etc.
    
    console.log('Processing PDF file:', file.name);
    
    // Simulate extracted data structure
    const extractedData = [
      {
        itemName: "Concrete Mix",
        description: "High-strength concrete mix for foundation",
        quantity: 50,
        unit: "bags",
        unitPrice: 15.50,
        total: 775.00
      },
      {
        itemName: "Steel Rebar",
        description: "Reinforcement steel bars",
        quantity: 200,
        unit: "pieces",
        unitPrice: 8.75,
        total: 1750.00
      },
      {
        itemName: "Labor",
        description: "Skilled labor for construction",
        quantity: 40,
        unit: "hours",
        unitPrice: 25.00,
        total: 1000.00
      }
    ];
    
    return extractedData;
  } catch (error) {
    console.error('Error extracting PDF data:', error);
    throw new Error('Failed to extract data from PDF');
  }
};

const generateInvoicePDF = (billData: any[], projectName: string, supervisorName: string, stepName: string): string => {
  try {
    // Calculate totals
    const subtotal = billData.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.15; // 15% tax
    const grandTotal = subtotal + tax;
    
    // Generate invoice HTML (you can convert this to PDF using jsPDF or similar)
    const invoiceHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">INVOICE</h1>
          <p style="margin: 5px 0; color: #666;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h3 style="margin: 0 0 10px 0; color: #333;">Project Details</h3>
            <p style="margin: 5px 0;"><strong>Project:</strong> ${projectName}</p>
            <p style="margin: 5px 0;"><strong>Step:</strong> ${stepName}</p>
            <p style="margin: 5px 0;"><strong>Supervisor:</strong> ${supervisorName}</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Invoice Summary</h3>
            <p style="margin: 5px 0;"><strong>Subtotal:</strong> Rs. ${subtotal.toLocaleString('en-IN')}</p>
            <p style="margin: 5px 0;"><strong>Tax (15%):</strong> Rs. ${tax.toLocaleString('en-IN')}</p>
            <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #2563eb;">
              <strong>Total:</strong> Rs. ${grandTotal.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Item</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Description</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">Qty</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">Unit</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">Unit Price</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${billData.map(item => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 12px;">${item.itemName}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">${item.description}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">${item.unit}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">Rs. ${item.unitPrice.toLocaleString('en-IN')}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">Rs. ${item.total.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 14px;">Thank you for your business!</p>
        </div>
      </div>
    `;
    
    return invoiceHTML;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice');
  }
};

interface ProjectStep {
  id: string;
  title: string;
  description: string;
  order: number;
  is_approved: boolean;
  actual_completed: string | null;
  expected_budget: number;
  progress: number; // Supervisor can adjust this
  status: string;
  logs: ProgressLog[];
  bills?: {
    id: string;
    ocr_data?: {
      total: number;
    };
    amount?: number;
    uploaded_at?: string;
  }[];
  invoice?: {
    id: string;
    is_approved: boolean;
    amount: number;
    description: string;
    created?: string;
    data?: {
      status: string;
      submitted_at?: string;
      invoice_number?: string;
      amount?: number;
      description?: string;
    };
  };
}

interface ProgressLog {
  id: string;
  stepId: string;
  title: string;
  description: string;
  media: MediaFile[];
  timestamp: string;
  type: "TEXT" | "PHOTO" | "VIDEO";
}

interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video" | "pdf";
  filename: string;
}

interface Project {
  id: string;
  name: string;
  steps: ProjectStep[];
  media_files?: any[];
}

export default function ProgressLogs({
  project,
  onMediaEdited,
}: {
  project: Project;
  onMediaEdited?: () => void;
}) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<any>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const [localSteps, setLocalSteps] = useState<ProjectStep[]>([]);
  const [modifiedSteps, setModifiedSteps] = useState<Set<string>>(new Set());
  const originalProgressRef = useRef<Map<string, number>>(new Map());
  const modifiedProgressRef = useRef<Map<string, number>>(new Map());
  
  // PDF and Invoice states
  const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
  const [extractedBillData, setExtractedBillData] = useState<any[]>([]);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<string | null>(null);
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  
  // New invoice generation modal state
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [selectedStepForInvoice, setSelectedStepForInvoice] = useState<any>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  // Initialize local steps state when project changes
  useEffect(() => {
    console.log('useEffect triggered, project.steps:', project.steps);
    if (project.steps) {
      const stepsCopy = [...project.steps];
      console.log('Setting local steps:', stepsCopy);
      
      // Store original progress values for reference
      stepsCopy.forEach(step => {
        if (!originalProgressRef.current.has(step.id)) {
          originalProgressRef.current.set(step.id, step.progress);
          console.log(`Stored original progress for step ${step.id}: ${step.progress}%`);
        }
      });
      
      // Preserve any locally modified progress values
      if (localSteps.length > 0 && modifiedSteps.size > 0) {
        console.log('Preserving local progress modifications:', modifiedSteps);
        stepsCopy.forEach(step => {
          if (modifiedSteps.has(step.id)) {
            const modifiedProgress = modifiedProgressRef.current.get(step.id);
            if (modifiedProgress !== undefined) {
              console.log(`Preserving progress for step ${step.id}: ${modifiedProgress}% (was ${step.progress}%)`);
              step.progress = modifiedProgress;
            }
          }
        });
      }
      
      setLocalSteps(stepsCopy);
    }
  }, [project.steps]); // Only depend on project.steps to prevent infinite loops
  
  // Debug effect to monitor localSteps changes
  useEffect(() => {
    console.log('localSteps updated:', localSteps);
  }, [localSteps]);

  // Force refresh local state to prevent parent from overwriting local changes
  const forceRefreshLocalState = () => {
    if (localSteps.length > 0 && modifiedSteps.size > 0) {
      console.log('Force refreshing local state to preserve modifications');
      setLocalSteps(prevSteps => {
        const updatedSteps = [...prevSteps];
        updatedSteps.forEach(step => {
          if (modifiedSteps.has(step.id)) {
            const originalProgress = originalProgressRef.current.get(step.id) || 0;
            if (step.progress === originalProgress) {
              // Progress was reset by parent, restore local modification
              console.log(`Restoring local progress for step ${step.id} from ${step.progress}% to preserved value`);
              // We'll need to track the actual modified value separately
            }
          }
        });
        return updatedSteps;
      });
    }
  };

  // Test function to update progress locally (for debugging)
  const testLocalProgressUpdate = (stepId: string, increment: number) => {
    console.log(`Test local progress update: stepId=${stepId}, increment=${increment}`);
    
    const currentStep = localSteps.find(s => s.id === stepId);
    if (!currentStep) return;
    
    const newProgress = Math.min(Math.max(currentStep.progress + increment, 0), 100);
    console.log(`Updating step ${stepId} progress from ${currentStep.progress}% to ${newProgress}%`);
    
    // Update local state
    setLocalSteps(prevSteps => 
      prevSteps.map(s => s.id === stepId ? { ...s, progress: newProgress } : s)
    );
    
    // Mark as modified
    setModifiedSteps(prev => new Set([...prev, stepId]));
    modifiedProgressRef.current.set(stepId, newProgress);
    
    console.log(`Step ${stepId} marked as modified with progress ${newProgress}%`);
  };

  // PDF Processing Functions
  const handlePDFSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedPDF(file);
      setExtractedBillData([]);
      setGeneratedInvoice(null);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const processPDFBill = async () => {
    if (!selectedPDF) return;
    
    setIsProcessingPDF(true);
    try {
      const billData = await extractBillDataFromPDF(selectedPDF);
      setExtractedBillData(billData);
      console.log('Extracted bill data:', billData);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Failed to process PDF. Please try again.');
    } finally {
      setIsProcessingPDF(false);
    }
  };

  const generateInvoiceFromBill = () => {
    if (extractedBillData.length === 0) return;
    
    try {
      const invoiceHTML = generateInvoicePDF(
        extractedBillData,
        project.name,
        'Supervisor Name', // You can get this from user context
        'Current Step' // You can get this from current step
      );
      setGeneratedInvoice(invoiceHTML);
      console.log('Invoice generated successfully');
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const downloadInvoice = () => {
    if (!generatedInvoice) return;
    
    // Create a blob and download the invoice
    const blob = new Blob([generatedInvoice], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${project.name}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 🔹 Update progress (slider, 10% increments)
  const handleProgressChange = async (stepId: string, value: number) => {
    console.log(`handleProgressChange called with stepId: ${stepId}, value: ${value}`);
    
    // Snap to nearest 10%
    const snappedValue = Math.round(value / 10) * 10;
    console.log(`Snapped value: ${snappedValue}%`);
    
    // Don't update if value hasn't changed
    const currentStep = localSteps.find(s => s.id === stepId);
    if (currentStep && currentStep.progress === snappedValue) {
      console.log(`Progress unchanged, skipping update`);
      return;
    }
    
    // Store original value for rollback if needed
    const originalProgress = currentStep?.progress || 0;
    console.log(`Original progress: ${originalProgress}%, New progress: ${snappedValue}%`);
    
    // Optimistically update UI immediately
    setLocalSteps(prevSteps => {
      const updatedSteps = prevSteps.map((s) =>
        s.id === stepId ? { ...s, progress: snappedValue } : s
      );
      console.log(`Updated local steps, new progress for step ${stepId}: ${snappedValue}%`);
      return updatedSteps;
    });
    
    // Mark this step as modified to preserve its progress
    setModifiedSteps(prev => new Set([...prev, stepId]));
    modifiedProgressRef.current.set(stepId, snappedValue);
    console.log(`Marked step ${stepId} as modified with progress ${snappedValue}%`);
    
    setUpdatingProgress(stepId);

    try {
      console.log(`Sending API request to update progress to ${snappedValue}%`);
      console.log(`API URL: ${apiBaseUrl}/projects/steps/${stepId}/`);
      
      const requestBody = { progress: snappedValue };
      console.log(`Request body:`, requestBody);
      
      const res = await fetchWithAuth(`${apiBaseUrl}/projects/steps/${stepId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log(`API Response status:`, res.status);
      console.log(`API Response ok:`, res.ok);

      if (res.ok) {
        // Success - keep the updated value
        console.log(`Progress updated successfully to ${snappedValue}%`);
        
        // Clear the modified status since it's now saved
        setModifiedSteps(prev => {
          const newSet = new Set(prev);
          newSet.delete(stepId);
          console.log(`Cleared modified status for step ${stepId}`);
          return newSet;
        });
        
        // Call callback to update parent if needed
        if (onMediaEdited) {
          console.log(`Calling onMediaEdited callback`);
          onMediaEdited();
        }
      } else {
        console.error("Failed to update progress:", res.status, res.statusText);
        
        // Try to get error details
        try {
          const errorText = await res.text();
          console.error("Error response body:", errorText);
        } catch (e) {
          console.error("Could not read error response:", e);
        }
        
        // Don't rollback on API failure - keep the user's input
        console.log(`API failed but keeping progress at ${snappedValue}% for better UX`);
        
        // Optionally show a warning to the user
        // You could add a toast notification here
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
      
      // Don't rollback on network error - keep the user's input
      console.log(`Network error but keeping progress at ${snappedValue}% for better UX`);
      
      // Optionally show a warning to the user
      // You could add a toast notification here
    } finally {
      setUpdatingProgress(null);
    }
  };

  // 🔹 Supervisor marks step as completed (sets 100%)
  const handleMarkCompleted = async (stepId: string) => {
    setUpdatingStep(stepId);
    try {
      const res = await fetchWithAuth(
        `${apiBaseUrl}/projects/steps/${stepId}/approve/`,
        { method: "POST" }
      );

      if (res.ok) {
        // Update local state properly
        setLocalSteps(prevSteps => 
          prevSteps.map((s) =>
          s.id === stepId ? { ...s, status: "COMPLETED", progress: 100 } : s
          )
        );
        
        // Call callback to update parent if needed
        if (onMediaEdited) {
          onMediaEdited();
        }
      }
    } catch (err) {
      console.error("Failed to mark step completed:", err);
    } finally {
      setUpdatingStep(null);
    }
  };

  // 🔹 Fetch invoice
  const handleInvoiceClick = async (stepId: string) => {
    setLoadingInvoice(true);
    let step = localSteps.find((s) => s.id === stepId);
    if (!step) {
      setLoadingInvoice(false);
      return;
    }

    let res = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/?step=${stepId}`);
    let invoice = null;
    if (res.ok) {
      const data = await res.json();
      invoice = Array.isArray(data) ? data[0] : data;
    }

    if (!invoice && step.status !== "COMPLETED") {
      await fetchWithAuth(`${apiBaseUrl}/projects/steps/${stepId}/approve/`, {
        method: "POST",
      });
      res = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/?step=${stepId}`);
      if (res.ok) {
        const data = await res.json();
        invoice = Array.isArray(data) ? data[0] : data;
      }
    }

    setCurrentStep(step);
    setCurrentInvoice(invoice);
    setShowInvoiceModal(true);
    setLoadingInvoice(false);
  };

  const sortedSteps = [...localSteps].sort((a, b) => a.order - b.order);

  // Calculate overall project progress
  const overallProgress = localSteps.length > 0 
    ? Math.round(localSteps.reduce((sum, step) => sum + step.progress, 0) / localSteps.length)
    : 0;

  const targetProjectName = "My Project"; // <-- Set your project name here
  const targetStepTitle = "Step 1";       // <-- Set your step title here
  const targetProjectId = "YOUR_PROJECT_ID"; // <-- Set your project id here
  const targetStepId = "YOUR_STEP_ID";       // <-- Set your step id here
  const targetBillId = "YOUR_BILL_ID";       // <-- Set your bill id here

  return (
    <div className="space-y-8">
      {/* Header with overall progress */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Project Timeline</h2>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Overall Progress</div>
            <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
          </div>
        </div>
        
        {/* Overall progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${overallProgress}%` }}
          >
            {/* Progress bar shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <span>{localSteps.filter(s => s.status === "COMPLETED").length} of {localSteps.length} steps completed</span>
          <span className="flex items-center gap-1">
            <RiTimeLine className="w-4 h-4" />
            {localSteps.filter(s => s.status === "IN_PROGRESS").length} in progress
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-green-200 shadow-lg"></div>
        
        {sortedSteps.map((step, index) => {
          const isCurrent = step.status === "IN_PROGRESS";
          const isCompleted = step.status === "COMPLETED";
          const stepMedia = (project.media_files || []).filter(
            (m) => m.step_id && String(m.step_id) === String(step.id)
          );

          // Find the latest bill for this step
          const latestBill = step.bills && step.bills.length > 0
            ? [...step.bills].sort((a, b) => {
                const dateA = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
                const dateB = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
                return dateB - dateA;
              })[0]
            : null;

          return (
            <div key={step.id} className="mb-8 relative">
              {/* Timeline marker */}
              <div className="absolute left-4 -translate-x-1/2 top-6">
                <div className={`w-4 h-4 rounded-full border-4 shadow-lg transition-all duration-300 ${
                  isCurrent
                    ? "border-yellow-400 bg-yellow-100 animate-pulse shadow-yellow-200"
                    : isCompleted
                    ? "border-green-500 bg-green-100 shadow-green-200"
                    : "border-gray-300 bg-white shadow-gray-200"
                }`}></div>
                
                {/* Step number */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                  {index + 1}
                </div>
              </div>

              <div className={`ml-12 p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                  isCurrent
                  ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg"
                    : isCompleted
                  ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                  : "border-gray-200 bg-white hover:border-blue-200"
              }`}>
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-lg mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isCompleted
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : isCurrent
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}>
                      {step.status.replace('_', ' ')}
                  </span>
                </div>
                </div>

                {/* Progress Section */}
                <div className="bg-white rounded-lg p-4 border border-gray-100 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">{step.progress}%</span>
                      {updatingProgress === step.id && (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {/* Show indicator if progress was modified locally */}
                      {modifiedSteps.has(step.id) && (
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          Modified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3 relative overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ease-out relative ${
                        isCompleted 
                          ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                          : "bg-gradient-to-r from-blue-500 to-indigo-600"
                      }`}
                      style={{ width: `${step.progress}%` }}
                    >
                      {/* Progress bar shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                    
                    {/* Loading indicator overlay */}
                    {updatingProgress === step.id && (
                      <div className="absolute inset-0 bg-blue-200 opacity-50 animate-pulse rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded mb-3">
                      <div>Step ID: {step.id}</div>
                      <div>Current Progress: {step.progress}%</div>
                      <div>Status: {step.status}</div>
                      <div>Updating: {updatingProgress === step.id ? 'Yes' : 'No'}</div>
                      <div>Modified Locally: {modifiedSteps.has(step.id) ? 'Yes' : 'No'}</div>
                      <div>Original Progress: {originalProgressRef.current.get(step.id) || 'N/A'}%</div>
                      <div>Modified Progress: {modifiedProgressRef.current.get(step.id) || 'N/A'}%</div>
                      <div className="mt-2 space-y-1">
                        <button
                          onClick={() => testLocalProgressUpdate(step.id, 10)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          +10%
                        </button>
                        <button
                          onClick={() => testLocalProgressUpdate(step.id, -10)}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 ml-1"
                        >
                          -10%
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Progress slider - only show for non-completed steps */}
                  {!isCompleted && (
                    <div className="space-y-3 group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">Adjust Progress</span>
                        {updatingProgress === step.id && (
                          <span className="text-xs text-blue-600 animate-pulse font-medium">Updating...</span>
                        )}
                  </div>
                      
                      {/* Progress slider with better visual feedback */}
                      <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={100}
                          step={10}
                    value={step.progress}
                          disabled={updatingProgress === step.id}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            console.log(`Slider changed to: ${newValue}%`);
                            handleProgressChange(step.id, newValue);
                          }}
                          onInput={(e) => {
                            // Show immediate visual feedback
                            const target = e.target as HTMLInputElement;
                            const value = parseInt(target.value);
                            console.log(`Slider input: ${value}%`);
                          }}
                                                     className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        />
                        
                        {/* Current value indicator */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {step.progress}%
                  </div>
                </div>

                      {/* Progress markers */}
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="flex flex-col items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mb-1"></span>
                          <span>0%</span>
                        </span>
                        <span className="flex flex-col items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mb-1"></span>
                          <span>25%</span>
                        </span>
                        <span className="flex flex-col items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mb-1"></span>
                          <span>50%</span>
                        </span>
                        <span className="flex flex-col items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mb-1"></span>
                          <span>75%</span>
                        </span>
                        <span className="flex flex-col items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mb-1"></span>
                          <span>100%</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Budget and Actions */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RiMoneyDollarCircleLine className="w-4 h-4 text-green-600" />
                    {(() => {
                      const billDerivedBudget = (step.bills || []).reduce((sum, b: any) => {
                        const total = b?.ocr_data?.total ?? b?.amount ?? 0;
                        const numeric = typeof total === 'string' ? parseFloat(total) : Number(total || 0);
                        return sum + (isNaN(numeric) ? 0 : numeric);
                      }, 0);
                      if ((step.bills || []).length > 0 && billDerivedBudget > 0) {
                        return (
                          <span>
                            Budget: <span className="font-semibold">Rs. {billDerivedBudget.toLocaleString('en-IN')}</span>
                          </span>
                        );
                      } else {
                        return (
                          <span>
                            Budget: <span className="font-semibold">Rs. {step.expected_budget?.toLocaleString('en-IN') || '0'}</span>
                            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">Bill Not Uploaded</span>
                          </span>
                        );
                      }
                    })()}
                </div>

                  <div className="flex gap-2">
                    {/* Mark Completed Button */}
                {!isCompleted && (
                  <button
                    onClick={() => handleMarkCompleted(step.id)}
                    disabled={updatingStep === step.id}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                      >
                        {updatingStep === step.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RiCheckLine className="w-4 h-4" />
                        )}
                        {updatingStep === step.id ? "Updating..." : "Mark Completed"}
                  </button>
                )}

                {/* Invoice Button */}
                {isCompleted && (
                  <button
                        onClick={() => {
                          setSelectedStepForInvoice(step);
                          setShowNewInvoiceModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                  >
                    <RiFileTextLine className="w-4 h-4" />
                        Generate Invoice
                  </button>
                )}
                  </div>
                </div>

                {/* Invoice Status */}
                {step.invoice && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RiFileTextLine className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Invoice Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        step.invoice.is_approved
                            ? "bg-green-100 text-green-800 border border-green-200"
                          : step.invoice.data?.status === 'SUBMITTED'
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      }`}
                    >
                      {step.invoice.is_approved 
                          ? "✅ Approved" 
                        : step.invoice.data?.status === 'SUBMITTED'
                          ? "📤 Submitted to Admin"
                          : "📝 Draft"
                      }
                    </span>
                    {step.invoice.data?.status === 'SUBMITTED' && step.invoice.data?.submitted_at && (
                        <span className="text-xs text-gray-600">
                          <RiCalendarLine className="w-3 h-3 inline mr-1" />
                          {new Date(step.invoice.data.submitted_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Step Media */}
                {stepMedia.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-blue-100">
                    <h6 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <RiCameraLine className="text-blue-500" />
                      Media Files ({stepMedia.length})
                    </h6>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {stepMedia.map((media) => (
                        <div
                          key={media.id}
                          className="group/media relative overflow-hidden w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center hover:from-blue-100 hover:to-purple-100 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 transform hover:scale-105"
                        >
                          {media.type === "image" && (
                            <RiCameraLine className="text-blue-600 text-2xl" />
                          )}
                          {media.type === "video" && (
                            <RiVideoLine className="text-red-600 text-2xl" />
                          )}
                          {media.type === "pdf" && (
                            <RiFileTextLine className="text-orange-600 text-2xl" />
                          )}
                          <a
                            href={`${apiBaseUrl}${media.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 bg-black/30 hover:bg-black/40"
                          >
                            <RiDownloadLine className="text-white text-xl" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Only show the latest bill for this step */}
                {latestBill && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">Latest Bill for this step</h5>
                    <div className="mb-2 p-2 bg-white border rounded">
                      <div>Bill ID: {latestBill.id}</div>
                      <div>Amount: {latestBill.amount ?? latestBill.ocr_data?.total ?? 'N/A'}</div>
                      <div>Uploaded At: {latestBill.uploaded_at ? new Date(latestBill.uploaded_at).toLocaleString() : 'N/A'}</div>
                      {/* Add more bill details as needed */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <SupervisorInvoiceModal
          open={showInvoiceModal}
          step={currentStep}
          invoice={currentInvoice}
          onClose={() => {
            setShowInvoiceModal(false);
            setCurrentInvoice(null);
            setCurrentStep(null);
          }}
          onSaved={onMediaEdited}
        />
      )}

      {/* Invoice Generator Modal */}
      {showInvoiceGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Generate Invoice from Bill PDF</h2>
              <button
                onClick={() => {
                  setShowInvoiceGenerator(false);
                  setSelectedPDF(null);
                  setExtractedBillData([]);
                  setGeneratedInvoice(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Step 1: PDF Upload */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Step 1: Upload Bill PDF</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePDFSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedPDF && (
                    <span className="text-sm text-gray-600">
                      Selected: {selectedPDF.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Step 2: Process PDF */}
              {selectedPDF && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Step 2: Extract Bill Data</h3>
                  <button
                    onClick={processPDFBill}
                    disabled={isProcessingPDF}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingPDF ? 'Processing...' : 'Extract Bill Data'}
                  </button>
                </div>
              )}

              {/* Step 3: Review Extracted Data */}
              {extractedBillData.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Step 3: Review Extracted Data</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {extractedBillData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{item.itemName}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 text-center">{item.unit}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">Rs. {item.unitPrice.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">Rs. {item.total.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={5} className="px-4 py-2 text-right font-semibold text-gray-900">Subtotal:</td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-900">
                            Rs. {extractedBillData.reduce((sum, item) => sum + item.total, 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Step 4: Generate Invoice */}
              {extractedBillData.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Step 4: Generate Invoice</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={generateInvoiceFromBill}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Generate Invoice
                    </button>
                    {generatedInvoice && (
                      <button
                        onClick={downloadInvoice}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Download Invoice
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Generated Invoice Preview */}
              {generatedInvoice && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Generated Invoice Preview</h3>
                  <div 
                    className="bg-white p-4 rounded border max-h-96 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: generatedInvoice }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Generation Modal */}
      {selectedStepForInvoice && (
        <InvoiceGenerationModal
          open={showNewInvoiceModal}
          step={selectedStepForInvoice}
          onClose={() => {
            setShowNewInvoiceModal(false);
            setSelectedStepForInvoice(null);
            onMediaEdited?.();
          }}
          onInvoiceGenerated={(invoice) => {
            setShowNewInvoiceModal(false);
            setSelectedStepForInvoice(null);
            onMediaEdited?.();
          }}
        />
      )}

      {/* Note: Add custom slider styles to globals.css if needed */}
    </div>
  );
}
