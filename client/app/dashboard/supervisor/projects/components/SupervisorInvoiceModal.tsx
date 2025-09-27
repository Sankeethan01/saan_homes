import { useState, useEffect } from "react";
import { RiCloseLine } from "react-icons/ri";
import { fetchWithAuth } from "@/app/utils/auth";
import { jsPDF } from "jspdf";

interface Step {
  id: string;
  title: string;
  thumbnail?: string;
}

interface Invoice {
  id: string;
  amount: number;
  date: string;
  status: string;
}

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
  onClose,
  onSaved,
}: SupervisorInvoiceModalProps) {
  const [form] = useState({
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
    } catch {
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
      // Build detailed line items from each bill's OCR data
      const lineItems: any[] = [];
      existingBills.forEach((bill: any, index: number) => {
        const items = bill?.ocr_data?.items || [];
        if (Array.isArray(items) && items.length > 0) {
          items.forEach((it: any, idx: number) => {
            const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
            const rate = Number(it.unitPrice ?? it.rate ?? 0) || 0;
            const amount = Number(it.amount ?? qty * rate) || (qty * rate);
            const desc = (it.description || it.itemName || `Item ${idx + 1}`).toString();
            lineItems.push({
              description: desc,
              quantity: qty,
              rate: rate,
              amount: amount,
              bill_id: bill.id,
            });
          });
        } else {
          const billTotal = Number(bill?.ocr_data?.total || 0) || 0;
          const name = bill.pdf ? bill.pdf.split("/").pop() : `Bill ${index + 1}`;
          lineItems.push({
            description: `${name} - Construction Materials`,
            quantity: 1,
            rate: billTotal,
            amount: billTotal,
            bill_id: bill.id,
          });
        }
      });

      // Consolidate duplicate descriptions
      const consolidated = new Map<string, any>();
      lineItems.forEach((li) => {
        const key = String(li.description).trim().toLowerCase();
        if (consolidated.has(key)) {
          const ex = consolidated.get(key)!;
          ex.quantity += li.quantity;
          ex.amount += li.amount;
          ex.rate = ex.amount / Math.max(1, ex.quantity);
          ex.bill_id += `,${li.bill_id}`;
        } else {
          consolidated.set(key, { ...li });
        }
      });
      const finalItems = Array.from(consolidated.values());
      const totalAmount = finalItems.reduce((s, it) => s + (Number(it.amount) || 0), 0);

      const invoiceData = {
        amount: totalAmount,
        description: `Invoice for ${step.title}`,
        line_items: finalItems,
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
                    <td>${item.rate.toLocaleString('en-LK')}</td>
                    <td>${item.amount.toLocaleString('en-LK')}</td>
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
        doc.text(`Rs. ${item.rate.toLocaleString('en-LK')}`, 130, y);
        doc.text(`Rs. ${item.amount.toLocaleString('en-LK')}`, 170, y);
        y += 6;
      });
      
      y += 5;
      doc.line(10, y, 200, y);
      y += 8;
      
      // Total
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Amount: Rs. ${generatedInvoice.amount.toLocaleString('en-LK')}`, 120, y);
      
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
    if (!generatedInvoice || !step?.id) {
      alert("No invoice to submit.");
      return;
    }
    setSaving(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      // find invoice for this step
      let invoiceId: string | null = null;
      try {
        const res = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/by_step/?step=${step.id}`);
        if (res.ok) {
          const inv = await res.json();
          invoiceId = inv.id;
        }
      } catch (_) {}

      if (!invoiceId) {
        // create a draft first
        const createRes = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: step.id, data: { ...generatedInvoice, status: 'DRAFT' } })
        });
        if (createRes.ok) {
          const created = await createRes.json();
          invoiceId = created.id;
        }
      }

      if (!invoiceId) throw new Error('Unable to resolve invoice id');

      // submit action
      const submitRes = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/${invoiceId}/submit_to_admin/`, { method: 'POST' });
      if (!submitRes.ok) throw new Error('Submit failed');

      setGeneratedInvoice({ ...generatedInvoice, status: 'SUBMITTED' });
      setToast("Invoice submitted to admin successfully!");
      onSaved && onSaved();
    } catch (error) {
      console.error("Error submitting invoice:", error);
      alert("Failed to submit invoice to admin.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateFromLatestBill = async () => {
    if (!step?.id) return;
    setSaving(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      // fetch bills for this step (most recent first)
      const res = await fetchWithAuth(`${apiBaseUrl}/projects/bills/by_step/?step=${step.id}`);
      if (!res.ok) throw new Error('Failed to fetch bills');
      const bills = await res.json();
      if (!Array.isArray(bills) || bills.length === 0) {
        alert('No bills uploaded for this step');
        return;
      }
      const latest = bills[0];
      const items: any[] = (latest?.ocr_data?.items || []).map((it: any) => {
        const qty = Number(it.quantity || it.qty || 1) || 1;
        const rate = Number(it.rate || it.unitPrice || 0) || 0;
        const amount = Number(it.amount || qty * rate) || (qty * rate);
        return {
          description: it.description || it.itemName || 'Item',
          quantity: qty,
          rate: rate,
          amount: amount,
        };
      });
      // if OCR didn't list items, fall back to a single total item
      if (items.length === 0) {
        const totalVal = Number(latest?.ocr_data?.total || 0) || 0;
        items.push({ description: `Bill ${latest.id}`, quantity: 1, rate: totalVal, amount: totalVal });
      }
      const subtotal = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
      const taxRate = 0.10; // 10%
      const tax = Math.round(subtotal * taxRate * 100) / 100;
      const grandTotal = Math.round((subtotal + tax) * 100) / 100;
      const invNoPrefix = (step.project?.name || 'INV').slice(0, 3).toUpperCase();
      const invoice_number = `INV-${invNoPrefix}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`;
      const inv = {
        invoice_number,
        date: new Date().toISOString().slice(0,10),
        line_items: items,
        subtotal,
        tax_rate: 10,
        tax_amount: tax,
        amount: grandTotal,
        status: 'DRAFT',
        client: step.project?.client_name || 'Client',
        project: step.project?.name || '',
      } as any;
      setGeneratedInvoice(inv);
      setToast('Invoice generated from latest bill');
    } catch (e) {
      console.error(e);
      alert('Failed to generate invoice from bill');
    } finally {
      setSaving(false);
    }
  };

  const renderStyledInvoicePDF = async () => {
    if (!generatedInvoice) {
      alert('No invoice generated');
      return;
    }
    try {
      let logo = await fetchImageFromPublicAsBase64('logo-01.png');
      const imageTypeMatch = logo.match(/^data:image\/(png|jpeg|jpg);base64,/i);
      const imageType = imageTypeMatch?.[1]?.toUpperCase() || 'PNG';

      const doc = new jsPDF('p','mm','a4');
      // Header
      doc.setFont('helvetica','bold');
      doc.setFontSize(22);
      doc.setTextColor(20,20,200);
      doc.text('INVOICE', 105, 18, { align: 'center' });

      doc.addImage(logo, imageType, 15, 12, 18, 12);
      doc.setTextColor(0,0,0);
      doc.setFontSize(10);
      doc.setFont('helvetica','normal');
      const invNo = generatedInvoice.invoice_number || 'INV-XXXX';
      const dateStr = generatedInvoice.date || new Date().toISOString().slice(0,10);
      doc.text(`Invoice No: ${invNo}`, 15, 32);
      doc.text(`Date: ${dateStr}`, 15, 37);

      // Bill To / From
      doc.setFont('helvetica','bold');
      doc.text('BILL TO:', 15, 50);
      doc.text('FROM:', 120, 50);
      doc.setFont('helvetica','normal');
      doc.text(`Client: ${generatedInvoice.client || 'Customer'}`, 15, 58);
      doc.text(`Project: ${generatedInvoice.project || step.project?.name || ''}`, 15, 63);
      doc.text('SAAN HOMES', 120, 58);
      doc.text('Construction & Development', 120, 63);
      doc.text('Sri Lanka', 120, 68);
      doc.text('Email: info@saanhomes.com', 120, 73);

      // Items table header
      let y = 90;
      doc.setFillColor(18,51,87);
      doc.setTextColor(255,255,255);
      doc.rect(15, y-7, 180, 8, 'F');
      doc.setFont('helvetica','bold');
      doc.text('DESCRIPTION', 20, y-1);
      doc.text('QTY', 115, y-1);
      doc.text('PRICE (Rs.)', 135, y-1);
      doc.text('TOTAL (Rs.)', 165, y-1);

      // Rows
      doc.setFont('helvetica','normal');
      doc.setTextColor(0,0,0);
      let rowY = y + 3;
      const items: any[] = generatedInvoice.line_items || generatedInvoice.items || [];
      items.forEach((it, idx) => {
        const desc = String(it.description || 'Item');
        const qty = Number(it.quantity || 0);
        const rate = Number(it.rate || 0);
        const amt = Number(it.amount != null ? it.amount : qty * rate);
        // grid lines
        doc.setDrawColor(200,200,200);
        doc.line(15, rowY - 6, 195, rowY - 6);
        // text
        doc.text(desc, 20, rowY);
        doc.text(String(qty), 118, rowY, { align: 'right' });
        doc.text(rate.toLocaleString('en-LK'), 150, rowY, { align: 'right' });
        doc.text(amt.toLocaleString('en-LK'), 190, rowY, { align: 'right' });
        rowY += 8;
      });
      doc.line(15, rowY - 6, 195, rowY - 6);

      // Totals box
      const subtotal = Number(generatedInvoice.subtotal ?? items.reduce((s,it)=>s + (Number(it.amount || (Number(it.quantity||0)*Number(it.rate||0)))||0),0));
      const tax = Number(generatedInvoice.tax_amount ?? Math.round(subtotal * 0.10 * 100)/100);
      const grand = Number(generatedInvoice.amount ?? subtotal + tax);
      const boxTop = rowY + 6;
      doc.setDrawColor(150,150,150);
      doc.rect(115, boxTop, 80, 30);
      doc.setFont('helvetica','bold');
      doc.text('Subtotal', 120, boxTop + 8);
      doc.text('Tax (10%)', 120, boxTop + 16);
      doc.setFillColor(18,51,87);
      doc.setTextColor(255,255,255);
      doc.rect(120, boxTop + 20, 70, 8, 'F');
      doc.text('Grand Total', 122, boxTop + 26);
      doc.setTextColor(0,0,0);
      doc.setFont('helvetica','normal');
      doc.text(subtotal.toLocaleString('en-LK'), 190, boxTop + 8, { align: 'right' });
      doc.text(tax.toLocaleString('en-LK'), 190, boxTop + 16, { align: 'right' });
      doc.setTextColor(255,255,255);
      doc.setFont('helvetica','bold');
      doc.text(grand.toLocaleString('en-LK'), 188, boxTop + 26, { align: 'right' });

      // Notes / Payment info
      doc.setTextColor(0,0,0);
      doc.setFont('helvetica','bold');
      doc.text('Note:', 15, boxTop + 45);
      doc.setFont('helvetica','normal');
      doc.text('Payment due within 30 days of invoice date.\nThank you for choosing Saan Homes for your construction needs.', 15, boxTop + 51);
      doc.setFont('helvetica','bold');
      doc.text('Payment Information:', 120, boxTop + 45);
      doc.setFont('helvetica','normal');
      doc.text('Bank: Commercial Bank of Ceylon\nAccount No: 123-456-7890\nEmail: accounts@saanhomes.com\nDue Date: ' + (new Date(Date.now()+30*86400000).toLocaleDateString()), 120, boxTop + 51);

      const fileName = `Invoice_${(step.project?.name||'Project').replace(/\s+/g,'_')}_${invNo}.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error('PDF render failed', e);
      alert('Failed to render invoice PDF');
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
        } catch {
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
            {invoiceGenerated && (
              <button
                type="button"
                onClick={handleGenerateFromLatestBill}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Generate from Latest Bill
              </button>
            )}
            {invoiceGenerated && (
              <button
                type="button"
                onClick={renderStyledInvoicePDF}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Download Styled Invoice
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
