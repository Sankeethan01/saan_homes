"use client";

import type React from "react";
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
  RiSendPlaneLine,
} from "react-icons/ri";
import { fetchWithAuth } from "@/app/utils/auth";
import SupervisorInvoiceModal from "./SupervisorInvoiceModal";
import InvoiceGenerationModal from "./InvoiceGenerationModal";

// PDF processing utilities
const extractBillDataFromPDF = async (file: File): Promise<any[]> => {
  try {
    console.log('Processing PDF file:', file.name);
    
    // Create a FormData object to send the PDF to our backend for OCR processing
    const formData = new FormData();
    formData.append('pdf', file);
    
    // Send PDF to backend for OCR processing
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/process-pdf/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('OCR processing result:', result);
      
      // Extract line items from OCR result
      const extractedData = result.items || [];
      
      // If no items found, try to extract from raw text
      if (extractedData.length === 0 && result.raw_text) {
        const parsedItems = parseTextToItems(result.raw_text);
        return parsedItems;
      }
      
      return extractedData;
    } else {
      throw new Error(`OCR processing failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Error extracting PDF data:', error);
    throw new Error('Failed to extract data from PDF');
  }
};

// Parse raw text to extract bill items
const parseTextToItems = (rawText: string): any[] => {
  const items: any[] = [];
  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Patterns to match bill items
  const patterns = [
    // Pattern: Description Quantity Rate Amount
    /^(.+?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/,
    // Pattern: Description Qty x Rate = Amount
    /^(.+?)\s+(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)$/,
    // Pattern: Description, Quantity, Rate, Amount
    /^(.+?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)$/,
  ];
  
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const description = match[1].trim();
        const quantity = parseFloat(match[2]);
        const rate = parseFloat(match[3]);
        const amount = parseFloat(match[4]);
        
        // Validate the extracted data
        if (description && description.length > 2 && quantity > 0 && rate > 0 && amount > 0) {
          items.push({
            itemName: description,
            description: description,
            quantity: quantity,
            unit: "pcs", // Default unit
            unitPrice: rate,
            total: amount
          });
          break; // Found a match, move to next line
        }
      }
    }
  }
  
  // If no structured items found, try to find total amount
  if (items.length === 0) {
    const totalMatch = rawText.match(/(?:total|amount|sum)[:\s]*(\d+(?:\.\d+)?)/i);
    if (totalMatch) {
      const total = parseFloat(totalMatch[1]);
      items.push({
        itemName: "Bill Total",
        description: "Total amount from bill",
        quantity: 1,
        unit: "bill",
        unitPrice: total,
        total: total
      });
    }
  }
  
  return items;
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

// Define StepLog type
interface StepLog {
  id: number | string;               // media id
  stepId: number | string;           // step id
  title: string;                     // usually media description or title
  description: string;
  media: MediaFile[];             // array of ProjectMedia
  timestamp: string;                 // uploaded_at ISO string
  type: "PHOTO" | "VIDEO" | "DOCUMENT";
}

// Align the ProjectMedia interface with actual usage in the component
interface ProjectMedia {
  id: string | number;
  // API may return a path string; during uploads we may hold a File object
  file: string | File | null;
  filename?: string;
  file_size?: number;
  description?: string;
  // Backend uses these values; keep as a string literal union if known, else string
  media_type: "IMAGE" | "VIDEO" | "VR" | "DOCUMENT" | string;
  uploaded_at?: string;
  url?: string;
  // Some places reference media.type in the UI; make it optional to avoid TS errors
  type?: "image" | "video" | "pdf";
  // Used when filtering media by step association
  step?: string | number;
  step_id?: string | number;
}

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
  logs: StepLog[];
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
  media_files?: ProjectMedia[]; 
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
interface Step {
  id: string | number;
  title: string;
  logs?: StepLog[];
  // other fields...
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
  
  // Add local project state to manage media files
  const [localProject, setLocalProject] = useState<Project>(project);
  
  // PDF and Invoice states
  const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
  const [extractedBillData, setExtractedBillData] = useState<any[]>([]);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<string | null>(null);
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  
  // New invoice generation modal state
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [selectedStepForInvoice, setSelectedStepForInvoice] = useState<any>(null);

  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [currentStepForMedia, setCurrentStepForMedia] = useState<ProjectStep | null>(null);
  const [mediaUploadData, setMediaUploadData] = useState({
    description: '',
    mediaType: 'IMAGE',
    files: [] as File[],
    isUploading: false
  });
  const [submittedMediaIds, setSubmittedMediaIds] = useState<Set<string>>(new Set());

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  // Update local project when project prop changes
  useEffect(() => {
    setLocalProject(project);
  }, [project]);

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

  const sortedSteps = [...(localProject.steps || [])].sort((a, b) => a.order - b.order);

  // Calculate overall project progress
  const overallProgress = localProject.steps && localProject.steps.length > 0 
    ? Math.round(localProject.steps.reduce((sum, step) => sum + step.progress, 0) / localProject.steps.length)
    : 0;

  // Handle media file selection
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaUploadData(prev => ({
        ...prev,
        files: [...prev.files, ...files]
      }));
    }
  };

  // 🔹 Add this right after
const removeFile = (index: number) => {
  setMediaUploadData(prev => ({
    ...prev,
    files: prev.files.filter((_, i) => i !== index),
  }));
};

 


 // Handle media upload submission
const handleMediaUpload = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentStepForMedia || mediaUploadData.files.length === 0) return;

  setMediaUploadData(prev => ({ ...prev, isUploading: true }));

  try {
    const uploadedProjectMedia: ProjectMedia[] = [];
    const uploadedStepMedia: ProjectMedia[] = [];

    // Create a progress log first (required by backend to attach media)
    const logRes = await fetchWithAuth(`${apiBaseUrl}/projects/logs/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepId: String(currentStepForMedia.id),
        description: mediaUploadData.description || "",
        timestamp: new Date().toISOString(),
      }),
    });

    if (!logRes.ok) {
      let errText: string;
      try {
        const errJson = await logRes.json();
        errText = JSON.stringify(errJson);
      } catch {
        errText = await logRes.text();
      }
      throw new Error(`Failed to create progress log: ${errText}`);
    }
    const createdLog = await logRes.json();
    const progressLogId: string = createdLog.id;

    for (const file of mediaUploadData.files) {
      // ---- ProjectMedia upload ----
      const projectFormData = new FormData();
      projectFormData.append("project", String(localProject.id));
      projectFormData.append("step", String(currentStepForMedia.id));
      projectFormData.append("media_type", mediaUploadData.mediaType);
      projectFormData.append("description", mediaUploadData.description);
      projectFormData.append("file", file);

      const projectRes = await fetchWithAuth(`${apiBaseUrl}/projects/project-media/`, {
        method: "POST",
        body: projectFormData,
      });

      if (!projectRes.ok) {
        const errData = await projectRes.json();
        throw new Error(errData.detail || "Failed to upload project media");
      }
      const projectMediaData: ProjectMedia = await projectRes.json();
      uploadedProjectMedia.push(projectMediaData);

      // ---- ProgressLogMedia upload ----
      const logFormData = new FormData();
      logFormData.append("progress_log", String(progressLogId));
      logFormData.append("description", mediaUploadData.description);
      logFormData.append("file", file);
      logFormData.append("filename", file.name);
      logFormData.append("file_size", String(file.size));

      const stepRes = await fetchWithAuth(`${apiBaseUrl}/projects/progress-media/`, {
        method: "POST",
        body: logFormData,
      });

      if (!stepRes.ok) {
        const errData = await stepRes.json();
        throw new Error(errData.detail || "Failed to upload step media");
      }
      const stepMediaData: ProjectMedia = await stepRes.json();
      uploadedStepMedia.push(stepMediaData);
    }

    // ---- Update local project media ----
    setLocalProject(prev => ({
      ...prev,
      media_files: [...(prev.media_files || []), ...uploadedProjectMedia],
    }));

    // ---- Update local step logs ----
    setLocalSteps(prevSteps =>
      prevSteps.map(step => {
        if (!currentStepForMedia || step.id !== currentStepForMedia.id) return step;

        const newLogs: StepLog[] = uploadedStepMedia.map(pm => {
          // Convert uploaded progress-media response to MediaFile[] expected by StepLog
          const mf: MediaFile = {
            id: String(pm.id),
            url: (pm as any).url || (pm as any).file ? `${apiBaseUrl}${(pm as any).file}` : "",
            type: ((pm as any).type || ((pm as any).media_type ? String((pm as any).media_type).toLowerCase() : "image")) as "image" | "video" | "pdf",
            filename: (pm as any).filename || ""
          };

          return {
            id: String(pm.id),
            stepId: String(step.id),
            title: (pm as any).description || "",
            description: (pm as any).description || "",
            media: [mf],
            timestamp: (pm as any).uploaded_at || new Date().toISOString(),
            type: (String((pm as any).media_type || ((pm as any).type || "PHOTO")).toUpperCase() as "PHOTO" | "VIDEO" | "DOCUMENT"),
          } as StepLog;
        });
        
        return { ...step, logs: [...(step.logs || []), ...newLogs] };
      })
    );

    // ---- Reset form ----
    setMediaUploadData({ description: "", mediaType: "IMAGE", files: [], isUploading: false });
    setShowMediaUpload(false);
    setCurrentStepForMedia(null);
    if (onMediaEdited) onMediaEdited();
  } catch (error: any) {
    console.error("Error uploading media:", error);
    alert(error.message || "Failed to upload media. Please try again.");
  } finally {
    setMediaUploadData(prev => ({ ...prev, isUploading: false }));
  }
};

