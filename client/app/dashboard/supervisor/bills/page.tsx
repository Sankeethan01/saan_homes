"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchWithAuth } from "@/app/utils/auth";
import { extractBillFromPdf } from "@/app/utils/pdfOcr";
import InvoiceGenerationModal from "../projects/components/InvoiceGenerationModal";
import {
  RiUploadLine,
  RiDeleteBin6Line,
  RiCloseLine,
  RiFileTextLine,
  RiCheckLine,
  RiDownloadLine,
  RiEdit2Line,
  RiBillLine,
  RiEyeLine,
} from "react-icons/ri";

interface Invoice {
  id: string;
  data?: {
    amount: number;
    description: string;
  };
  is_approved: boolean;
}

interface StepBill {
  id: string;
  amount: number;
  description: string;
  stepId: string;
  stepName?: string;
  projectId: string;
  projectName?: string;
  invoice_file: string | undefined;
  file_size?: number;
  uploaded_by_name?: string;
  uploaded_at?: string;
  is_submitted_to_admin?: boolean;
  stepInvoice?: Invoice | null;
}

interface Project {
  id: string;
  name: string;
}

interface Step {
  id: string;
  title: string;
}

export default function BillsPage() {
  const [projectId, setProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [stepBills, setStepBills] = useState<StepBill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [projectSteps, setProjectSteps] = useState<Record<string, Step[]>>({});
  const [steps, setSteps] = useState<Record<string, Step[]>>({});
  const [showForm, setShowForm] = useState<boolean>(false);
  const [form, setForm] = useState<{ step: string; files: File[] }>({
    step: "",
    files: [],
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");
  const [refresh, setRefresh] = useState<number>(0);
  const [backgroundRefresh, setBackgroundRefresh] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Invoice management state
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState<boolean>(false);
  
  // New invoice generation modal state
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState<boolean>(false);
  const [selectedStepForInvoice, setSelectedStepForInvoice] = useState<any>(null);
  
  // Remove invoice generation state - this belongs in Invoices & Billing section
  // const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  // const [invoiceGenerated, setInvoiceGenerated] = useState<boolean>(false);

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/supervisor_projects/`
      );
      const data = await response.json();
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const fetchProjectSteps = useCallback(async (projectId: string) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/steps/`
      );
      const data = await res.json();
      setProjectSteps((prev) => ({ ...prev, [projectId]: data }));
    } catch (error) {
      console.error("Failed to fetch steps:", error);
    }
  }, []);

  useEffect(() => {
    if (projectId && !projectSteps[projectId]) {
      fetchProjectSteps(projectId);
    }
  }, [projectId, projectSteps, fetchProjectSteps]);

  const fetchBills = useCallback(async () => {
    if (!backgroundRefresh) setLoading(true);
    try {
      const allBills: StepBill[] = [];

      const targetProjects = projectId
        ? projects.filter((p) => p.id === projectId)
        : projects;

      for (const project of targetProjects) {
        const projectRes = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${project.id}/`
        );
        if (!projectRes.ok) continue;

        const projectData = await projectRes.json();
        const stepsData: Step[] = projectData.steps || [];

        // Map step IDs to their invoice
        const stepInvoiceMap: Record<string, Invoice | null> = {};
        stepsData.forEach((step: Step & { invoice?: Invoice }) => {
          if (step.invoice) {
            stepInvoiceMap[step.id] = step.invoice;
          }
        });

        setSteps((prev) => ({
          ...prev,
          [project.id]: stepsData,
        }));

        for (const step of stepsData) {
          const billsRes = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/?step=${step.id}`
          );
          if (!billsRes.ok) continue;

          interface BillResponse {
            id: string;
            step: string;
            ocr_data?: { total: number };
            pdf?: string;
            file_size?: number;
            uploaded_by_name?: string;
            uploaded_at?: string;
            is_submitted_to_admin?: boolean;
            project_name?: string;
          }
          
          const billsData: BillResponse[] = await billsRes.json();

          allBills.push(
            ...billsData
              .filter((b) => b.step === step.id)
              .map((b) => ({
                id: b.id,
                amount: b.ocr_data?.total || 0,
                description: b.pdf?.split("/").pop() || "No description",
                invoice_file: b.pdf,
                stepId: step.id,
                stepName: step.title,
                projectId: project.id,
                projectName: projectData.name,
                file_size: b.file_size,
                uploaded_by_name: b.uploaded_by_name,
                uploaded_at: b.uploaded_at,
                is_submitted_to_admin: b.is_submitted_to_admin,
                stepInvoice: stepInvoiceMap[step.id] || null,
              }))
          );
        }
      }

      const uniqueBills = Array.from(
        new Map(allBills.map((bill) => [bill.id, bill])).values()
      );
      setStepBills(uniqueBills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setStepBills([]);
    } finally {
      setLoading(false);
      setBackgroundRefresh(false);
    }
  }, [projectId, projects, backgroundRefresh]);

  useEffect(() => {
    if (projects.length > 0) {
      fetchBills();
    }
  }, [projects, refresh, fetchBills]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm((f) => ({ ...f, files: [...f.files, ...files] }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !form.step || form.files.length === 0) {
      alert("Please select a step and upload at least one PDF.");
      return;
    }
    // Prevent duplicate bill for the same step
    const existingBill = stepBills.find(bill => bill.stepId === form.step);
    if (existingBill) {
      showToast("A bill already exists for this step. Only one bill per step is allowed.", "error");
      setSaving(false);
      return;
    }
    setSaving(true);
    try {
      for (const file of form.files) {
        // 1) OCR Extract
        let ocrPayload: any = {};
        try {
          const ocr = await extractBillFromPdf(file);
          console.log("OCR extraction successful:", ocr);
          showToast(`OCR Debug: Total=${ocr.total}, Items=${ocr.items?.length ?? 0}, Confidence=${ocr.confidence ?? 'N/A'}`,'info');
          ocrPayload = {
            raw_text: ocr.rawText,
            items: ocr.items,
            total: ocr.total,
            confidence: ocr.confidence,
            issues: ocr.issues,
            meta: ocr.meta,
          };
        } catch (ocrErr) {
          console.error("OCR extraction failed, continuing without OCR:", ocrErr);
          // Continue without OCR data - the backend will handle the bill upload
        }

        const fd = new FormData();
        fd.append("step", form.step);
        fd.append("project", projectId); // 
        fd.append("pdf", file);
        if (Object.keys(ocrPayload).length > 0) {
          // Send as plain text so DRF JSONField parses it from multipart
          fd.append("ocr_data", JSON.stringify(ocrPayload));
        }
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/`,
          {
            method: "POST",
            body: fd,
          }
        );
        if (!res.ok) throw new Error("Upload failed");
        // Optimistically add the new bill card
        const currentProject = projects.find((p) => p.id === projectId);
        const currentStep = steps[projectId]?.find((s) => s.id === form.step);  
        setStepBills((prev) => [
          {
            id: `temp-${Date.now()}-${Math.random()}`,
            amount: 0,
            description: file.name,
            invoice_file: "", // Can't know URL until backend returns
            stepId: form.step,
            stepName: currentStep?.title || "Unknown Step",
            projectId: projectId,
            projectName: currentProject?.name || "Unknown Project",
            file_size: file.size,
            uploaded_by_name: "You",
            uploaded_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      setShowForm(false);
      setForm({ step: "", files: [] });
      showToast("Bill uploaded successfully!");
      setBackgroundRefresh(true);
      setRefresh((r) => r + 1);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setSaving(false);
    }
  };
  

  const handleCancel = () => {
    setShowForm(false);
    setForm({ step: "", files: [] });
  };

  // Client-side OCR processing function
  const processWithClientSideOCR = async (bill: StepBill) => {
    try {
      if (!bill.invoice_file) {
        showToast("No PDF file available for OCR", "error");
        return;
      }

      showToast("Downloading PDF for client-side OCR...", "info");
      
      // Try to download the PDF file
      let response;
      try {
        response = await fetch(bill.invoice_file);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }
      } catch (fetchError) {
        console.error("Error fetching PDF:", fetchError);
        showToast("Failed to download PDF for OCR", "error");
        return;
      }
      
      const blob = await response.blob();
      const file = new File([blob], bill.description, { type: 'application/pdf' });
     
      // Import and use the OCR function
      const { extractBillFromPdf } = await import('@/app/utils/pdfOcr');
      const ocrResult = await extractBillFromPdf(file);
      
      console.log("Client-side OCR Result:", ocrResult);
      
      if (ocrResult.total > 0) {
        // Update the bill with the correct amount
        const updateResponse = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/${bill.id}/`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ocr_data: {
                total: ocrResult.total,
                items: ocrResult.items,
                raw_text: ocrResult.rawText
              }
            })
          }
        );
        
        if (updateResponse.ok) {
          showToast(`OCR completed! Total: ${ocrResult.total.toLocaleString()}`, "success");
          setRefresh(r => r + 1);
        } else {
          showToast("Failed to update bill with OCR data", "error");
        }
      } else {
        showToast("OCR completed but no total found", "error");
      }
    } catch (error) {
      console.error("Error in client-side OCR:", error);
      showToast("Failed to process OCR", "error");
    }
  };

  // Invoice management functions
  const handleViewInvoiceModal = async (stepId: string) => {
    setInvoiceLoading(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/by_step/?step=${stepId}`
      );
      if (response.ok) {
        const invoice = await response.json();
        setSelectedInvoice(invoice);
        setShowInvoiceModal(true);
      } else {
        // Create invoice if it doesn't exist
        const createResponse = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              step: stepId,
              data: {
                amount: 0,
                description: `Invoice for step`,
                line_items: [],
                status: 'DRAFT'
              }
            })
          }
        );
        if (createResponse.ok) {
          const newInvoice = await createResponse.json();
          setSelectedInvoice(newInvoice);
          setShowInvoiceModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      showToast("Failed to load invoice", "error");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleUpdateInvoice = async (invoiceId: string, updatedData: any) => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/${invoiceId}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: updatedData
          })
        }
      );
      if (response.ok) {
        const updatedInvoice = await response.json();
        setSelectedInvoice(updatedInvoice);
        showToast("Invoice updated successfully!");
      } else {
        showToast("Failed to update invoice", "error");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      showToast("Failed to update invoice", "error");
    }
  };

  

  const filteredBills = stepBills.filter((bill) => {
    const matchesProject = projectId ? bill.projectId === projectId : true;
    const matchesSearch = bill.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesProject && matchesSearch;
  });

  const totalBills = filteredBills.length;
  const submittedBills = filteredBills.filter((b) => b.is_submitted_to_admin).length;
  const pendingBills = filteredBills.filter((b) => !b.is_submitted_to_admin).length;
  const totalAmount = filteredBills.reduce((sum, b) => sum + b.amount, 0);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b4965] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <h2 className="text-2xl font-semibold mb-6">Project Bills</h2>

      {/* Filter/Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="p-2 border rounded-md w-full md:w-64"
          title="Filter by project"
          aria-label="Filter by project"
        >
          <option value="">All Projects</option>
          {Array.isArray(projects) && projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search bills..."
          className="p-2 border rounded-md flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add Bill Button (only show if a project is selected) */}
      {projectId && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <RiFileTextLine className="mr-2" />
            Add Bill
          </button>
        </div>
      )}

      {/* Project Name Card */}
      {projectId && (
        <div className="bg-blue-50 p-4 rounded-xl mb-6 flex items-center gap-3">
          <span className="text-2xl text-blue-600 font-bold">
            {projects.find((p) => p.id === projectId)?.name}
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl flex items-center gap-4">
          <RiFileTextLine className="text-3xl text-blue-600" />
          <div>
            <div className="text-xl font-bold">{totalBills}</div>
            <div className="text-blue-600">Total Bills</div>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-xl flex items-center gap-4">
          <RiCheckLine className="text-3xl text-green-600" />
          <div>
            <div className="text-xl font-bold">{submittedBills}</div>
            <div className="text-green-600">Submitted</div>
          </div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-xl flex items-center gap-4">
          <RiCloseLine className="text-3xl text-yellow-600" />
          <div>
            <div className="text-xl font-bold">{pendingBills}</div>
            <div className="text-yellow-600">Pending</div>
          </div>
        </div>
        <div className={`p-6 rounded-xl flex items-center gap-4 transition-all duration-300 ${
          // invoiceGenerated && generatedInvoice?.status === 'SUBMITTED' 
          //   ? 'bg-green-50 border-2 border-green-200' 
          //   : 'bg-purple-50'
          false ? 'bg-green-50 border-2 border-green-200' : 'bg-purple-50'
        }`}>
          <RiBillLine className={`text-3xl ${
            // invoiceGenerated && generatedInvoice?.status === 'SUBMITTED' 
            //   ? 'text-green-600' 
            //   : 'text-purple-600'
            false ? 'text-green-600' : 'text-purple-600'
          }`} />
          <div>
            <div className="text-xl font-bold">Rs. {totalAmount.toLocaleString('en-IN')}</div>
            <div className={false ? 'text-green-600' : 'text-purple-600'}>
              {/* {invoiceGenerated && generatedInvoice?.status === 'SUBMITTED' ? 'Invoice Submitted' : 'Total Amount'} */}
              Total Amount
            </div>
          </div>
        </div>
      </div>

      {/* Generate Invoice Button */}
      {projectId && filteredBills.length > 0 && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Invoice Generation</h3>
              <p className="text-purple-600">
                Generate professional invoices from your uploaded bills. Select bills and create detailed invoices for project steps.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => {
                  // Get the first step that has bills
                  const stepWithBills = filteredBills[0];
                  if (stepWithBills) {
                    // Create a mock step object for the modal
                    const mockStep = {
                      id: stepWithBills.stepId,
                      title: stepWithBills.stepName || 'Unknown Step',
                      project: {
                        name: stepWithBills.projectName || 'Unknown Project'
                      },
                      order: 1,
                      status: 'COMPLETED'
                    };
                    setSelectedStepForInvoice(mockStep);
                    setShowNewInvoiceModal(true);
                  }
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-semibold"
              >
                <RiFileTextLine className="text-xl" />
                Generate Invoice from Bills
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bills Grid/List */}
      {filteredBills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <RiFileTextLine className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bills found</h3>
          <p className="text-gray-500 text-center max-w-md">
            No bills match your current search criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map((bill) => {
            const fileSizeMB = bill.file_size ? (bill.file_size / (1024 * 1024)).toFixed(2) : "-";
            const uploadedDate = bill.uploaded_at ? new Date(bill.uploaded_at).toLocaleDateString() : "-";
            return (
              <div
                key={bill.id}
                className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-500 text-2xl">
                    <RiFileTextLine />
                  </span>
                  <span className="font-semibold text-gray-700">BILL</span>
                  <div className="ml-auto flex gap-3">
                    {bill.invoice_file && (
                      <a href={bill.invoice_file} download className="text-blue-600 hover:text-blue-800" title="Download">
                        <RiDownloadLine />
                      </a>
                    )}
                    {bill.invoice_file && (
                      <a href={bill.invoice_file} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800" title="View">
                        <RiFileTextLine />
                      </a>
                    )}
                    {/* Invoice Icon */}
                    <button
                      className="text-purple-600 hover:text-purple-800 ml-2"
                      title="View/Edit Invoice"
                      onClick={() => handleViewInvoiceModal(bill.stepId)}
                      disabled={invoiceLoading}
                    >
                      <RiBillLine />
                    </button>
                    {/* Edit Icon */}
                    <button
                      className="text-yellow-600 hover:text-yellow-800 ml-2"
                      title="Re-process OCR"
                      onClick={async () => {
                                                if (bill.amount === 0) {
                          try {
                            showToast("Re-processing OCR on server...", "info");
                            
                            // Use the server-side OCR re-processing endpoint
                            const response = await fetchWithAuth(
                              `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/${bill.id}/reprocess_ocr/`,
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                }
                              }
                            );
                            
                            if (response.ok) {
                              const result = await response.json();
                              console.log("OCR Re-processing Result:", result);
                              
                              if (result.status === 'success' && result.total > 0) {
                                showToast(`OCR completed! Total: ${result.total.toLocaleString()}`, "success");
                                setRefresh(r => r + 1);
                              } else if (result.status === 'warning') {
                                showToast(result.message, "error");
                              } else if (result.status === 'error' && result.message.includes('Binary PDF')) {
                                // Fallback to client-side OCR for binary PDFs
                                showToast("Binary PDF detected, using client-side OCR...", "info");
                                await processWithClientSideOCR(bill);
                              } else {
                                showToast("OCR completed but no total found", "error");
                              }
                            } else {
                              const errorData = await response.json();
                              if (errorData.message && errorData.message.includes('Binary PDF')) {
                                // Fallback to client-side OCR
                                showToast("Binary PDF detected, using client-side OCR...", "info");
                                await processWithClientSideOCR(bill);
                              } else {
                                showToast(`OCR failed: ${errorData.error || 'Unknown error'}`, "error");
                              }
                            }
                          } catch (error) {
                            console.error("Error re-processing OCR:", error);
                            showToast("Failed to re-process OCR", "error");
                          }
                        } else {
                          alert(`Edit bill: ${bill.id}`);
                        }
                      }}
                    >
                      {bill.amount === 0 ? <RiFileTextLine /> : <RiEdit2Line />}
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 ml-2"
                      title="Delete Bill"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this bill?')) {
                          const originalBills = [...stepBills];
                          const newBills = stepBills.filter(b => b.id !== bill.id);
                          setStepBills(newBills);

                          try {
                            const res = await fetchWithAuth(
                              `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/${bill.id}/`,
                              { method: 'DELETE' }
                            );
                            if (!res.ok) throw new Error('Delete failed');
                            setToast('Bill deleted successfully!');
                            setTimeout(() => setToast(''), 3000);
                          } catch {
                            setStepBills(originalBills);
                            alert(`Delete failed. ${error?.message ? `\n${error.message}` : ''}`);
                          }
                        }
                      }}
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </div>
                </div>
                <div className="font-bold text-lg break-all">{bill.description}</div>
                {!projectId && (
                  <div className="text-indigo-700 font-medium">
                    Project: {bill.projectName || "Unknown Project"}
                  </div>
                )}
                <div className="text-blue-700">
                  Step: {bill.stepName || "Unknown Step"}
                </div>
                <div className="text-gray-600 text-sm">File: {bill.description}</div>
                <div className="text-gray-600 text-sm">Size: {fileSizeMB} MB</div>
                <div className="text-gray-600 text-sm">Uploaded by: {bill.uploaded_by_name || "Unknown"}</div>
                <div className="text-gray-600 text-sm">Date: {uploadedDate}</div>
                {!bill.is_submitted_to_admin && (
                  <button
                    className="inline-block mt-2 px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
                    onClick={async () => {
                      try {
                        const res = await fetchWithAuth(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/${bill.id}/submit_to_admin/`,
                          { method: "POST" }
                        );
                        if (!res.ok) throw new Error("Failed to submit bill to admin");
                        setStepBills((prev) =>
                          prev.map((b) =>
                            b.id === bill.id ? { ...b, is_submitted_to_admin: true } : b
                          )
                        );
                        setToast("Bill submitted to admin!");
                        setTimeout(() => setToast(""), 3000);
                      } catch {
                        alert("Failed to submit bill to admin.");
                      }
                    }}
                  >
                    Submit to Admin
                  </button>
                )}
                {bill.is_submitted_to_admin && (
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                    Submitted to Admin
                  </span>
                )}
                {bill.stepInvoice && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Invoice</div>
                    <div>Amount: {bill.stepInvoice.data?.amount ?? "N/A"}</div>
                    <div>Description: {bill.stepInvoice.data?.description ?? "N/A"}</div>
                    <div>
                      Status:{" "}
                      {bill.stepInvoice.is_approved ? (
                        <span className="text-green-600 font-semibold">Approved</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">Pending Approval</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Add New Bill</h2>
              <button
                onClick={handleCancel}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
                title="Close form"
                aria-label="Close form"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-8 space-y-6">
              <div>
                <label
                  htmlFor="step-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Step
                </label>
                <select
                  id="step-select"
                  value={form.step}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, step: e.target.value }));
                  }}
                  required
                  className="w-full px-4 py-2 border rounded-md"
                  title="Select project step"
                  aria-label="Select project step"
                >
                  <option value="">-- Choose a step --</option>
                  {projectId && projectSteps[projectId]
                    ? projectSteps[projectId].map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))
                    : null}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Bill (PDF)
                </label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <RiUploadLine className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="application/pdf"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>
                {form.files.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {form.files.map((f) => f.name).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
                  disabled={saving}
                >
                  <RiUploadLine className="mr-2" />
                  {saving ? "Uploading..." : "Upload Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Invoice Management</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Invoice Header */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold text-blue-800">Invoice Details</h3>
                    <p className="text-sm text-blue-600">#{selectedInvoice.data.invoice_number || 'N/A'}</p>
                    <p className="text-sm text-blue-600">{selectedInvoice.step_title}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Status</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      selectedInvoice.data.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      selectedInvoice.data.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                      selectedInvoice.data.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedInvoice.status_display}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Total Amount</h3>
                    <p className="text-lg font-bold text-blue-600">₹{selectedInvoice.total_amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Line Items</h3>
                <div className="space-y-2">
                  {selectedInvoice.data.line_items && selectedInvoice.data.line_items.length > 0 ? (
                    selectedInvoice.data.line_items.map((item: any, index: number) => (
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

              {/* Related Bills */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Related Bills</h3>
                <div className="space-y-2">
                  {selectedInvoice.related_bills && selectedInvoice.related_bills.length > 0 ? (
                    selectedInvoice.related_bills.map((bill: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium">Bill #{bill.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">Uploaded by: {bill.uploaded_by}</p>
                          <p className="text-sm text-gray-600">OCR Total: ₹{bill.ocr_total}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {bill.pdf && (
                            <a
                              href={bill.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title="View Bill"
                            >
                              <RiEyeLine />
                            </a>
                          )}
                          <span className={`px-2 py-1 rounded text-xs ${
                            bill.is_submitted_to_admin ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bill.is_submitted_to_admin ? 'Submitted' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No bills uploaded yet</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
                {selectedInvoice.data.status === 'DRAFT' && (
                  <button
                    onClick={() => {
                      // This functionality has been moved to the Invoices & Billing section
                      alert('Please use the Invoices & Billing section to submit invoices to admin.');
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Submit to Admin
                  </button>
                )}
              </div>
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
            setRefresh(r => r + 1);
          }}
          onInvoiceGenerated={(invoice) => {
            setShowNewInvoiceModal(false);
            setSelectedStepForInvoice(null);
            setRefresh(r => r + 1);
            showToast("Invoice generated successfully!", "success");
          }}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className="fixed top-20 right-20 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-3">
            {toast.includes('successfully') ? (
              <RiCheckLine className="text-xl" />
            ) : toast.includes('Failed') ? (
              <RiCloseLine className="text-xl" />
            ) : (
              <RiFileTextLine className="text-xl" />
            )}
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}