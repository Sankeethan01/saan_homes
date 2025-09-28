"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { createWorker } from "tesseract.js";
import {
  RiFileTextLine,
  RiUploadLine,
  RiDownloadLine,
  RiCloseLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
} from "react-icons/ri";

interface SimpleOCRResult {
  text: string;
  confidence: number;
  processingTime: number;
}

export default function SimpleOCRTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<SimpleOCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        setSelectedFile(file);
        setError(null);
        setOcrResult(null);
      } else {
        setError("Please select an image or PDF file");
        setSelectedFile(null);
      }
    }
  };

  const processFileWithOCR = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOcrResult(null);
    setProgress(0);
    setStatus("Initializing OCR engine...");

    const startTime = Date.now();

    try {
      // Create a worker for Tesseract.js
      setStatus("Loading OCR engine...");
      setProgress(10);
      
      setStatus("Loading OCR engine...");
      setProgress(20);
      const worker = await createWorker("eng");
      
      setStatus("OCR engine ready...");
      setProgress(30);

      setStatus("Processing file...");
      setProgress(50);

      // For images, process directly. For PDFs, we'd need PDF.js integration
      if (selectedFile.type.startsWith("image/")) {
        const { data } = await worker.recognize(selectedFile);
        
        setStatus("Finalizing results...");
        setProgress(90);
        
        const processingTime = (Date.now() - startTime) / 1000;
        
        const result: SimpleOCRResult = {
          text: data.text,
          confidence: data.confidence || 0,
          processingTime: Math.round(processingTime * 100) / 100,
        };

        setOcrResult(result);
        setStatus("Completed!");
        setProgress(100);
      } else {
        setError("PDF processing requires the advanced OCR test page. Please use an image file for this simple test.");
      }

      await worker.terminate();

    } catch (err) {
      console.error("OCR processing error:", err);
      setError(err instanceof Error ? err.message : "Failed to process file with OCR");
      setStatus("Error occurred during processing");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!ocrResult) return;
    
    const blob = new Blob([ocrResult.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-result-${selectedFile?.name.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setSelectedFile(null);
    setOcrResult(null);
    setError(null);
    setProgress(0);
    setStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-40 h-40 bg-[#e3f0ff] rounded-full blur-3xl opacity-60 -z-10" />
      <div className="fixed top-1/2 right-0 w-48 h-48 bg-[#ffe3ec] rounded-full blur-3xl opacity-50 -z-10" />
      <div className="fixed bottom-0 left-1/3 w-56 h-56 bg-[#e3ffe9] rounded-full blur-3xl opacity-40 -z-10" />
      
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
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
              <h1 className="text-2xl font-bold text-[#1b4965]">Simple OCR Test</h1>
              <p className="text-gray-600">Test OCR with image files (no DataCloneError)</p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <RiCheckLine className="text-green-600 text-lg mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Fixed Issues:</h3>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li>Removed logger function that caused DataCloneError</li>
                  <li>Simplified worker creation and initialization</li>
                  <li>Manual progress tracking without worker callbacks</li>
                  <li>Better error handling and type safety</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* File Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-[#1b4965] mb-4">Upload Image File</h2>
          
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload-simple"
              />
              <label
                htmlFor="file-upload-simple"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1b4965] hover:bg-gray-50 transition-colors"
              >
                <div className="text-center">
                  <RiUploadLine className="text-3xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload image or PDF file
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Images work best for this simple test
                  </p>
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <RiFileTextLine className="text-[#1b4965] text-lg" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearAll}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RiCloseLine className="text-lg" />
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={processFileWithOCR}
                disabled={!selectedFile || isProcessing}
                className="flex items-center gap-2 bg-[#1b4965] text-white px-6 py-2 rounded-lg hover:bg-[#003049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <RiLoader4Line className="text-lg animate-spin" />
                ) : (
                  <RiFileTextLine className="text-lg" />
                )}
                {isProcessing ? "Processing..." : "Process with OCR"}
              </button>
              
              {ocrResult && (
                <button
                  onClick={downloadResult}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <RiDownloadLine className="text-lg" />
                  Download Result
                </button>
              )}
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
                <span className="text-gray-700">{status}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#1b4965] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
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

        {/* OCR Results */}
        {ocrResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1b4965]">OCR Results</h3>
              <div className="flex items-center gap-2 text-green-600">
                <RiCheckLine className="text-lg" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Confidence</p>
                <p className="text-2xl font-bold text-blue-900">{ocrResult.confidence.toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Processing Time</p>
                <p className="text-2xl font-bold text-green-900">{ocrResult.processingTime}s</p>
              </div>
            </div>

            {/* Extracted Text */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Extracted Text:</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {ocrResult.text || "No text detected"}
                </pre>
              </div>
            </div>
          </motion.div>
        )}

        {/* Technical Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
        >
          <h3 className="font-semibold text-yellow-900 mb-3">Fix Applied</h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>• <strong>DataCloneError Fixed:</strong> Removed logger function that couldn't be cloned to worker</p>
            <p>• <strong>Simplified Worker:</strong> Using basic createWorker() without complex configuration</p>
            <p>• <strong>Manual Progress:</strong> Progress tracking without worker callbacks</p>
            <p>• <strong>Type Safety:</strong> Added proper type checking for confidence values</p>
            <p>• <strong>Error Handling:</strong> Better error messages and fallback values</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
