import { useState, useEffect } from "react";
import { RiCloseLine } from "react-icons/ri";
import { fetchWithAuth } from "@/app/utils/auth";
import { jsPDF } from "jspdf";

interface SupervisorInvoiceModalProps {
  open: boolean;
  step: any;
  invoice: any[]; // Array of existing invoices
  onClose: () => void;
  onSaved?: () => void;
}

const getThumbnailUrl = (thumbnail: string) => {
  if (!thumbnail) return "";
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
    return thumbnail;
  }
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}/media/${thumbnail}`;
};

const fetchImageAsBase64 = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const fetchImageFromPublicAsBase64 = async (filename: string) => {
  const response = await fetch(`/assets/images/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load image: ${filename}`);
  }
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (!result.startsWith("data:image/")) {
        reject("Not a valid image");
      } else {
        resolve(result);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function SupervisorInvoiceModal({
  open,
  step,
  invoice,
  onClose,
  onSaved,
}: SupervisorInvoiceModalProps) {
  const [form, setForm] = useState({
    files: [] as File[],
  });
  const [saving, setSaving] = useState(false);
  const [billStatus, setBillStatus] = useState("Pending");
  const [existingBills, setExistingBills] = useState<any[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  // Fetch existing bills when modal opens
  useEffect(() => {
    if (open && step?.id) {
      fetchExistingBills();
    }
  }, [open, step?.id]);

  const fetchExistingBills = async () => {
    setLoadingBills(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/by_step/?step=${step.id}`
      );
      if (response.ok) {
        const bills = await response.json();
        setExistingBills(bills);
        
        // Update bill status based on existing bills
        if (bills.length > 0) {
          const hasSubmittedBills = bills.some((bill: any) => bill.is_submitted_to_admin);
          setBillStatus(hasSubmittedBills ? "Submitted" : "Uploaded");
        } else {
          setBillStatus("Pending");
        }
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoadingBills(false);
    }
  };

  useEffect(() => {
    if (invoice && invoice.length > 0) {
      setBillStatus("Submitted");
    } else if (existingBills.length > 0) {
      const hasSubmittedBills = existingBills.some((bill: any) => bill.is_submitted_to_admin);
      setBillStatus(hasSubmittedBills ? "Submitted" : "Uploaded");
    } else {
      setBillStatus("Pending");
    }
  }, [invoice, existingBills]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ files: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.files.length === 0) {
      alert("Please upload at least one PDF bill.");
      return;
    }
    setSaving(true);
    try {
      for (const file of form.files) {
        const fd = new FormData();
        fd.append("step", step.id);
        fd.append("pdf", file);
        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/`, {
          method: "POST",
          body: fd,
        });
      }
      
      // Refresh bills data after upload
      await fetchExistingBills();
      setBillStatus("Uploaded");
      onSaved && onSaved();
      onClose();
    } catch (err) {
      alert("Failed to submit bills.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitToAdmin = async () => {
    if (existingBills.length === 0) {
      alert("No bills to submit to admin.");
      return;
    }
    
    setSaving(true);
    try {
      // Submit all bills to admin
      for (const bill of existingBills) {
        if (!bill.is_submitted_to_admin) {
          await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/${bill.id}/submit_to_admin/`,
            { method: 'POST' }
          );
        }
      }
      
      // Refresh bills data
      await fetchExistingBills();
      setBillStatus("Submitted");
      setToast("Bills submitted to admin successfully!");
      onSaved && onSaved();
    } catch (error) {
      console.error("Error submitting bills:", error);
      alert("Failed to submit bills to admin.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (existingBills.length === 0) {
      alert("No bills available to generate invoice.");
      return;
    }

    setSaving(true);
    try {
      // Calculate total amount from bills
      const totalAmount = existingBills.reduce((sum, bill) => {
        return sum + (bill.ocr_data?.total || 0);
      }, 0);

      // Create line items from bills
      const lineItems = existingBills.map((bill, index) => ({
        description: bill.pdf ? bill.pdf.split("/").pop() : `Bill ${index + 1}`,
        quantity: 1,
        rate: bill.ocr_data?.total || 0,
        amount: bill.ocr_data?.total || 0,
        bill_id: bill.id
      }));

      // Generate invoice data
      const invoiceData = {
        amount: totalAmount,
        description: `Invoice for ${step.title}`,
        line_items: lineItems,
        invoice_number: `INV-${step.project?.name?.slice(0, 3)?.toUpperCase() || 'PROJ'}-${step.order || 1}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        invoice_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: 'DRAFT'
      };

      setGeneratedInvoice(invoiceData);
      setInvoiceGenerated(true);
      setToast("Invoice generated successfully!");
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice.");
    } finally {
      setSaving(false);
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
          <title>Invoice - ${step.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .line-items { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SAAN HOMES</h1>
            <h2>INVOICE</h2>
          </div>
          
          <div class="invoice-details">
            <div>
              <strong>Project:</strong> ${step.project?.name || 'N/A'}<br>
              <strong>Step:</strong> ${step.title}<br>
              <strong>Invoice #:</strong> ${generatedInvoice.invoice_number}
            </div>
            <div>
              <strong>Date:</strong> ${generatedInvoice.invoice_date}<br>
              <strong>Due Date:</strong> ${generatedInvoice.due_date}<br>
              <strong>Status:</strong> ${generatedInvoice.status}
            </div>
          </div>
          
          <div class="line-items">
            <h3>Line Items</h3>
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
                    <td>${item.rate.toLocaleString()}</td>
                    <td>${item.amount.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="total">
            <strong>Total Amount: ₹${generatedInvoice.amount.toLocaleString()}</strong>
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
      let logo = await fetchImageFromPublicAsBase64("logo-01.png");

      if (step?.thumbnail) {
        try {
          logo = await fetchImageAsBase64(getThumbnailUrl(step.thumbnail));
        } catch (e) {
          console.warn("Using fallback logo from public folder");
        }
      }

      const imageTypeMatch = logo.match(/^data:image\/(png|jpeg|jpg);base64,/i);
      const imageType = imageTypeMatch?.[1]?.toUpperCase() || "PNG";

      const doc = new jsPDF();
      
      // Add logo
      doc.addImage(logo, imageType, 10, 8, 25, 15);
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("SAAN HOMES", 40, 18);
      
      doc.setFontSize(14);
      doc.setTextColor(80, 80, 80);
      doc.text("INVOICE", 10, 32);
      
      // Invoice details
      doc.setDrawColor(180, 180, 180);
      doc.line(10, 35, 200, 35);
      
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      let y = 45;
      
      doc.text(`Invoice #: ${generatedInvoice.invoice_number}`, 10, y);
      doc.text(`Date: ${generatedInvoice.invoice_date}`, 120, y);
      y += 8;
      
      doc.text(`Project: ${step.project?.name || 'N/A'}`, 10, y);
      doc.text(`Due Date: ${generatedInvoice.due_date}`, 120, y);
      y += 8;
      
      doc.text(`Step: ${step.title}`, 10, y);
      y += 15;
      
      // Line items table
      doc.setFontSize(10);
      doc.text("Description", 10, y);
      doc.text("Qty", 100, y);
      doc.text("Rate", 130, y);
      doc.text("Amount", 170, y);
      y += 8;
      
      doc.line(10, y, 200, y);
      y += 5;
      
      generatedInvoice.line_items.forEach((item: any) => {
        doc.text(item.description.substring(0, 30), 10, y);
        doc.text(item.quantity.toString(), 100, y);
        doc.text(`₹${item.rate.toLocaleString()}`, 130, y);
        doc.text(`₹${item.amount.toLocaleString()}`, 170, y);
        y += 6;
      });
      
      y += 5;
      doc.line(10, y, 200, y);
      y += 8;
      
      // Total
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Amount: ₹${generatedInvoice.amount.toLocaleString()}`, 120, y);
      
      // Footer
      y += 20;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("Generated by Saan Homes Supervisor Portal", 10, y);
      
      doc.save(`Invoice_${step.title}_${generatedInvoice.invoice_number}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF.");
    }
  };

  const handleSubmitInvoiceToAdmin = async () => {
    if (!generatedInvoice) {
      alert("No invoice to submit.");
      return;
    }
    
    setSaving(true);
    try {
      // Submit invoice to admin (you can implement this API call)
      // For now, we'll just update the status
      setGeneratedInvoice({
        ...generatedInvoice,
        status: 'SUBMITTED'
      });
      
      setToast("Invoice submitted to admin successfully!");
      onSaved && onSaved();
    } catch (error) {
      console.error("Error submitting invoice:", error);
      alert("Failed to submit invoice to admin.");
    } finally {
      setSaving(false);
    }
  };

  const setToast = (message: string) => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const handleDownload = async () => {
    try {
      let logo = await fetchImageFromPublicAsBase64("logo-01.png");

      if (step?.thumbnail) {
        try {
          logo = await fetchImageAsBase64(getThumbnailUrl(step.thumbnail));
        } catch (e) {
          console.warn("Using fallback logo from public folder");
        }
      }

      const imageTypeMatch = logo.match(/^data:image\/(png|jpeg|jpg);base64,/i);
      const imageType = imageTypeMatch?.[1]?.toUpperCase() || "PNG";

      const doc = new jsPDF();
      doc.addImage(logo, imageType, 10, 8, 25, 15);
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("Saan Homes", 40, 18);
      doc.setFontSize(14);
      doc.setTextColor(80, 80, 80);
      doc.text("Step Invoice", 10, 32);
      doc.setDrawColor(180, 180, 180);
      doc.line(10, 35, 200, 35);
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      let y = 45;
      doc.text(`Step:`, 10, y);
      doc.text(`${step?.title || ""}`, 40, y);
      y += 10;
      doc.text(`Amount:`, 10, y);
      y += 30;
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("Generated by Saan Homes Supervisor Portal", 10, y);
      doc.save(`Invoice_${step?.title || "step"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF.");
    }
  };

  const handleClose = () => {
    // Reset invoice state when closing
    setInvoiceGenerated(false);
    setGeneratedInvoice(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Step Invoice</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Status */}
        <div className="mb-4">
          <span className="text-sm font-medium">Bill Status:</span>
          <span
            className={`ml-2 px-2 py-1 rounded text-white text-xs ${
              billStatus === "Submitted" ? "bg-green-600" : 
              billStatus === "Uploaded" ? "bg-blue-600" : "bg-red-500"
            }`}
          >
            {billStatus}
          </span>
        </div>

        {/* Existing Bills */}
        {existingBills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Uploaded Bills:</h4>
            <ul className="space-y-2">
              {existingBills.map((bill, index) => (
                <li key={index} className="text-sm flex items-center justify-between border-b pb-2">
                  <div className="flex-1">
                    <span>{bill.pdf ? bill.pdf.split("/").pop() : `Bill ${index + 1}`}</span>
                    <div className="text-xs text-gray-500">
                      Uploaded: {new Date(bill.uploaded_at).toLocaleDateString()}
                      {bill.ocr_data?.total && ` | Amount: ₹${bill.ocr_data.total}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${bill.pdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                    <span className={`px-2 py-1 rounded text-xs ${
                      bill.is_submitted_to_admin ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bill.is_submitted_to_admin ? 'Submitted' : 'Pending'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading state */}
        {loadingBills && (
          <div className="mb-4 text-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-1">Loading bills...</p>
          </div>
        )}

        {/* Generated Invoice Details */}
        {invoiceGenerated && generatedInvoice && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Generated Invoice</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Invoice #:</span> {generatedInvoice.invoice_number}
              </div>
              <div>
                <span className="font-medium">Total Amount:</span> ₹{generatedInvoice.amount.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Date:</span> {generatedInvoice.invoice_date}
              </div>
              <div>
                <span className="font-medium">Due Date:</span> {generatedInvoice.due_date}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  generatedInvoice.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {generatedInvoice.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Upload Bill (PDF only)</label>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex gap-4 mt-6 flex-wrap">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? "Uploading..." : "Upload Bill"}
            </button>
            {existingBills.length > 0 && (
              <button
                type="button"
                onClick={handleSubmitToAdmin}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? "Submitting..." : "Submit to Admin"}
              </button>
            )}
            <button
              type="button"
              onClick={handleGenerateInvoice}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? "Generating..." : "Generate Invoice"}
            </button>
            {invoiceGenerated && (
              <button
                type="button"
                onClick={handleViewInvoice}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                View Invoice
              </button>
            )}
            {invoiceGenerated && (
              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="flex-1 px-4 py-2 border border-blue-500 text-blue-700 rounded-lg hover:bg-blue-50"
              >
                Download Invoice
              </button>
            )}
            {invoiceGenerated && (
              <button
                type="button"
                onClick={handleSubmitInvoiceToAdmin}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Submit Invoice to Admin
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