// Handle submit media to admin
const handleSubmitMediaToAdmin = async (mediaId: string) => {
  try {
    // Optimistically update the UI first
    setSubmittedMediaIds(prev => new Set([...prev, String(mediaId)]));
    setLocalProject(prev => {
      if (!prev) return prev;
      const updatedList = prev.media_files?.map((m: any) =>
        String(m.id) === String(mediaId) ? { ...m, is_submitted_to_admin: true } : m
      ) || [];
      return { ...prev, media_files: updatedList } as any;
    });

    const res = await fetchWithAuth(`${apiBaseUrl}/projects/project-media/${mediaId}/submit_to_admin/`, {
      method: 'POST'
    });

    if (!res.ok) {
      const t = await res.text();
      console.error('Media submit_to_admin failed:', t);
      
      // Revert the optimistic update on failure
      setSubmittedMediaIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(String(mediaId));
        return newSet;
      });
      setLocalProject(prev => {
        if (!prev) return prev;
        const updatedList = prev.media_files?.map((m: any) =>
          String(m.id) === String(mediaId) ? { ...m, is_submitted_to_admin: false } : m
        ) || [];
        return { ...prev, media_files: updatedList } as any;
      });
      
      alert('Failed to submit media to admin');
      return;
    }

    // Get updated media from server and update local project state
    const updatedMedia = await res.json();
    setLocalProject(prev => {
      if (!prev) return prev;
      const updatedList = prev.media_files?.map((m: any) =>
        String(m.id) === String(mediaId) ? { ...m, ...updatedMedia, is_submitted_to_admin: true } : m
      ) || [];
      return { ...prev, media_files: updatedList } as any;
    });

    alert('Media submitted to admin');
  } catch (e) {
    console.error('Error submitting media:', e);
    
    // Revert the optimistic update on error
    setSubmittedMediaIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(String(mediaId));
      return newSet;
    });
    setLocalProject(prev => {
      if (!prev) return prev;
      const updatedList = prev.media_files?.map((m: any) =>
        String(m.id) === String(mediaId) ? { ...m, is_submitted_to_admin: false } : m
      ) || [];
      return { ...prev, media_files: updatedList } as any;
    });
    
    alert('Error submitting media');
  }
};

  // Compute a usable media URL from API response
  const getMediaSrc = (m: any) => {
    const u = m?.url || m?.file;
    if (!u) return '';
    const us = String(u);
    if (us.startsWith('http') || us.startsWith('blob:') || us.startsWith('data:')) return us;
    return `${apiBaseUrl}${us.startsWith('/') ? us : `/${us}`}`;
  };

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
          <span>{(localProject.steps || []).filter(s => s.status === "COMPLETED").length} of {(localProject.steps || []).length} steps completed</span>
          <span className="flex items-center gap-1">
            <RiTimeLine className="w-4 h-4" />
            {(localProject.steps || []).filter(s => s.status === "IN_PROGRESS").length} in progress
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-green-200 shadow-lg"></div>
        
        {sortedSteps.map((step, index) => {
          const isCurrent = step.status === "IN_PROGRESS";
          const isCompleted = step.status === "COMPLETED";
          const stepMedia = (localProject.media_files || []).filter(
            (m: any) =>
              (m.step && String(m.step) === String(step.id)) ||
              (m.step_id && String(m.step_id) === String(step.id))
          );

          // Fallback: if no direct ProjectMedia linked to this step, use media from Progress Logs
          const fallbackLogMedia: any[] =
            (!stepMedia || stepMedia.length === 0)
              ? (step.logs || []).flatMap((log) => (log.media || []).map((mf) => ({
                  id: mf.id,
                  // normalize to ProjectMedia-like shape used by renderer
                  url: mf.url,
                  filename: mf.filename,
                  type: mf.type,
                  media_type: (mf.type || 'image').toString().toUpperCase(),
                  step_id: step.id,
                 })))
              : [];
          const combinedStepMedia = (stepMedia && stepMedia.length > 0) ? stepMedia : fallbackLogMedia;

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
              {/* Timeline marker with step number inside */}
              <div className="absolute left-4 -translate-x-1/2 top-6">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500 text-white shadow-green-200"
                      : isCurrent
                      ? "bg-yellow-400 text-black shadow-yellow-200"
                      : "bg-blue-600 text-white shadow-blue-200"
                  }`}
                >
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
                  
                  {/* Progress slider with better visual feedback */}
                  <div className="relative">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
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
                      className="w-full h-4 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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
                {combinedStepMedia.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-blue-100">
                    <h6 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <RiCameraLine className="text-blue-500" />
                      Media Files ({combinedStepMedia.length})
                    </h6>
                    {(() => {
                      const counts = combinedStepMedia.reduce(
                        (acc: { images: number; videos: number; vr: number; other: number }, m: any) => {
                          const t = (m?.type || m?.media_type || '').toString().toLowerCase();
                          if (t === 'image') acc.images += 1;
                          else if (t === 'video') acc.videos += 1;
                          else if (t === 'vr') acc.vr += 1;
                          else acc.other += 1;
                          return acc;
                        },
                        { images: 0, videos: 0, vr: 0, other: 0 }
                      );
                      return (
                        <div className="grid grid-flow-col auto-cols-[minmax(180px,1fr)] gap-2 overflow-x-auto sm:overflow-visible sm:grid-flow-row sm:grid-cols-3">
                          <div className="flex items-center justify-between bg-white rounded-lg border border-blue-100 p-3 min-w-[180px] shrink-0 sm:min-w-0">
                            <span className="text-sm font-medium text-gray-700">Images</span>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">{counts.images}</span>
                          </div>
                          <div className="flex items-center justify-between bg-white rounded-lg border border-purple-100 p-3 min-w-[180px] shrink-0 sm:min-w-0">
                            <span className="text-sm font-medium text-gray-700">Videos</span>
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-200">{counts.videos}</span>
                          </div>
                          <div className="flex items-center justify-between bg-white rounded-lg border border-pink-100 p-3 min-w-[180px] shrink-0 sm:min-w-0">
                            <span className="text-sm font-medium text-gray-700">VR</span>
                            <span className="px-2 py-1 text-xs rounded-full bg-pink-50 text-pink-700 border border-pink-200">{counts.vr}</span>
                          </div>
                        </div>
                      );
                    })()}
                     {process.env.NODE_ENV === 'development' && (
                       <div className="mt-2 text-xs text-gray-500">
                         <div>Debug: stepMedia={stepMedia.length}, fallbackLogMedia={fallbackLogMedia.length}</div>
                       </div>
                     )}
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
                {/* Media Upload */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700 flex items-center gap-2">
                      <RiCameraLine className="text-blue-500" />
                      Media ({combinedStepMedia.length})
                    </h5>
                    <button
                      onClick={() => {
                        setCurrentStepForMedia(step);
                        setShowMediaUpload(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Media
                    </button>
                  </div>
                  
                  {combinedStepMedia.length > 0 ? (
                    <ul className="space-y-3">
                      {combinedStepMedia.map((m: any) => {
                        const src = getMediaSrc(m);
                        const type = (m?.type || m?.media_type || '').toString().toLowerCase();
                        const isSubmitted = (m as any).is_submitted_to_admin || submittedMediaIds.has(String(m.id));
                        return (
                          <li key={m.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            {/* Thumbnail */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                              {type === 'image' && src ? (
                                <img src={src} alt={m.filename || 'Media'} className="w-full h-full object-cover" />
                              ) : type === 'video' ? (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <RiVideoLine className="w-6 h-6 text-gray-500" />
                                </div>
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <RiFileTextLine className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                            </div>
                            
                            {/* File Info */}
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 truncate">{m.filename || m.title || 'Media file'}</div>
                              <div className="text-xs text-gray-500 uppercase font-medium">{(m.media_type || m.type || 'image').toString()}</div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              {/* Download button */}
                              {src && (
                                <a 
                                  href={src} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  download 
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Download"
                                >
                                  <RiDownloadLine className="w-5 h-5" />
                                </a>
                              )}
                              
                              {/* Submit to Admin button */}
                              <button
                                onClick={() => handleSubmitMediaToAdmin(m.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isSubmitted 
                                    ? 'text-green-600 bg-green-50 cursor-default' 
                                    : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'
                                }`}
                                title={isSubmitted ? 'Submitted to Admin' : 'Submit to Admin'}
                                disabled={isSubmitted}
                              >
                                <RiSendPlaneLine className="w-5 h-5" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      No media files uploaded for this step yet.
                    </div>
                  )}
                </div>
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

      {/* Media Upload Modal */}
      {showMediaUpload && currentStepForMedia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Upload Media</h3>
              <button 
                onClick={() => {
                  setShowMediaUpload(false);
                  setCurrentStepForMedia(null);
                  setMediaUploadData({
                    description: '',
                    mediaType: 'IMAGE',
                    files: [],
                    isUploading: false
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2 -mr-2">
              <form onSubmit={handleMediaUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={mediaUploadData.description}
                    onChange={(e) =>
                      setMediaUploadData(prev => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Add a description for this media"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media Type
                  </label>
                  <select
                    value={mediaUploadData.mediaType}
                    onChange={(e) =>
                      setMediaUploadData(prev => ({ ...prev, mediaType: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="VR">VR</option>
                    <option value="DOCUMENT">Document</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Files
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 015.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            onChange={handleMediaFileChange}
                            accept={mediaUploadData.mediaType === 'IMAGE' 
                              ? 'image/*' 
                              : mediaUploadData.mediaType === 'VIDEO' 
                                ? 'video/*' 
                                : mediaUploadData.mediaType === 'DOCUMENT'
                                  ? '.pdf,.doc,.docx,.xls,.xlsx'
                                  : '*'}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {mediaUploadData.mediaType === 'IMAGE' 
                          ? 'PNG, JPG, GIF up to 10MB' 
                          : mediaUploadData.mediaType === 'VIDEO' 
                            ? 'MP4, MOV up to 50MB' 
                            : mediaUploadData.mediaType === 'DOCUMENT'
                              ? 'PDF, DOC, XLS up to 20MB'
                              : 'Any file type up to 50MB'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Selected files */}
                  {mediaUploadData.files.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Selected files:</p>
                      <ul className="space-y-2">
                        {mediaUploadData.files.map((file, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-600 truncate max-w-xs">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMediaUpload(false);
                      setCurrentStepForMedia(null);
                      setMediaUploadData({
                        description: '',
                        mediaType: 'IMAGE',
                        files: [],
                        isUploading: false
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={mediaUploadData.isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={mediaUploadData.files.length === 0 || mediaUploadData.isUploading}
                  >
                    {mediaUploadData.isUploading ? (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      'Upload Media'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
