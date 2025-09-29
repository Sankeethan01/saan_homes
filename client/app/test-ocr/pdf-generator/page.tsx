"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import {
  RiFilePdfLine,
  RiDownloadLine,
  RiSettingsLine,
  RiEyeLine,
  RiRefreshLine,
} from "react-icons/ri";

interface BillData {
  invoiceNumber: string;
  date: string;
  vendor: {
    name: string;
    address: string;
    phone: string;
  };
  client: {
    name: string;
    address: string;
  };
  project: string;
  step: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
}

export default function PDFGeneratorPage() {
  const [billData, setBillData] = useState<BillData>({
    invoiceNumber: "INV-2024-001",
    date: new Date().toLocaleDateString(),
    vendor: {
      name: "SAAN Excellence Engineering PVT LTD",
      address: "No.47, Courts Road, Point Pedo, Jaffna",
      phone: "+94 77 727 6391"
    },
    client: {
      name: "Sample Construction Client",
      address: "123 Client Street, Client City, State 12345"
    },
    project: "Modern Residential Construction",
    step: "Foundation Work",
    items: [
      {
        description: "Cement Bags (53 Grade)",
        quantity: 50,
        rate: 350.00,
        amount: 17500.00
      },
      {
        description: "Sand (Fine) - Cubic Meter",
        quantity: 5,
        rate: 1800.00,
        amount: 9000.00
      },
      {
        description: "Aggregate (20mm) - Cubic Meter",
        quantity: 7,
        rate: 1200.00,
        amount: 8400.00
      },
      {
        description: "Steel Reinforcement Bars (10mm)",
        quantity: 200,
        rate: 65.00,
        amount: 13000.00
      },
      {
        description: "Binding Wire",
        quantity: 10,
        rate: 80.00,
        amount: 800.00
      }
    ],
    subtotal: 48700.00,
    taxRate: 18,
    tax: 8766.00,
    total: 57466.00
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Set font
      doc.setFont("helvetica");
      
      // Colors
      const primaryColor = [27, 73, 101]; // #1b4965
      const secondaryColor = [100, 100, 100]; // #646464
      const lightGray = [240, 240, 240]; // #f0f0f0
      
      // Header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("BILL / INVOICE", pageWidth / 2, 20, { align: "center" });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Invoice details
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Bill No: ${billData.invoiceNumber}`, 20, 50);
      doc.text(`Date: ${billData.date}`, pageWidth - 20, 50, { align: "right" });
      
      // From/To section
      let yPos = 70;
      
      // From section
      doc.setFont("helvetica", "bold");
      doc.text("From:", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(billData.vendor.name, 20, yPos + 10);
      doc.text(billData.vendor.address, 20, yPos + 20);
      doc.text(billData.vendor.phone, 20, yPos + 30);
      
      // To section
      doc.setFont("helvetica", "bold");
      doc.text("To:", pageWidth - 20, yPos, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.text(billData.client.name, pageWidth - 20, yPos + 10, { align: "right" });
      doc.text(billData.client.address, pageWidth - 20, yPos + 20, { align: "right" });
      
      yPos += 50;
      
      // Project details
      doc.setFont("helvetica", "bold");
      doc.text(`Project: ${billData.project}`, 20, yPos);
      doc.text(`Step: ${billData.step}`, 20, yPos + 10);
      
      yPos += 30;
      
      // Table header
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(20, yPos - 5, pageWidth - 40, 15, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Description", 25, yPos + 5);
      doc.text("Qty", 120, yPos + 5);
      doc.text("Rate", 140, yPos + 5);
      doc.text("Amount", pageWidth - 25, yPos + 5, { align: "right" });
      
      yPos += 20;
      
      // Table rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      billData.items.forEach((item, index) => {
        // Alternate row colors for better readability
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(20, yPos - 3, pageWidth - 40, 12, 'F');
        }
        
        doc.text(item.description, 25, yPos + 5);
        doc.text(item.quantity.toString(), 120, yPos + 5);
        doc.text(`$${item.rate.toFixed(2)}`, 140, yPos + 5);
        doc.text(`$${item.amount.toFixed(2)}`, pageWidth - 25, yPos + 5, { align: "right" });
        
        yPos += 12;
      });
      
      yPos += 10;
      
      // Financial summary
      const summaryX = pageWidth - 80;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      doc.text("Subtotal:", summaryX, yPos, { align: "right" });
      doc.text(`$${billData.subtotal.toFixed(2)}`, pageWidth - 20, yPos, { align: "right" });
      yPos += 10;
      
      doc.text(`Tax (${billData.taxRate}%):`, summaryX, yPos, { align: "right" });
      doc.text(`$${billData.tax.toFixed(2)}`, pageWidth - 20, yPos, { align: "right" });
      yPos += 10;
      
      // Total line
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Total:", summaryX, yPos, { align: "right" });
      doc.text(`$${billData.total.toFixed(2)}`, pageWidth - 20, yPos, { align: "right" });
      
      yPos += 30;
      
      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("Payment Terms: Net 30 days", 20, yPos);
      doc.text("Thank you for your business!", pageWidth - 20, yPos, { align: "right" });
      
      // Save the PDF
      const fileName = `bill-${billData.invoiceNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHighQualityPDF = () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Use larger font sizes and better spacing for OCR
      doc.setFont("helvetica");
      
      // Colors - high contrast for better OCR
      const primaryColor = [0, 0, 0]; // Pure black
      const secondaryColor = [50, 50, 50]; // Dark gray
      
      // Header with high contrast
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("BILL / INVOICE", pageWidth / 2, 22, { align: "center" });
      
      // Reset text color to black
      doc.setTextColor(0, 0, 0);
      
      // Invoice details with larger font
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Bill No: ${billData.invoiceNumber}`, 25, 55);
      doc.text(`Date: ${billData.date}`, pageWidth - 25, 55, { align: "right" });
      
      // From/To section with better spacing
      let yPos = 80;
      
      // From section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("From:", 25, yPos);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(billData.vendor.name, 25, yPos + 12);
      doc.text(billData.vendor.address, 25, yPos + 24);
      doc.text(billData.vendor.phone, 25, yPos + 36);
      
      // To section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("To:", pageWidth - 25, yPos, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(billData.client.name, pageWidth - 25, yPos + 12, { align: "right" });
      doc.text(billData.client.address, pageWidth - 25, yPos + 24, { align: "right" });
      
      yPos += 60;
      
      // Project details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Project: ${billData.project}`, 25, yPos);
      doc.text(`Step: ${billData.step}`, 25, yPos + 15);
      
      yPos += 40;
      
      // Table header with high contrast
      doc.setFillColor(240, 240, 240);
      doc.rect(25, yPos - 8, pageWidth - 50, 20, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Description", 30, yPos + 5);
      doc.text("Qty", 130, yPos + 5);
      doc.text("Rate", 150, yPos + 5);
      doc.text("Amount", pageWidth - 30, yPos + 5, { align: "right" });
      
      yPos += 25;
      
      // Table rows with better spacing
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      billData.items.forEach((item, index) => {
        // Clear background for each row
        doc.setFillColor(255, 255, 255);
        doc.rect(25, yPos - 5, pageWidth - 50, 15, 'F');
        
        // Add border for better table definition
        doc.setDrawColor(200, 200, 200);
        doc.rect(25, yPos - 5, pageWidth - 50, 15, 'S');
        
        doc.text(item.description, 30, yPos + 5);
        doc.text(item.quantity.toString(), 130, yPos + 5);
        doc.text(`$${item.rate.toFixed(2)}`, 150, yPos + 5);
        doc.text(`$${item.amount.toFixed(2)}`, pageWidth - 30, yPos + 5, { align: "right" });
        
        yPos += 15;
      });
      
      yPos += 15;
      
      // Financial summary with larger fonts
      const summaryX = pageWidth - 100;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      
      doc.text("Subtotal:", summaryX, yPos, { align: "right" });
      doc.text(`$${billData.subtotal.toFixed(2)}`, pageWidth - 30, yPos, { align: "right" });
      yPos += 15;
      
      doc.text(`Tax (${billData.taxRate}%):`, summaryX, yPos, { align: "right" });
      doc.text(`$${billData.tax.toFixed(2)}`, pageWidth - 30, yPos, { align: "right" });
      yPos += 15;
      
      // Total line with emphasis
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Total:", summaryX, yPos, { align: "right" });
      doc.text(`$${billData.total.toFixed(2)}`, pageWidth - 30, yPos, { align: "right" });
      
      yPos += 30;
      
      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("Payment Terms: Net 30 days", 25, yPos);
      doc.text("Thank you for your business!", pageWidth - 25, yPos, { align: "right" });
      
      // Save the PDF
      const fileName = `high-quality-bill-${billData.invoiceNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateBillData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBillData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof BillData] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setBillData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addItem = () => {
    setBillData(prev => ({
      ...prev,
      items: [...prev.items, { description: "New Item", quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setBillData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (index: number) => {
    setBillData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const recalculateTotals = () => {
    const subtotal = billData.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (billData.taxRate / 100);
    const total = subtotal + tax;
    
    setBillData(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-[#e3f0ff] to-[#cbeafe] rounded-xl">
              <RiFilePdfLine className="text-[#1b4965] text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1b4965]">OCR-Optimized PDF Generator</h1>
              <p className="text-gray-600">Generate high-quality bills optimized for OCR processing</p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <RiEyeLine className="text-green-600 text-lg mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">OCR Optimization Features:</h3>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li>High contrast text (black on white) for better OCR accuracy</li>
                  <li>Larger font sizes and better spacing for readability</li>
                  <li>Clear table structure with defined borders</li>
                  <li>Consistent formatting and alignment</li>
                  <li>Standardized bill format for reliable parsing</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bill Data Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-[#1b4965] mb-4">Bill Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={billData.invoiceNumber}
                  onChange={(e) => updateBillData('invoiceNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="text"
                  value={billData.date}
                  onChange={(e) => updateBillData('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <input
                  type="text"
                  value={billData.project}
                  onChange={(e) => updateBillData('project', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Step</label>
                <input
                  type="text"
                  value={billData.step}
                  onChange={(e) => updateBillData('step', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                />
              </div>
            </div>

            {/* Vendor/Client Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={billData.vendor.name}
                  onChange={(e) => updateBillData('vendor.name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Address</label>
                <input
                  type="text"
                  value={billData.vendor.address}
                  onChange={(e) => updateBillData('vendor.address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={billData.client.name}
                  onChange={(e) => updateBillData('client.name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  value={billData.taxRate}
                  onChange={(e) => updateBillData('taxRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Line Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1b4965]">Line Items</h2>
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
                {billData.items.map((item, index) => (
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
                          recalculateTotals();
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
                          recalculateTotals();
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
              <p className="text-sm text-gray-600">Subtotal: ${billData.subtotal.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Tax ({billData.taxRate}%): ${billData.tax.toFixed(2)}</p>
              <p className="text-lg font-bold text-[#1b4965]">Total: ${billData.total.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        {/* Generate Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-[#1b4965] mb-4">Generate PDF</h2>
          
          <div className="flex gap-4">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-[#1b4965] text-white px-6 py-3 rounded-lg hover:bg-[#003049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RiFilePdfLine className="text-lg" />
              {isGenerating ? "Generating..." : "Generate Standard PDF"}
            </button>
            
            <button
              onClick={generateHighQualityPDF}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RiSettingsLine className="text-lg" />
              {isGenerating ? "Generating..." : "Generate OCR-Optimized PDF"}
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Recommended for OCR Testing:</h3>
            <p className="text-sm text-blue-800">
              Use the "OCR-Optimized PDF" option for best results. It features larger fonts, 
              high contrast, and better spacing specifically designed for OCR processing.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
