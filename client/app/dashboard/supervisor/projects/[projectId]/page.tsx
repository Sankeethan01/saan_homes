"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  RiBuildingLine,
  RiProgress1Line,
  RiTimeLine,
  RiFileTextLine,
  RiEyeLine,
  RiArrowRightLine,
  RiCameraLine,
  RiVideoLine,
  RiUploadLine,
  RiCloseLine,
  RiAddLine,
  RiPlayLine,
  RiDownloadLine,
  RiBillLine,
  RiCheckLine,
} from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { fetchWithAuth } from "@/app/utils/auth";
import ProgressLogs from "../components/ProgressLogs";
import axios from "axios";

interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  estimated_end_date: string;
  is_completed: boolean;
  status: string;
  progress: number;
  current_step: string;
  steps: Step[];
  thumbnail?: string;
  location: string;
  budget: number;
  media_files: ProjectMedia[];
  supervisor?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Step {
  id: string;
  title: string;
  description: string;
  order: number;
  is_approved: boolean;
  actual_completed: string | null;
  expected_budget: number;
  progress: number;
  status: string;
  logs: ProgressLog[];
  bills: Bill[];
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
  type: string;
}

interface MediaFile {
  id: string;
  url: string;
  type: string;
  filename: string;
}

interface ProjectMedia {
  id: string;
  url: string;
  type: string;
  title: string;
  description: string;
  filename: string;
  file_size: number;
  uploaded_by_name: string;
  uploaded_at: string;
  step_id?: string;
  step_title?: string;
}

interface Bill {
  id: string;
  pdf: string;
  uploaded_at: string;
  verified: boolean;
  amount?: number;
  ocr_data?: {
    total: number;
  };
}

