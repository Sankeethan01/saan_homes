"use client";

import { useState } from "react";
import { motion } from "framer-motion";
// OCR utils will be imported dynamically to avoid SSR issues
import {
  RiFileTextLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiEyeLine,
  RiDownloadLine,
} from "react-icons/ri";

export default function ParseTestPage() {
  const [ocrText, setOcrText] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);

  const sampleOCRText = `BILL / INVOICE

Bill No: INV-2024-001
Date: 9/28/2025

From:
SAAN Excellence Engineering PVT LTD
No.47, Courts Road, Point Pedo, Jaffna
+94 77 727 6391

To:
Sample Construction Client
123 Client Street, Client City, State 12345

Project: Modern Residential Construction
Step: Foundation Work

Description                    Qty    Rate    Amount
Cement Bags (53 Grade)         50     $350.00  $17,500.00
Sand (Fine) - Cubic Meter      5      $1,800.00 $9,000.00
Aggregate (20mm) - Cubic Meter 7      $1,200.00 $8,400.00
Steel Reinforcement Bars (10mm) 200   $65.00   $13,000.00
Binding Wire                   10     $80.00   $800.00

Subtotal: $48,700.00
Tax (18%): $8,766.00
Total: $57,466.00

Payment Terms: Net 30 days
Thank you for your business!`;

  const handleParse = async () => {
    if (!ocrText.trim()) {
      alert("Please enter OCR text to parse");
      return;
    }

    try {
      // Dynamically import OCR utils to avoid SSR issues
      const { parseBillData, validateOCRResult } = await import("@/app/utils/ocrUtils");
      
      const parsed = parseBillData(ocrText);
      setParsedData(parsed);

      // Create a mock OCR result for validation
      const mockOCRResult = {
        text: ocrText,
        confidence: 85.5,
        processingTime: 2.3,
        wordCount: ocrText.split(/\s+/).length,
        pageCount: 1,
        pages: [{
          pageNumber: 1,
          text: ocrText,
          confidence: 85.5
        }]
      };

      const validationResult = validateOCRResult(mockOCRResult);
      setValidation(validationResult);
    } catch (error) {
      console.error("Parsing error:", error);
      alert("Error parsing OCR text: " + (error as Error).message);
    }
  };

  const downloadParsedData = () => {
    if (!parsedData) return;
    
    const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "parsed-bill-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-[#e3f0ff] to-[#cbeafe] rounded-xl">
              <RiFileTextLine className="text-[#1b4965] text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1b4965]">Bill Data Parser Test</h1>
              <p className="text-gray-600">Test enhanced OCR text parsing and validation</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <RiEyeLine className="text-blue-600 text-lg mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Enhanced Features:</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Multiple pattern matching for better data extraction</li>
                  <li>Enhanced invoice number, date, and vendor detection</li>
                  <li>Project and step information extraction</li>
                  <li>Improved line items parsing with validation</li>
                  <li>OCR result quality validation and suggestions</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <RiErrorWarningLine className="text-yellow-600 text-lg mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">How to Get Real OCR Results:</h3>
                <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                  <li><strong>Generate PDF:</strong> Go to <code>/test-ocr/pdf-generator</code> and create an OCR-optimized PDF</li>
                  <li><strong>Process with OCR:</strong> Go to <code>/test-ocr/advanced</code> and upload your generated PDF</li>
                  <li><strong>Copy OCR Text:</strong> Copy the extracted text from the advanced OCR results</li>
                  <li><strong>Test Parser:</strong> Paste the real OCR text here to test the enhanced parser</li>
                </ol>
                <p className="text-xs text-yellow-700 mt-2">
                  <strong>Note:</strong> This page is for testing the parser with real OCR results, not for OCR processing itself.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-[#1b4965] mb-4">OCR Text Input</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste your OCR text here:
              </label>
              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent font-mono text-sm"
                placeholder="Paste OCR extracted text here..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOcrText(sampleOCRText)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Load Sample Text
              </button>
              
              <button
                onClick={handleParse}
                disabled={!ocrText.trim()}
                className="flex items-center gap-2 bg-[#1b4965] text-white px-6 py-2 rounded-lg hover:bg-[#003049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RiFileTextLine className="text-lg" />
                Parse Bill Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Validation Results */}
        {validation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-6 shadow border ${
              validation.isValid 
                ? "bg-green-50 border-green-200" 
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {validation.isValid ? (
                <RiCheckLine className="text-green-600 text-lg" />
              ) : (
                <RiErrorWarningLine className="text-yellow-600 text-lg" />
              )}
              <h3 className={`text-lg font-semibold ${
                validation.isValid ? "text-green-900" : "text-yellow-900"
              }`}>
                OCR Quality Validation
              </h3>
            </div>

            <div className="space-y-3">
              {validation.issues.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Issues Found:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {validation.issues.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Suggestions:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {validation.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Parsed Data Results */}
        {parsedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1b4965]">Parsed Bill Summary</h3>
                <button
                  onClick={downloadParsedData}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <RiDownloadLine className="text-lg" />
                  Download JSON
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parsedData.invoiceNumber && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Invoice Number</p>
                    <p className="text-lg font-bold text-blue-900">{parsedData.invoiceNumber}</p>
                  </div>
                )}
                
                {parsedData.date && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Date</p>
                    <p className="text-lg font-bold text-green-900">{parsedData.date}</p>
                  </div>
                )}
                
                {parsedData.vendor && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Vendor</p>
                    <p className="text-lg font-bold text-purple-900">{parsedData.vendor}</p>
                  </div>
                )}
                
                {parsedData.client && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">Client</p>
                    <p className="text-lg font-bold text-orange-900">{parsedData.client}</p>
                  </div>
                )}
                
                {parsedData.project && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-600 font-medium">Project</p>
                    <p className="text-lg font-bold text-indigo-900">{parsedData.project}</p>
                  </div>
                )}
                
                {parsedData.step && (
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <p className="text-sm text-pink-600 font-medium">Step</p>
                    <p className="text-lg font-bold text-pink-900">{parsedData.step}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4">Financial Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Subtotal</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${parsedData.subtotal.toLocaleString()}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Tax</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    ${parsedData.tax.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${parsedData.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            {parsedData.items.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Line Items ({parsedData.items.length})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parsedData.items.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">${item.rate.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">${item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3">Raw Parsed Data (JSON)</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(parsedData, null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
