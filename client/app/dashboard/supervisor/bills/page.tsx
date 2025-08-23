"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/auth";
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

interface StepBill {
  id: string;
  amount: number;
  description: string;
  stepId: string;
  stepName?: string;
  projectId: string;
  projectName?: string;
  invoice_file: string;
  file_size?: number;
  uploaded_by_name?: string;
  uploaded_at?: string;
  is_submitted_to_admin?: boolean;
  stepInvoice?: any;
}

interface Invoice {
  id: string;
  step_title: string;
  project_name: string;
  project_id: string;
  step_order: number;
  data: {
    amount: number;
    description: string;
    line_items: any[];
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    status: string;
  };
  related_bills: any[];
  total_amount: number;
  line_items_count: number;
  status_display: string;
  is_approved: boolean;
  created: string;
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
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedStepId, setSelectedStepId] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [stepMap, setStepMap] = useState<Record<string, string>>({});
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
  
  // Remove invoice generation state - this belongs in Invoices & Billing section
  // const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  // const [invoiceGenerated, setInvoiceGenerated] = useState<boolean>(false);

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const params = useParams();

  useEffect(() => {
    const fetchProjects = async () => {
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
    };
    fetchProjects();
  }, []);

  const fetchProjectSteps = async (projectId: string) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/steps/`
      );
      const data = await res.json();
      setProjectSteps((prev) => ({ ...prev, [projectId]: data }));
    } catch (error) {
      console.error("Failed to fetch steps:", error);
    }
  };

  useEffect(() => {
    if (projectId && !projectSteps[projectId]) {
      fetchProjectSteps(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    const fetchBills = async () => {
      if (!backgroundRefresh) setLoading(true);
      try {
        let allBills: StepBill[] = [];

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
          const stepInvoiceMap: Record<string, any> = {};
          stepsData.forEach((step: any) => {
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

            const billsData = await billsRes.json();

            allBills.push(
              ...billsData
                .filter((b: any) => b.step === step.id)
                .map((b: any) => ({
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
    };

    if (projects.length > 0) {
      fetchBills();
    }
  }, [projectId, projects, refresh]);

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
    setSaving(true);
    try {
      for (const file of form.files) {
        const fd = new FormData();
        fd.append("step", form.step);
        fd.append("project", projectId); // ✅ Include projectId
        fd.append("pdf", file);
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
        const currentStep = steps[projectId]?.find((s) => s.id === form.step);  // <-- fixed here
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

  // Remove invoice generation functions
  // const handleGenerateInvoice = async () => {
  //   if (filteredBills.length === 0) {
  //     alert("No bills available to generate invoice.");
  //     return;
  //   }

  //   console.log("Generating invoice for bills:", filteredBills); // Debug log

  //   try {
  //     // Calculate total amount from bills
  //     const totalAmount = filteredBills.reduce((sum, bill) => {
  //       return sum + (bill.amount || 0);
  //     }, 0);

  //     console.log("Total amount calculated:", totalAmount); // Debug log

  //     // Create line items from bills
  //     const lineItems = filteredBills.map((bill, index) => ({
  //       description: bill.description || 'Bill',
  //       quantity: 1,
  //       rate: bill.amount || 0,
  //       amount: bill.amount || 0,
  //       bill_id: bill.id,
  //       step_name: bill.stepName || 'Unknown Step',
  //       project_name: bill.projectName || 'Unknown Project'
  //     }));

  //     // Generate invoice data
  //     const invoiceData = {
  //       amount: totalAmount,
  //       description: `Invoice for ${projectId ? projects.find(p => p.id === projectId)?.name : 'All Projects'}`,
  //       line_items: lineItems,
  //       invoice_number: `INV-${projectId ? projects.find(p => p.id === projectId)?.name?.slice(0, 3)?.toUpperCase() : 'ALL'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
  //       invoice_date: new Date().toISOString().slice(0, 10),
  //       due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  //       status: 'DRAFT',
  //       project_id: projectId,
  //       total_bills: filteredBills.length
  //     };

  //     console.log("Generated invoice data:", invoiceData); // Debug log

  //     setGeneratedInvoice(invoiceData);
  //     setInvoiceGenerated(true);
  //     showToast("Invoice generated successfully!");
  //   } catch (error) {
  //     console.error("Error generating invoice:", error);
  //     alert("Failed to generate invoice.");
  //   }
  // };

  // const handleViewInvoice = () => {
  //   if (!generatedInvoice) return;
    
  //   // Create a new window to display the invoice
  //   const invoiceWindow = window.open('', '_blank');
  //   if (invoiceWindow) {
  //     invoiceWindow.document.write(`
  //       <!DOCTYPE html>
  //       <html>
  //       <head>
  //         <title>Invoice - ${generatedInvoice.description}</title>
  //         <style>
  //           body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
  //           .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  //           .header { text-align: center; border-bottom: 3px solid #1b4965; padding-bottom: 20px; margin-bottom: 30px; }
  //           .header h1 { color: #1b4965; margin: 0; font-size: 32px; }
  //           .header h2 { color: #666; margin: 10px 0 0 0; font-size: 18px; }
  //           .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 6px; }
  //           .line-items { margin-bottom: 30px; }
  //           table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  //           th, td { padding: 15px; text-align: left; border-bottom: 1px solid #ddd; }
  //           th { background-color: #1b4965; color: white; font-weight: bold; }
  //           tr:nth-child(even) { background-color: #f8f9fa; }
  //           .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; padding: 20px; background: #e3f2fd; border-radius: 6px; }
  //           .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="container">
  //           <div class="header">
  //             <h1>SAAN HOMES</h1>
  //             <h2>INVOICE</h2>
  //           </div>
            
  //           <div class="invoice-details">
  //             <div>
  //               <strong>Project:</strong> ${generatedInvoice.description}<br>
  //               <strong>Invoice #:</strong> ${generatedInvoice.invoice_number}<br>
  //               <strong>Total Bills:</strong> ${generatedInvoice.total_bills}
  //             </div>
  //             <div>
  //               <strong>Date:</strong> ${generatedInvoice.invoice_date}<br>
  //               <strong>Due Date:</strong> ${generatedInvoice.due_date}<br>
  //               <strong>Status:</strong> ${generatedInvoice.status}
  //             </div>
  //           </div>
            
  //           <div class="line-items">
  //             <h3 style="color: #1b4965; border-bottom: 2px solid #1b4965; padding-bottom: 10px;">Bill Details</h3>
  //             <table>
  //               <thead>
  //                 <tr>
  //                   <th>Description</th>
  //                   <th>Step</th>
  //                   <th>Project</th>
  //                   <th>Amount (₹)</th>
  //                 </tr>
  //               </thead>
  //               <tbody>
  //                 ${generatedInvoice.line_items.map((item: any) => `
  //                   <tr>
  //                     <td>${item.description}</td>
  //                     <td>${item.step_name || 'N/A'}</td>
  //                     <td>${item.project_name || 'N/A'}</td>
  //                     <td>₹${item.amount.toLocaleString()}</td>
  //                   </tr>
  //                 `).join('')}
  //               </tbody>
  //             </table>
  //           </div>
            
  //           <div class="total">
  //             <strong>Total Amount: ₹${generatedInvoice.amount.toLocaleString()}</strong>
  //           </div>
            
  //           <div class="footer">
  //             <p>Generated by Saan Homes Supervisor Portal</p>
  //             <p>Thank you for your business!</p>
  //           </div>
  //         </div>
  //       </body>
  //       </html>
  //     `);
  //     invoiceWindow.document.close();
  //   }
  // };

  // const handleDownloadInvoice = async () => {
  //   if (!generatedInvoice) return;
    
  //   try {
  //     // Import jsPDF dynamically
  //     const jsPDFModule = await import('jspdf');
  //     const jsPDF = jsPDFModule.default || jsPDFModule;
      
  //     const doc = new jsPDF();
      
  //     // Header
  //     doc.setFontSize(24);
  //     doc.setTextColor(27, 73, 101); // #1b4965
  //     doc.text("SAAN HOMES", 105, 20, { align: 'center' });
      
  //     doc.setFontSize(16);
  //     doc.setTextColor(102, 102, 102);
  //     doc.text("INVOICE", 105, 35, { align: 'center' });
      
  //     // Invoice details
  //     doc.setDrawColor(27, 73, 101);
  //     doc.line(20, 45, 190, 45);
      
  //     doc.setFontSize(12);
  //     doc.setTextColor(51, 51, 51);
  //     let y = 60;
      
  //     doc.text(`Invoice #: ${generatedInvoice.invoice_number}`, 20, y);
  //     doc.text(`Date: ${generatedInvoice.invoice_date}`, 120, y);
  //     y += 10;
      
  //     doc.text(`Project: ${generatedInvoice.description}`, 20, y);
  //     doc.text(`Due Date: ${generatedInvoice.due_date}`, 120, y);
  //     y += 10;
      
  //     doc.text(`Total Bills: ${generatedInvoice.total_bills}`, 20, y);
  //     y += 20;
      
  //     // Line items table
  //     doc.setFontSize(10);
  //     doc.text("Description", 20, y);
  //     doc.text("Step", 80, y);
  //     doc.text("Project", 120, y);
  //     doc.text("Amount (₹)", 170, y);
  //     y += 8;
      
  //     doc.line(20, y, 190, y);
  //     y += 5;
      
  //     generatedInvoice.line_items.forEach((item: any) => {
  //       doc.text(item.description.substring(0, 25), 20, y);
  //       doc.text(item.step_name?.substring(0, 15) || 'N/A', 80, y);
  //       doc.text(item.project_name?.substring(0, 15) || 'N/A', 120, y);
  //       doc.text(`₹${item.amount.toLocaleString()}`, 170, y);
  //       y += 6;
  //     });
      
  //     y += 5;
  //     doc.line(20, y, 190, y);
  //     y += 10;
      
  //     // Total
  //     doc.setFontSize(14);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text(`Total Amount: ₹${generatedInvoice.amount.toLocaleString()}`, 170, y, { align: 'right' });
      
  //     // Footer
  //     y += 20;
  //     doc.setFontSize(8);
  //     doc.setTextColor(102, 102, 102);
  //     doc.text("Generated by Saan Homes Supervisor Portal", 105, y, { align: 'center' });
      
  //     doc.save(`Invoice_${generatedInvoice.invoice_number}.pdf`);
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     alert("Failed to generate PDF. Please make sure jsPDF is installed.");
  //   }
  // };

  // const handleSubmitInvoiceToAdmin = async () => {
  //   if (!generatedInvoice) {
  //     alert("No invoice to submit.");
  //     return;
  //   }
    
  //   try {
  //     // Update invoice status with submission date
  //     const updatedInvoice = {
  //       ...generatedInvoice,
  //       status: 'SUBMITTED',
  //       submitted_date: new Date().toISOString(),
  //       submitted_at: new Date().toLocaleString()
  //     };
      
  //     setGeneratedInvoice(updatedInvoice);
  //     showToast("Invoice submitted to admin successfully!");
      
  //     // Update the project step invoice status
  //     if (projectId) {
  //       try {
  //         // Get the current project data
  //         const projectResponse = await fetchWithAuth(
  //           `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/`
  //         );
          
  //         if (projectResponse.ok) {
  //           const projectData = await projectResponse.json();
            
  //           // Find the step that matches the invoice
  //           const targetStep = projectData.steps?.find((step: any) => 
  //             step.title === generatedInvoice.description.replace('Invoice for ', '')
  //           );
            
  //           if (targetStep) {
  //             // Update the step's invoice status
  //             const stepUpdateResponse = await fetchWithAuth(
  //               `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/steps/${targetStep.id}/`,
  //               {
  //                 method: 'PATCH',
  //                 headers: {
  //                   'Content-Type': 'application/json',
  //                 },
  //                 body: JSON.stringify({
  //                   invoice: {
  //                     id: generatedInvoice.invoice_number,
  //                     is_approved: false,
  //                     amount: generatedInvoice.amount,
  //                     description: generatedInvoice.description,
  //                     data: {
  //                       status: 'SUBMITTED',
  //                       submitted_at: updatedInvoice.submitted_at,
  //                       invoice_number: generatedInvoice.invoice_number
  //                     }
  //                   }
  //                 })
  //               }
  //             );
              
  //             if (stepUpdateResponse.ok) {
  //               showToast("Invoice status updated in project successfully!");
  //               // Refresh the page data
  //               setRefresh(r => r + 1);
  //             }
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Error updating project step:", error);
  //         // Don't fail the whole operation if this fails
  //       }
  //     }
      
  //   } catch (error) {
  //     console.error("Error submitting invoice:", error);
  //     alert("Failed to submit invoice to admin.");
  //   }
  // };

  // const handleResetInvoice = () => {
  //   setInvoiceGenerated(false);
  //   setGeneratedInvoice(null);
  //   showToast("Invoice reset. You can generate a new one.");
  // };

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
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
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
            <div className="text-xl font-bold">₹{totalAmount.toLocaleString()}</div>
            <div className={false ? 'text-green-600' : 'text-purple-600'}>
              {/* {invoiceGenerated && generatedInvoice?.status === 'SUBMITTED' ? 'Invoice Submitted' : 'Total Amount'} */}
              Total Amount
            </div>
          </div>
        </div>
      </div>

      {/* Invoice generation has been moved to the Invoices & Billing section */}

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
                      title="Edit Bill"
                      onClick={() => {
                        alert(`Edit bill: ${bill.id}`);
                      }}
                    >
                      <RiEdit2Line />
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
                            showToast('Bill deleted successfully!');
                          } catch (error) {
                            setStepBills(originalBills);
                            alert('Delete failed.');
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
                  <div className="mt-2 space-y-1">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                      Uploaded - Pending Submission
                    </span>
                    <button
                      className="block w-full mt-1 px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
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
                          showToast("Bill submitted to admin!");
                        } catch (error) {
                          alert("Failed to submit bill to admin.");
                        }
                      }}
                    >
                      Submit to Admin
                    </button>
                  </div>
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
                  value={form.step}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, step: e.target.value }));
                    setStepMap((prev) => ({ ...prev, [projectId]: e.target.value }));
                  }}
                  required
                  className="w-full px-4 py-2 border rounded-md"
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

      {/* Toast Notifications */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0"
          style={{
            background: toast.includes('successfully') ? '#22c55e' : toast.includes('Failed') ? '#ef4444' : '#3b82f6',
            color: 'white',
            minWidth: '300px',
          }}
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