interface Invoice {
  id: string;
  step?: { title: string };
  data?: {
    status: string;
    submitted_at?: string;
    invoice_number?: string;
    amount?: number;
    description?: string;
  };
  is_approved: boolean;
  created?: string;
  amount?: number;
  description?: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // Media upload states
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [mediaUploadData, setMediaUploadData] = useState({
    step: '', // <-- new required field
    description: '',
    files: [] as File[]
  });
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string>("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [showToast, setShowToast] = useState(false);

  // Add at the top, after useState declarations
  const [showEditMediaModal, setShowEditMediaModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<ProjectMedia | null>(null);
  // Update editMediaForm state to include step and file
  const [editMediaForm, setEditMediaForm] = useState({
    title: '',
    description: '',
    step: '',
    file: null as File | null,
  });
  const [editMediaSaving, setEditMediaSaving] = useState(false);

  // Invoice generation state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedStepForInvoice, setSelectedStepForInvoice] = useState<Step | null>(null);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [recentlySubmittedInvoices, setRecentlySubmittedInvoices] = useState<Set<string>>(new Set());

  // Delete media from both project.media_files and all log.media arrays
  const handleDeleteMedia = async (mediaId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this media? This action cannot be undone.");
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("access_token");
      // Find the media object to get filename/url before deletion
      let deletedMedia: any = null;
      setProject((prev) => {
        if (!prev) return prev;
        deletedMedia = prev.media_files.find((media: any) => String(media.id) === String(mediaId));
        return prev;
      });
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/project-media/${mediaId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Also delete ProgressLogMedia with matching filename or url
      if (deletedMedia && project) {
        // Loop through all logs and their media
        for (const step of project.steps) {
          for (const log of step.logs) {
            for (const media of log.media as any[]) {
              // Match by filename or url
              if (
                (media.filename && media.filename === deletedMedia.filename) ||
                (media.url && deletedMedia.url && media.url === deletedMedia.url)
              ) {
                try {
                  await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/progress-media/${media.id}/`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  displayToast("Progress log media deleted successfully");
                } catch (err) {
                  console.error("Error deleting progress log media:", err);
                }
              }
            }
          }
        }
      }
      setProject((prev) => {
        if (!prev) return prev;
        // Remove from top-level media_files
        const updatedMediaFiles = prev.media_files.filter(
          (media: any) => String(media.id) !== String(mediaId)
        );
        // Remove from nested logs under each step
        const updatedSteps = prev.steps.map((step) => ({
          ...step,
          logs: step.logs.map((log) => ({
            ...log,
            media: (log.media as any[]).filter(
              (media) => String(media.id) !== String(mediaId) && (!deletedMedia || media.filename !== deletedMedia.filename)
            ),
          })),
        }));
        // Create updated project with all changes
        const updatedProject = {
          ...prev,
          media_files: updatedMediaFiles,
          steps: updatedSteps,
        };
        // Ensure React sees this as a new reference for re-render
        return structuredClone(updatedProject);
      });
      displayToast("Media deleted successfully");
    } catch (error) {
      console.error("Error deleting media:", error);
      displayToast("Failed to delete media", "error");
    }
  };
  
  // Handler to open edit modal
  const handleEditMedia = (media: ProjectMedia) => {
    setEditingMedia(media);
    setEditMediaForm({
      title: media.title || '',
      description: media.description || '',
      step: media.step_id || '',
      file: null,
    });
    setShowEditMediaModal(true);
  };

  // Handler to save edit
  const handleEditMediaSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;
    setEditMediaSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      const formData = new FormData();
      formData.append('title', editMediaForm.title);
      formData.append('description', editMediaForm.description);
      if (editMediaForm.step) formData.append('step', editMediaForm.step);
      if (editMediaForm.file) formData.append('file', editMediaForm.file);
      const response = await axios.patch(
        `${apiBaseUrl}/projects/project-media/${editingMedia.id}/`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      // Update project state with new media info
      setProject((prev) => {
        if (!prev) return prev;
        const updatedMediaFiles = prev.media_files.map((m) =>
          m.id === editingMedia.id ? { ...m, ...response.data } : m
        );
        return { ...prev, media_files: updatedMediaFiles };
      });
      setShowEditMediaModal(false);
      setEditingMedia(null);
      displayToast("Media updated successfully");
    } catch (err) {
      displayToast("Failed to update media", "error");
    } finally {
      setEditMediaSaving(false);
    }
  };

  // Add refetchProject function
  const refetchProject = async () => {
    if (!projectId) return;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    const projectResponse = await fetchWithAuth(`${apiBaseUrl}/projects/${projectId}/`);
    if (projectResponse.ok) {
      const updatedProject = await projectResponse.json();
      setProject(updatedProject);
    }
  };

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        
        // Fetch project details
        const projectResponse = await fetchWithAuth(`${apiBaseUrl}/projects/${projectId}/`);
        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project data');
        }
        const projectData = await projectResponse.json();
        setProject(projectData);

        // Fetch invoices separately to ensure we have the latest data
        try {
          console.log('📥 Fetching invoices from API...');
          const invoicesResponse = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/`);
          if (invoicesResponse.ok) {
            const invoicesData = await invoicesResponse.json();
            console.log('✅ Fetched invoices successfully:', invoicesData);
            setInvoices(invoicesData);
          } else {
            const errorText = await invoicesResponse.text();
            console.error('❌ Failed to fetch invoices:', errorText);
          }
        } catch (invoiceError) {
          console.error('❌ Error fetching invoices:', invoiceError);
        }

        // Progress logs and invoices are already included in the project data through steps
        // Extract them from the project data
        if (projectData.steps) {
          const allLogs: ProgressLog[] = [];
          
          projectData.steps.forEach((step: any) => {
            if (step.logs) {
              allLogs.push(...step.logs);
            }
          });
          
          setProgressLogs(allLogs);
        }

      } catch (err) {
        console.error('Error fetching project data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]); // Removed refresh dependency to prevent automatic refresh

  // Debug effect to monitor invoice state changes
  useEffect(() => {
    console.log('Invoices state changed:', invoices);
  }, [invoices]);

  // Sync invoice data between project steps and invoices state
  const syncInvoiceData = () => {
    if (!project || !invoices.length) return;
    
    setProject(prevProject => {
      if (!prevProject) return prevProject;
      
      const updatedSteps = prevProject.steps.map(step => {
        // Find matching invoice for this step
        const matchingInvoice = invoices.find(inv => 
          inv.step && inv.step.title === step.title
        );
        
        if (matchingInvoice && matchingInvoice.data?.status === 'SUBMITTED') {
          return {
            ...step,
            invoice: {
              id: matchingInvoice.id,
              is_approved: matchingInvoice.is_approved || false,
              amount: matchingInvoice.data?.amount || step.expected_budget || 0,
              description: matchingInvoice.data?.description || `Invoice for ${step.title}`,
              data: {
                status: matchingInvoice.data.status,
                submitted_at: matchingInvoice.data.submitted_at,
                invoice_number: matchingInvoice.data.invoice_number
              }
            }
          };
        }
        return step;
      });
      
      return {
        ...prevProject,
        steps: updatedSteps
      };
    });
  };

  // Sync invoice data when invoices state changes
  useEffect(() => {
    syncInvoiceData();
  }, [invoices]);

  // Clean up recently submitted invoices after 10 minutes to prevent memory leaks
  useEffect(() => {
    const cleanupTimer = setTimeout(() => {
      setRecentlySubmittedInvoices(new Set());
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearTimeout(cleanupTimer);
  }, []);

  useEffect(() => {
    if (!project) return;
    const fetchInvoices = async () => {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      const res = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/?project=${project.id}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data); // setInvoices should be a useState hook
      }
    };
    fetchInvoices();
  }, [project]);

  // Handle media file selection
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      alert('File selected!');
      const files = Array.from(e.target.files);
      setMediaUploadData(prev => ({
        ...prev,
        files: [...prev.files, ...files]
      }));
    }
  };

  // Invoice generation functions
  const handleGenerateInvoice = async (step: Step) => {
    try {
      setSelectedStepForInvoice(step);
      
      // Calculate total amount from step bills
      const totalAmount = step.bills?.reduce((sum, bill) => {
        return sum + (bill.ocr_data?.total || bill.amount || 0);
      }, 0) || step.expected_budget || 0;

      // Create line items from bills
      const lineItems = step.bills?.map((bill, index) => ({
        description: bill.pdf ? bill.pdf.split("/").pop() : `Bill ${index + 1}`,
        quantity: 1,
        rate: bill.ocr_data?.total || bill.amount || 0,
        amount: bill.ocr_data?.total || bill.amount || 0,
        bill_id: bill.id
      })) || [];

      // Generate invoice data
      const invoiceData = {
        amount: totalAmount,
        description: `Invoice for ${step.title}`,
        line_items: lineItems,
        invoice_number: `INV-${project?.name?.slice(0, 3)?.toUpperCase() || 'PROJ'}-${step.order || 1}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        invoice_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: 'DRAFT',
        step_id: step.id,
        project_id: project?.id
      };

      setGeneratedInvoice(invoiceData);
      setInvoiceGenerated(true);
      setShowInvoiceModal(true);
      
      displayToast("Invoice generated successfully!");
    } catch (error) {
      console.error("Error generating invoice:", error);
      displayToast("Failed to generate invoice", "error");
    }
  };

  const handleViewInvoice = () => {
    if (!generatedInvoice) return;
    
    // Create a new window to display the invoice
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${generatedInvoice.description}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 3px solid #1b4965; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #1b4965; margin: 0; font-size: 32px; }
            .header h2 { color: #666; margin: 10px 0 0 0; font-size: 18px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 6px; }
            .line-items { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 15px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #1b4965; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8f9fa; }
            .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; padding: 20px; background: #e3f2fd; border-radius: 6px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SAAN HOMES</h1>
              <h2>INVOICE</h2>
            </div>
            
            <div class="invoice-details">
              <div>
                <strong>Project:</strong> ${project?.name || 'N/A'}<br>
                <strong>Step:</strong> ${generatedInvoice.description}<br>
                <strong>Invoice #:</strong> ${generatedInvoice.invoice_number}
              </div>
              <div>
                <strong>Date:</strong> ${generatedInvoice.invoice_date}<br>
                <strong>Due Date:</strong> ${generatedInvoice.due_date}<br>
                <strong>Status:</strong> ${generatedInvoice.status}
              </div>
            </div>
            
            <div class="line-items">
              <h3 style="color: #1b4965; border-bottom: 2px solid #1b4965; padding-bottom: 10px;">Bill Details</h3>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Rate (₹)</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${generatedInvoice.line_items.map((item: any) => `
                    <tr>
                      <td>${item.description}</td>
                      <td>${item.quantity}</td>
                      <td>₹${item.rate.toLocaleString()}</td>
                      <td>₹${item.amount.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="total">
              <strong>Total Amount: ₹${generatedInvoice.amount.toLocaleString()}</strong>
            </div>
            
            <div class="footer">
              <p>Generated by Saan Homes Supervisor Portal</p>
              <p>Thank you for your business!</p>
            </div>
          </div>
        </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
  };

  const handleDownloadInvoice = async () => {
    if (!generatedInvoice) return;
    
    try {
      // Import jsPDF dynamically
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default || jsPDFModule;
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(27, 73, 101); // #1b4965
      doc.text("SAAN HOMES", 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(102, 102, 102);
      doc.text("INVOICE", 105, 35, { align: 'center' });
      
      // Invoice details
      doc.setDrawColor(27, 73, 101);
      doc.line(20, 45, 190, 45);
      
      doc.setFontSize(12);
      doc.setTextColor(51, 51, 51);
      let y = 60;
      
      doc.text(`Invoice #: ${generatedInvoice.invoice_number}`, 20, y);
      doc.text(`Date: ${generatedInvoice.invoice_date}`, 120, y);
      y += 10;
      
      doc.text(`Project: ${project?.name || 'N/A'}`, 20, y);
      doc.text(`Due Date: ${generatedInvoice.due_date}`, 120, y);
      y += 10;
      
      doc.text(`Step: ${generatedInvoice.description}`, 20, y);
      y += 20;
      
      // Line items table
      doc.setFontSize(10);
      doc.text("Description", 20, y);
      doc.text("Qty", 100, y);
      doc.text("Rate", 130, y);
      doc.text("Amount", 170, y);
      y += 8;
      
      doc.line(20, y, 190, y);
      y += 5;
      
      generatedInvoice.line_items.forEach((item: any) => {
        doc.text(item.description.substring(0, 30), 20, y);
        doc.text(item.quantity.toString(), 100, y);
        doc.text(`₹${item.rate.toLocaleString()}`, 130, y);
        doc.text(`₹${item.amount.toLocaleString()}`, 170, y);
        y += 6;
      });
      
      y += 5;
      doc.line(20, y, 190, y);
      y += 8;
      
      // Total
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Amount: ₹${generatedInvoice.amount.toLocaleString()}`, 170, y, { align: 'right' });
      
      // Footer
      y += 20;
      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      doc.text("Generated by Saan Homes Supervisor Portal", 105, y, { align: 'center' });
      
      doc.save(`Invoice_${generatedInvoice.invoice_number}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      displayToast("Failed to generate PDF. Please make sure jsPDF is installed.", "error");
    }
  };

  const handleSubmitInvoiceToAdmin = async () => {
    if (!generatedInvoice) {
      displayToast("No invoice to submit.", "error");
      return;
    }
    
    setSubmittingInvoice(true);
    try {
      console.log('🚀 Starting invoice submission...');
      console.log('Generated Invoice:', generatedInvoice);
      console.log('Selected Step:', selectedStepForInvoice);
      
      // Update invoice status with submission date
      const updatedInvoice = {
        ...generatedInvoice,
        status: 'SUBMITTED',
        submitted_date: new Date().toISOString(),
        submitted_at: new Date().toISOString()
      };
      
      setGeneratedInvoice(updatedInvoice);
      displayToast("Invoice submitted to admin successfully!");
      
      // Update the project step invoice status
      if (project && selectedStepForInvoice) {
        try {
          console.log('📝 Creating invoice record in database...');
          
          // First, check if an invoice already exists for this step
          console.log('🔍 Checking for existing invoices...');
          console.log('Current invoices state:', invoices);
          console.log('Looking for step:', selectedStepForInvoice.title);
          
          const existingInvoice = invoices.find(inv => {
            console.log('Checking invoice:', inv);
            console.log('Invoice step:', inv.step);
            console.log('Step title match:', inv.step?.title === selectedStepForInvoice.title);
            return inv.step && inv.step.title === selectedStepForInvoice.title;
          });
          
          console.log('🔍 Found existing invoice:', existingInvoice);
          
          let invoiceResponse;
          
          if (existingInvoice && existingInvoice.id) {
            console.log('📝 Updating existing invoice:', existingInvoice.id);
            // Update existing invoice
            invoiceResponse = await fetchWithAuth(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/${existingInvoice.id}/`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  data: {
                    status: 'SUBMITTED',
                    submitted_at: new Date().toISOString(),
                    invoice_number: generatedInvoice.invoice_number,
                    amount: generatedInvoice.amount,
                    description: generatedInvoice.description
                  }
                })
              }
            );
          } else {
            // Try to fetch existing invoices from backend to double-check
            console.log('🔍 No local invoice found, checking backend...');
            try {
              const backendInvoicesResponse = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/?step=${selectedStepForInvoice.id}`
              );
              
              if (backendInvoicesResponse.ok) {
                const backendInvoices = await backendInvoicesResponse.json();
                console.log('🔍 Backend invoices for this step:', backendInvoices);
                
                if (backendInvoices && backendInvoices.length > 0) {
                  const backendInvoice = backendInvoices[0];
                  console.log('📝 Found backend invoice, updating:', backendInvoice.id);
                  
                  invoiceResponse = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/${backendInvoice.id}/`,
                    {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        data: {
                          status: 'SUBMITTED',
                          submitted_at: new Date().toISOString(),
                          invoice_number: generatedInvoice.invoice_number,
                          amount: generatedInvoice.amount,
                          description: generatedInvoice.description
                        }
                      })
                    }
                  );
                } else {
                  console.log('📝 No backend invoice found, creating new one...');
                  // Create new invoice
                  const invoiceData = {
                    step: selectedStepForInvoice.id,
                    data: {
                      status: 'SUBMITTED',
                      submitted_at: new Date().toISOString(),
                      invoice_number: generatedInvoice.invoice_number,
                      amount: generatedInvoice.amount,
                      description: generatedInvoice.description
                    }
                  };
                  
                  console.log('Invoice data to send:', invoiceData);
                  
                  invoiceResponse = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(invoiceData)
                    }
                  );
                }
              } else {
                console.log('📝 Backend check failed, creating new invoice...');
                // Create new invoice as fallback
                const invoiceData = {
                  step: selectedStepForInvoice.id,
                  data: {
                    status: 'SUBMITTED',
                    submitted_at: new Date().toISOString(),
                    invoice_number: generatedInvoice.invoice_number,
                    amount: generatedInvoice.amount,
                    description: generatedInvoice.description
                  }
                };
                
                console.log('Invoice data to send:', invoiceData);
                
                invoiceResponse = await fetchWithAuth(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(invoiceData)
                  }
                );
              }
            } catch (backendError) {
              console.error('❌ Error checking backend invoices:', backendError);
              console.log('📝 Creating new invoice as fallback...');
              
              // Create new invoice as fallback
              const invoiceData = {
                step: selectedStepForInvoice.id,
                data: {
                  status: 'SUBMITTED',
                  submitted_at: new Date().toISOString(),
                  invoice_number: generatedInvoice.invoice_number,
                  amount: generatedInvoice.amount,
                  description: generatedInvoice.description
                }
              };
              
              console.log('Invoice data to send:', invoiceData);
              
              invoiceResponse = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(invoiceData)
                }
              );
            }
          }
          
          console.log('Invoice API response status:', invoiceResponse.status);
          
          if (invoiceResponse.ok) {
            const invoiceData = await invoiceResponse.json();
            console.log('✅ Invoice saved successfully:', invoiceData);
          } else {
            const errorText = await invoiceResponse.text();
            console.error('❌ Invoice operation failed:', errorText);
            displayToast("Failed to save invoice data", "error");
            return; // Stop here if invoice operation failed
          }
          
          console.log('🔧 Updating project step...');
          
          // Update the step's invoice status with proper created date
          const stepUpdateResponse = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/steps/${selectedStepForInvoice.id}/`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                invoice: {
                  id: generatedInvoice.invoice_number,
                  is_approved: false,
                  amount: generatedInvoice.amount,
                  description: generatedInvoice.description,
                  created: new Date().toISOString(),
                  data: {
                    status: 'SUBMITTED',
                    submitted_at: new Date().toISOString(),
                    invoice_number: generatedInvoice.invoice_number
                  }
                }
              })
            }
          );
          
          console.log('Step update response status:', stepUpdateResponse.status);
          
          if (stepUpdateResponse.ok) {
            const stepUpdateData = await stepUpdateResponse.json();
            console.log('✅ Step updated successfully:', stepUpdateData);
            
            // Add this step to recently submitted invoices to prevent status from reverting
            setRecentlySubmittedInvoices(prev => new Set([...prev, selectedStepForInvoice.id]));
            
            displayToast("Invoice status updated in project successfully!");
            
            // Create a proper invoice object for the UI with all required fields
            const newInvoice = {
              id: generatedInvoice.invoice_number,
              step: { title: selectedStepForInvoice.title },
              data: {
                status: 'SUBMITTED',
                submitted_at: new Date().toISOString(),
                invoice_number: generatedInvoice.invoice_number,
                amount: generatedInvoice.amount
              },
              is_approved: false,
              created: new Date().toISOString()
            };
            
            console.log('🔄 Updating local state with new invoice:', newInvoice);
            
            // Update the local project state to reflect the change immediately
            setProject(prevProject => {
              if (!prevProject) return prevProject;
              
              const updatedSteps = prevProject.steps.map(step => {
                if (step.id === selectedStepForInvoice.id) {
                  console.log('🔄 Updating step:', step.title);
                  return {
                    ...step,
                    invoice: {
                      id: generatedInvoice.invoice_number,
                      is_approved: false,
                      amount: generatedInvoice.amount,
                      description: generatedInvoice.description,
                      created: new Date().toISOString(),
                      data: {
                        status: 'SUBMITTED',
                        submitted_at: new Date().toISOString(),
                        invoice_number: generatedInvoice.invoice_number
                      }
                    }
                  };
                }
                return step;
              });
              
              console.log('🔄 Updated project state with new invoice data');
              return {
                ...prevProject,
                steps: updatedSteps
              };
            });
            
            // Also update the invoices state to ensure persistence
            setInvoices(prevInvoices => {
              console.log('🔄 Updating invoices state. Previous:', prevInvoices);
              
              const existingInvoiceIndex = prevInvoices.findIndex(inv => 
                inv.step && inv.step.title === selectedStepForInvoice.title
              );
              
              if (existingInvoiceIndex >= 0) {
                const updatedInvoices = [...prevInvoices];
                updatedInvoices[existingInvoiceIndex] = newInvoice;
                console.log('🔄 Updated existing invoice at index:', existingInvoiceIndex);
                return updatedInvoices;
              } else {
                console.log('🔄 Adding new invoice to invoices state');
                return [...prevInvoices, newInvoice];
              }
            });
            
            // Force a refresh of the project data to ensure consistency
            setTimeout(async () => {
              try {
                console.log('🔄 Refreshing project data to ensure consistency...');
                await refetchProject();
                
                // Also refresh invoices
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
                const invoicesResponse = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/`);
                if (invoicesResponse.ok) {
                  const invoicesData = await invoicesResponse.json();
                  setInvoices(invoicesData);
                  console.log('✅ Invoices refreshed successfully');
                }
              } catch (refreshError) {
                console.error('❌ Error refreshing data:', refreshError);
              }
            }, 1000);
            
            // Close the modal after successful submission
            setTimeout(() => {
              setShowInvoiceModal(false);
              setInvoiceGenerated(false);
              setGeneratedInvoice(null);
              setSelectedStepForInvoice(null);
              
              // Show success message in the table
              displayToast("✅ Invoice successfully submitted to admin! Status updated.");
              
              console.log('🎉 Invoice submission completed successfully!');
              console.log('🎯 Status should now show "Invoice Submitted to Admin" immediately!');
            }, 1500);
          } else {
            const errorText = await stepUpdateResponse.text();
            console.error('❌ Step update failed:', errorText);
            displayToast("Error updating invoice status", "error");
          }
        } catch (error) {
          console.error("❌ Error updating project step:", error);
          displayToast("Error updating invoice status", "error");
        }
      }
      
    } catch (error) {
      console.error("❌ Error submitting invoice:", error);
      displayToast("Failed to submit invoice to admin.", "error");
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleResetInvoice = () => {
    setInvoiceGenerated(false);
    setGeneratedInvoice(null);
    setShowInvoiceModal(false);
    setSelectedStepForInvoice(null);
    displayToast("Invoice reset. You can generate a new one.");
  };

  // Remove file from selection
  const removeMediaFile = (index: number) => {
    setMediaUploadData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Upload media files
  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || mediaUploadData.files.length === 0 || !mediaUploadData.step) return;

    setUploading(true);
    setError('');
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

      // Prepare form data for ProjectMedia upload
      const formDataToSend = new FormData();
      formDataToSend.append('project', project.id);
      formDataToSend.append('step', mediaUploadData.step);
      formDataToSend.append('description', mediaUploadData.description || '');
      mediaUploadData.files.forEach(file => {
        formDataToSend.append('file', file);
      });

      // If your main urls.py has path('api/projects/', ...)
      const response = await fetchWithAuth(`${apiBaseUrl}/projects/project-media/`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with:', errorText);
        throw new Error('Failed to upload project media');
      }

      // Refresh project data
      const projectResponse = await fetchWithAuth(`${apiBaseUrl}/projects/${project.id}/`);
      if (projectResponse.ok) {
        const updatedProject = await projectResponse.json();
        setProject(updatedProject);
      }

      setMediaUploadData({ step: '', description: '', files: [] });
      setShowMediaUpload(false);

    } catch (err) {
      console.error('Error uploading media:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

    // Helper function to safely extract invoice data
  const getInvoiceData = (stepInvoice: any, step: Step) => {
    if (!stepInvoice) return null;
    
    // Handle both step.invoice and invoices array items
    const amount = stepInvoice.data?.amount || stepInvoice.amount || step.expected_budget || 0;
    const created = stepInvoice.created || stepInvoice.data?.submitted_at;
    const invoiceNumber = stepInvoice.data?.invoice_number || `INV-${step.title}`;
    const status = stepInvoice.data?.status || 'DRAFT';
    
    return {
      amount,
      created,
      invoiceNumber,
      status
    };
  };

  // Calculate stats from real data
  const getStats = () => {
    if (!project) return { totalPhases: 0, completed: 0, active: 0, upcoming: 0 };
    
    const steps = project.steps || [];
    const totalPhases = steps.length;
    const completed = steps.filter(step => step.is_approved).length;
    const active = steps.filter(step => step.actual_completed && !step.is_approved).length;
    const upcoming = steps.filter(step => !step.actual_completed && !step.is_approved).length;
    
    return { totalPhases, completed, active, upcoming };
  };

  // Breadcrumbs
  const breadcrumbs = [
    { name: "Dashboard", path: "/dashboard/supervisor" },
    { name: "Projects", path: "/dashboard/supervisor/projects" },
    { name: project?.name || "Loading...", path: `/dashboard/supervisor/projects/${projectId}` },
  ];

  const stats = getStats();

  // Toast notification function - now persistent until manually dismissed
  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast(message);
    setToastType(type);
    setShowToast(true);
    // Only auto-hide error messages after 5 seconds
    if (type === 'error') {
      setTimeout(() => setShowToast(false), 5000);
    }
    // Success and info messages stay until manually dismissed
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-0 px-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b4965] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading project data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-0 px-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <RiBuildingLine className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Project</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-0 px-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <RiBuildingLine className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Not Found</h3>
              <p className="text-gray-600">The requested project could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-0 px-0">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm py-6 px-2">
          {breadcrumbs.map((item, idx) => (
            <span key={item.path} className="flex items-center">
              {idx > 0 && <span className="mx-2 text-[#1b4965]">/</span>}
              {idx < breadcrumbs.length - 1 ? (
                <button onClick={() => router.push(item.path)} className="text-[#1b4965] hover:underline">{item.name}</button>
              ) : (
                <span className="text-[#1b4965] font-semibold">{item.name}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow p-6 mb-8 border border-white/20">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-full max-w-xs">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search in project..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent transition-all duration-200 w-full"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-blue-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <RiBuildingLine className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPhases}</div>
                <div className="text-xs text-blue-600 font-medium">Total Phases</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-green-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <RiProgress1Line className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                <div className="text-xs text-green-600 font-medium">Completed</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-amber-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <RiTimeLine className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                <div className="text-xs text-amber-600 font-medium">Active</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-purple-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <RiFileTextLine className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.upcoming}</div>
                <div className="text-xs text-purple-600 font-medium">Upcoming</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: "overview", label: "Project Overview", icon: RiEyeLine },
            { id: "progress", label: "Progress Logs", icon: RiProgress1Line },
            { id: "timeline", label: "Project Timeline", icon: RiTimeLine },
            { id: "invoices", label: "Invoices & Billing", icon: RiFileTextLine },
            { id: "media", label: "Project Media", icon: RiCameraLine },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#1b4965] text-white shadow"
                  : "text-slate-600 hover:text-[#1b4965]-700 hover:bg-white/80 hover:shadow"
              }`}
            >
              <tab.icon className="text-lg" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow p-6 min-h-[300px]">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Project Overview</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  {project.thumbnail ? (
                    <img 
                      src={`${project.thumbnail}`} 
                      alt={project.name} 
                      className="rounded-xl w-full h-48 object-cover mb-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                        const fallback = target.parentElement?.querySelector(".fallback");
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center mb-4 ${project.thumbnail ? 'hidden' : ''}`}>
                    <div className="text-center">
                      <RiBuildingLine className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {project.thumbnail ? 'Project image not available' : 'No project image'}
                      </p>
                      {project.thumbnail && (
                        <p className="text-xs text-gray-400 mt-1">
                          File: {project.thumbnail}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {project.name}</div>
                    <div><strong>Description:</strong> {project.description}</div>
                    <div><strong>Location:</strong> {project.location}</div>
                    <div><strong>Status:</strong> {project.status}</div>
                    <div><strong>Progress:</strong> {project.progress}%</div>
                    <div><strong>Current Step:</strong> {project.current_step}</div>
                    <div><strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}</div>
                    <div><strong>End Date:</strong> {new Date(project.estimated_end_date).toLocaleDateString()}</div>
                    <div><strong>Budget:</strong> ${project.budget?.toLocaleString() || '0'}</div>
                    {project.supervisor && (
                      <div><strong>Supervisor:</strong> {project.supervisor.first_name} {project.supervisor.last_name}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-4">
                  {/* Project Media Section */}
                  <div className="bg-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold mb-2">Project Media</h4>
                    {project.media_files && project.media_files.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {project.media_files.map((media) => (
                          <div key={media.id} className="flex items-center gap-3 border-b border-gray-200 pb-2 mb-2 last:border-b-0 last:mb-0 last:pb-0">
                            {/* Thumbnail or icon */}
                            
                            {media.type === 'image' ? (
                              <img
                                src={`${API_BASE}${media.url}`}
                                alt={media.title || media.filename}
                                className="w-16 h-16 object-cover rounded-lg border"
                              />
                            ) : media.type === 'video' || media.type === 'vr' ? (
                              <button
                                onClick={() => window.open(`${API_BASE}${media.url}`, '_blank')}
                                className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border hover:from-blue-200 hover:to-purple-200"
                                title="Play Video"
                              >
                                <RiPlayLine className="text-2xl text-purple-600" />
                              </button>
                            ) : (
                              <a
                                href={`${API_BASE}${media.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-lg border"
                                title="Download File"
                              >
                                <RiDownloadLine className="text-2xl text-gray-600" />
                              </a>
                            )}
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate">{media.title || media.filename}</div>
                              <div className="text-xs text-gray-500 truncate">{media.type.toUpperCase()} • {media.uploaded_by_name} • {new Date(media.uploaded_at).toLocaleDateString()}</div>
                            </div>
                            {/* Download button */}
                            <a
                              href={media.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:text-blue-800"
                              title="Download"
                            >
                              <RiDownloadLine className="w-5 h-5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-4">No media files uploaded yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "progress" && (
            <ProgressLogs
              project={{
                ...project,
                steps: project.steps.map((step) => ({
                  ...step,
                  logs: step.logs.map((log) => ({
                    ...log,
                    type:
                      log.type === "TEXT" || log.type === "PHOTO" || log.type === "VIDEO"
                        ? log.type
                        : "TEXT",
                    media: log.media.map((media) => ({
                      ...media,
                      type:
                        media.type === "image" || media.type === "video" || media.type === "pdf"
                          ? media.type
                          : "image",
                    })),
                  })),
                })),
              }}
              onMediaEdited={refetchProject}
            />
          )}
          {activeTab === "timeline" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Project Timeline</h2>
              {project.steps && project.steps.length > 0 ? (
                <div className="space-y-4">
                  {project.steps.sort((a, b) => a.order - b.order).map((step) => (
                    <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{step.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          step.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          step.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{step.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Progress: {step.progress}%</span>
                        <span>Budget: ${step.expected_budget?.toLocaleString() || '0'}</span>
                        {step.actual_completed && (
                          <span>Completed: {new Date(step.actual_completed).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">No project steps found</div>
              )}
            </div>
          )}
          {activeTab === "invoices" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Invoices & Billing</h2>
              
              {/* Invoice Generation Section */}
              <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-purple-800 mb-2">Invoice Generation</h3>
                    <p className="text-purple-600">
                      Generate professional invoices for completed project steps. Each step can have its own invoice with detailed billing information.
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3">
                    <button
                      onClick={() => {
                        // This will open a comprehensive invoice generation modal
                        alert('Invoice generation modal will open here. This feature allows you to create detailed invoices for each project step.');
                      }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-semibold"
                    >
                      <RiFileTextLine className="text-xl" />
                      Generate New Invoice
                    </button>
                    <button
                      onClick={() => {
                        // Test button to manually test status changes
                        console.log('🔍 Current project state:', project);
                        console.log('🔍 Current invoices state:', invoices);
                        console.log('🔍 Current progress logs:', progressLogs);
                        
                        // Check if any steps have invoices
                        if (project?.steps) {
                          project.steps.forEach((step, index) => {
                            console.log(`🔍 Step ${index + 1}:`, step.title, 'Invoice:', step.invoice);
                          });
                        }
                        
                        displayToast('Debug: Check console for current state');
                      }}
                      className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      Debug State
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          displayToast('Refreshing data...', 'info');
                          await refetchProject();
                          
                          // Also refresh invoices
                          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
                          const invoicesResponse = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/`);
                          if (invoicesResponse.ok) {
                            const invoicesData = await invoicesResponse.json();
                            setInvoices(invoicesData);
                            displayToast('Data refreshed successfully!', 'success');
                          }
                        } catch (error) {
                          displayToast('Failed to refresh data', 'error');
                        }
                      }}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <RiTimeLine className="text-xl" />
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-xl">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Step</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.steps && project.steps.length > 0 ? (
                      project.steps.map((step) => {
                        // Debug log to see step data
                        console.log(`Step ${step.title}:`, step);
                        
                        const invoice = invoices.find(inv => inv.step && inv.step.title === step.title);
                        // Also check if the step has its own invoice
                        const stepInvoice = step.invoice || invoice;
                        
                        // Check if this step was recently submitted to prevent status from reverting
                        const wasRecentlySubmitted = recentlySubmittedInvoices.has(step.id);
                        
                        console.log(`Found invoice for ${step.title}:`, stepInvoice);
                        
                        let status = '';
                        let badgeClass = '';
                        let amount = '';
                        let date = '';
                        if (stepInvoice) {
                          // Handle both step.invoice and invoices array items
                          const invoiceAmount = stepInvoice.data?.amount || stepInvoice.amount || step.expected_budget || 0;
                          amount = invoiceAmount.toLocaleString();
                          
                          // Prioritize submitted_at date over created date for better accuracy
                          const submittedDate = stepInvoice.data?.submitted_at;
                          const createdDate = stepInvoice.created;
                          
                          // Set initial date from created date if no submitted date
                          if (createdDate && !submittedDate) {
                            const createdTime = new Date(createdDate);
                            date = createdTime.toLocaleDateString();
                          }
                          
                          // Debug log to see what's in the invoice
                          console.log(`Invoice for ${step.title}:`, stepInvoice);
                          
                          if (stepInvoice.is_approved) {
                            status = 'Invoice Approved';
                            badgeClass = 'bg-green-100 text-green-800';
                          } else if (stepInvoice.data?.status === 'SUBMITTED' || wasRecentlySubmitted) {
                            status = 'Invoice Submitted to Admin';
                            badgeClass = 'bg-blue-100 text-blue-800 animate-bounce';
                            // Always show the submitted date if available
                            if (submittedDate) {
                              const submittedTime = new Date(submittedDate);
                              const now = new Date();
                              const timeDiff = now.getTime() - submittedTime.getTime();
                              const minutesAgo = Math.floor(timeDiff / (1000 * 60));
                              
                              if (minutesAgo < 5) {
                                date = 'Just Submitted';
                              } else if (minutesAgo < 60) {
                                date = `${minutesAgo} minutes ago`;
                              } else {
                                date = submittedTime.toLocaleDateString();
                              }
                            } else if (wasRecentlySubmitted) {
                              // If recently submitted but no submitted date, show "Just Submitted"
                              date = 'Just Submitted';
                            }
                          } else {
                            status = 'Invoice Draft';
                            badgeClass = 'bg-yellow-100 text-yellow-800';
                          }
                        } else {
                          amount = step.expected_budget?.toLocaleString() || '0';
                          // Check if this step is currently being processed
                          if (submittingInvoice && selectedStepForInvoice?.id === step.id) {
                            status = 'Processing...';
                            badgeClass = 'bg-purple-100 text-purple-800 animate-pulse';
                          } else {
                          status = 'Auto-generated (not submitted)';
                          badgeClass = 'bg-yellow-100 text-yellow-800';
                          }
                        }
                        return (
                          <tr key={step.id} className="border-b last:border-b-0">
                            <td className="px-4 py-2 font-medium">{step.title}</td>
                            <td className="px-4 py-2">{amount}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeClass}`}>{status}</span>
                            </td>
                            <td className="px-4 py-2">{date}</td>
                            <td className="px-4 py-2">
                              {!stepInvoice && step.status === 'COMPLETED' && (
                                <div className="flex gap-2">
                                <button
                                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
                                    onClick={() => handleGenerateInvoice(step)}
                                  >
                                    Generate Invoice
                                  </button>
                                  <button
                                    className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-800 text-xs disabled:opacity-50"
                                  onClick={() => {
                                      // Quick submit to admin - generate and submit in one step
                                      handleGenerateInvoice(step);
                                      setTimeout(() => {
                                        if (generatedInvoice) {
                                          handleSubmitInvoiceToAdmin();
                                        }
                                      }, 100);
                                    }}
                                    disabled={submittingInvoice}
                                  >
                                    {submittingInvoice ? 'Submitting...' : 'Submit to Admin'}
                                </button>
                                </div>
                              )}
                              {stepInvoice && (
                                <div className="flex gap-2">
                                  {status === 'Invoice Approved' ? (
                                    <span className="text-green-600 font-semibold text-xs">✓ Approved</span>
                                  ) : status === 'Invoice Submitted to Admin' ? (
                                    <span className="text-blue-600 font-semibold text-xs">⏳ Pending Approval</span>
                                  ) : (
                                    <>
                                      <button
                                        className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs"
                                        onClick={() => {
                                          // For existing invoices, we need to load the invoice data first
                                          if (stepInvoice) {
                                            setGeneratedInvoice({
                                              amount: (stepInvoice.data?.amount || stepInvoice.amount || step.expected_budget || 0),
                                              description: `Invoice for ${step.title}`,
                                              line_items: [],
                                              invoice_number: stepInvoice.data?.invoice_number || `INV-${step.title}`,
                                              invoice_date: (stepInvoice.created ? new Date(stepInvoice.created) : new Date()).toISOString().slice(0, 10),
                                              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                                              status: stepInvoice.data?.status || 'DRAFT',
                                              step_id: step.id,
                                              project_id: project?.id
                                            });
                                            setInvoiceGenerated(true);
                                            handleViewInvoice();
                                          }
                                        }}
                                      >
                                        View
                                      </button>
                                      <button
                                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                        onClick={() => {
                                          // For existing invoices, we need to load the invoice data first
                                          if (stepInvoice) {
                                            setGeneratedInvoice({
                                              amount: (stepInvoice.data?.amount || stepInvoice.amount || step.expected_budget || 0),
                                              description: `Invoice for ${step.title}`,
                                              line_items: [],
                                              invoice_number: stepInvoice.data?.invoice_number || `INV-${step.title}`,
                                              invoice_date: (stepInvoice.created ? new Date(stepInvoice.created) : new Date()).toISOString().slice(0, 10),
                                              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                                              status: stepInvoice.data?.status || 'DRAFT',
                                              step_id: step.id,
                                              project_id: project?.id
                                            });
                                            setInvoiceGenerated(true);
                                            handleDownloadInvoice();
                                          }
                                        }}
                                      >
                                        Download
                                      </button>
                                      <button
                                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs disabled:opacity-50"
                                        onClick={() => {
                                          // For existing invoices, we need to load the invoice data first
                                          if (stepInvoice) {
                                            setGeneratedInvoice({
                                              amount: (stepInvoice.data?.amount || stepInvoice.amount || step.expected_budget || 0),
                                              description: `Invoice for ${step.title}`,
                                              line_items: [],
                                              invoice_number: stepInvoice.data?.invoice_number || `INV-${step.title}`,
                                              invoice_date: (stepInvoice.created ? new Date(stepInvoice.created) : new Date()).toISOString().slice(0, 10),
                                              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                                              status: stepInvoice.data?.status || 'DRAFT',
                                              step_id: step.id,
                                              project_id: project?.id
                                            });
                                            setInvoiceGenerated(true);
                                            handleSubmitInvoiceToAdmin();
                                          }
                                        }}
                                        disabled={submittingInvoice}
                                      >
                                        {submittingInvoice ? 'Submitting...' : 'Submit to Admin'}
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-500 py-8">No steps found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === "media" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Project Media</h2>
                <button
                  onClick={() => setShowMediaUpload(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 transition-colors"
                >
                  <RiAddLine className="w-4 h-4" />
                  Upload Media
                </button>
              </div>
              
              {project.media_files && project.media_files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.media_files.map((media) => (
                    <div key={media.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow flex flex-col h-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {media.type === 'image' && <RiCameraLine className="w-5 h-5 text-blue-500" />}
                          {media.type === 'video' && <RiVideoLine className="w-5 h-5 text-red-500" />}
                          {media.type === 'vr' && <RiPlayLine className="w-5 h-5 text-purple-500" />}
                          <span className="text-sm text-gray-500">{media.type.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="Download"
                          >
                            <RiDownloadLine className="w-5 h-5" />
                          </a>
                          <button
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                            onClick={() => handleEditMedia(media)}
                          >
                            <RiFileTextLine className="w-5 h-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                            onClick={() => handleDeleteMedia(media.id)}
                          >
                            <RiCloseLine className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 break-words">{media.title || media.filename}</h3>
                      {media.step_title && (
                        <div className="text-xs text-indigo-700 font-semibold mb-1">Step: {media.step_title}</div>
                      )}
                      {media.description && (
                        <p className="text-sm text-gray-600 mb-2 break-words">{media.description}</p>
                      )}
                      <div className="text-xs text-gray-500 space-y-1 mt-auto">
                        <div><span className="font-semibold">File:</span> {media.filename}</div>
                        <div><span className="font-semibold">Size:</span> {(media.file_size / 1024 / 1024).toFixed(2)} MB</div>
                        <div><span className="font-semibold">Uploaded by:</span> {media.uploaded_by_name}</div>
                        <div><span className="font-semibold">Date:</span> {new Date(media.uploaded_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <RiCameraLine className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No media files uploaded yet</p>
                  <p className="text-sm">Click "Upload Media" to add images, videos, or VR content</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Project Media</h3>
              <button
                onClick={() => setShowMediaUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleMediaUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Step *
                </label>
                <select
                  value={mediaUploadData.step}
                  onChange={e => setMediaUploadData(prev => ({ ...prev, step: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Step</option>
                  {project.steps.map(step => (
                    <option key={step.id} value={step.id}>{step.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={mediaUploadData.description}
                  onChange={(e) => setMediaUploadData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                  rows={3}
                  placeholder="Enter media description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <RiUploadLine className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Drag and drop files here or click to browse</p>
                  <p className="text-sm text-gray-500 mb-4">Supports: Images, Videos, VR Content</p>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*"
                    onChange={handleMediaFileChange}
                    className="hidden" 
                    id="media-upload"
                    required
                  />
                  <label 
                    htmlFor="media-upload"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    Choose Files
                  </label>
                </div>
                
                {/* Selected Files */}
                {mediaUploadData.files.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {mediaUploadData.files.map((file, index) => {
                      let fileType = 'file';
                      if (file.type) {
                        if (file.type.startsWith('image')) fileType = 'image';
                        else if (file.type.startsWith('video')) fileType = 'video';
                      } else {
                        // fallback by extension
                        const ext = (file.name.split('.').pop() || '').toLowerCase();
                        if (["jpg","jpeg","png","gif","bmp","webp"].includes(ext)) fileType = 'image';
                        else if (["mp4","avi","mov","wmv","flv","webm"].includes(ext)) fileType = 'video';
                      }
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow flex flex-col h-full">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {fileType === 'image' && <RiCameraLine className="w-5 h-5 text-blue-500" />}
                              {fileType === 'video' && <RiVideoLine className="w-5 h-5 text-red-500" />}
                              {fileType === 'file' && <RiFileTextLine className="w-5 h-5 text-gray-500" />}
                              <span className="text-sm text-gray-500 uppercase">{fileType}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMediaFile(index)}
                              className="text-red-500 hover:text-red-700 ml-2"
                              title="Remove"
                            >
                              <RiCloseLine />
                            </button>
                          </div>
                          <div className="font-medium text-gray-800 mb-1 break-words">{file.name}</div>
                          {mediaUploadData.description && (
                            <div className="text-sm text-gray-600 mb-2 break-words">{mediaUploadData.description}</div>
                          )}
                          <div className="text-xs text-gray-500 space-y-1 mt-auto">
                            <div><span className="font-semibold">File:</span> {file.name}</div>
                            <div><span className="font-semibold">Size:</span> {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                            {mediaUploadData.step && (
                              <div><span className="font-semibold">Step:</span> {project.steps.find(s => s.id === mediaUploadData.step)?.title || mediaUploadData.step}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowMediaUpload(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || mediaUploadData.files.length === 0 || !mediaUploadData.step}
                  className="flex-1 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditMediaModal && editingMedia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Media</h3>
              <button
                onClick={() => setShowEditMediaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditMediaSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editMediaForm.title}
                  onChange={e => setEditMediaForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter media title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editMediaForm.description}
                  onChange={e => setEditMediaForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Enter media description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Step</label>
                <select
                  value={editMediaForm.step}
                  onChange={e => setEditMediaForm(f => ({ ...f, step: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Step</option>
                  {project.steps.map(step => (
                    <option key={step.id} value={step.id}>{step.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Replace File (optional)</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={e => setEditMediaForm(f => ({ ...f, file: e.target.files ? e.target.files[0] : null }))}
                  className="w-full"
                />
                {editingMedia.url && (
                  <div className="mt-2 text-xs text-gray-500">Current file: {editingMedia.filename}</div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditMediaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editMediaSaving}
                  className="flex-1 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editMediaSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && generatedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Generated Invoice</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Invoice Header */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold text-purple-800">Invoice Details</h3>
                    <p className="text-sm text-purple-600">#{generatedInvoice.invoice_number}</p>
                    <p className="text-sm text-purple-600">{generatedInvoice.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-800">Status</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      generatedInvoice.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' :
                      generatedInvoice.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {generatedInvoice.status === 'SUBMITTED' ? 'Submitted to Admin' :
                       generatedInvoice.status === 'APPROVED' ? 'Approved' : 'Draft'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-800">Total Amount</h3>
                    <p className="text-lg font-bold text-purple-600">₹{generatedInvoice.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Line Items</h3>
                <div className="space-y-2">
                  {generatedInvoice.line_items && generatedInvoice.line_items.length > 0 ? (
                    generatedInvoice.line_items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.rate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{item.amount}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No line items available</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  onClick={handleResetInvoice}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Reset Invoice
                </button>
                <button
                  onClick={handleViewInvoice}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  View Invoice
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Download PDF
                </button>
                {generatedInvoice.status !== 'SUBMITTED' && (
                  <button
                    onClick={handleSubmitInvoiceToAdmin}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    disabled={submittingInvoice}
                  >
                    {submittingInvoice ? 'Submitting...' : 'Submit to Admin'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Toast Notifications */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 ${
            toastType === 'success' ? 'bg-green-600 text-white' :
            toastType === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
          }`}
          style={{ minWidth: '350px' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {toastType === 'success' ? (
                <RiCheckLine className="text-xl" />
              ) : toastType === 'error' ? (
                <RiCloseLine className="text-xl" />
              ) : (
                <RiFileTextLine className="text-xl" />
              )}
              <span className="font-medium">{toast}</span>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
