"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { createWorker } from "tesseract.js";
import {
  RiFileTextLine,
  RiUploadLine,
  RiDownloadLine,
  RiEyeLine,
  RiCloseLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiFilePdfLine,
} from "react-icons/ri";

interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
  wordCount: number;
  pageCount: number;
  pages: Array<{
    pageNumber: number;
    text: string;
    confidence: number;
  }>;
}

interface ProcessingStatus {
  currentPage: number;
  totalPages: number;
  currentStep: string;
  progress: number;
}

export default function AdvancedOCRTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>({
    currentPage: 0,
    totalPages: 0,
    currentStep: "",
    progress: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setError(null);
        setOcrResult(null);
      } else {
        setError("Please select a PDF file");
        setSelectedFile(null);
      }
    }
  };

  const convertPDFToImages = async (pdfFile: File): Promise<string[]> => {
    // Dynamically import PDF.js only on the client side
    const pdfjsLib = await import("pdfjs-dist");
    
    // Configure PDF.js worker to use the bundled worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      setStatus(prev => ({
        ...prev,
        currentStep: `Converting page ${pageNum} to image...`,
        currentPage: pageNum,
        totalPages: pdf.numPages,
        progress: (pageNum / pdf.numPages) * 30, // 30% for PDF conversion
      }));

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context!,
        viewport: viewport,
      }).promise;

      const imageDataUrl = canvas.toDataURL("image/png");
      images.push(imageDataUrl);
    }

    return images;
  };

  const processImageWithOCR = async (imageDataUrl: string, pageNumber: number): Promise<{ text: string; confidence: number }> => {
    // Update progress manually since logger function causes DataCloneError
    setStatus(prev => ({
      ...prev,
      currentStep: `Processing page ${pageNumber} with OCR...`,
      progress: 30 + ((pageNumber - 1) / prev.totalPages) * 60,
    }));

    const worker = await createWorker("eng");

    const { data } = await worker.recognize(imageDataUrl);
    await worker.terminate();

    return {
      text: data.text,
      confidence: data.confidence || 0,
    };
  };

  const processPDFWithOCR = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOcrResult(null);
    setStatus({
      currentPage: 0,
      totalPages: 0,
      currentStep: "Initializing...",
      progress: 0,
    });

    const startTime = Date.now();

    try {
      // Step 1: Convert PDF to images
      setStatus(prev => ({ ...prev, currentStep: "Converting PDF to images..." }));
      const images = await convertPDFToImages(selectedFile);

      // Step 2: Process each image with OCR
      setStatus(prev => ({ ...prev, currentStep: "Processing images with OCR..." }));
      const pageResults = [];
      let totalConfidence = 0;

      for (let i = 0; i < images.length; i++) {
        // Update progress for each page
        setStatus(prev => ({
          ...prev,
          currentStep: `Processing page ${i + 1} of ${images.length} with OCR...`,
          currentPage: i + 1,
          progress: 30 + ((i + 1) / images.length) * 60,
        }));

        const result = await processImageWithOCR(images[i], i + 1);
        pageResults.push({
          pageNumber: i + 1,
          text: result.text,
          confidence: result.confidence,
        });
        totalConfidence += result.confidence;
      }

      // Step 3: Combine results
      setStatus(prev => ({ ...prev, currentStep: "Combining results...", progress: 95 }));
      
      const combinedText = pageResults.map(page => 
        `--- Page ${page.pageNumber} ---\n${page.text}\n`
      ).join("\n");

      const processingTime = (Date.now() - startTime) / 1000;
      const averageConfidence = totalConfidence / pageResults.length;
      const wordCount = combinedText.split(/\s+/).filter(word => word.length > 0).length;

      const result: OCRResult = {
        text: combinedText,
        confidence: Math.round(averageConfidence * 100) / 100,
        processingTime: Math.round(processingTime * 100) / 100,
        wordCount,
        pageCount: images.length,
        pages: pageResults,
      };

      setOcrResult(result);
      setStatus(prev => ({ ...prev, currentStep: "Completed!", progress: 100 }));

    } catch (err) {
      console.error("OCR processing error:", err);
      setError(err instanceof Error ? err.message : "Failed to process PDF with OCR");
      setStatus(prev => ({ ...prev, currentStep: "Error occurred" }));
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
    a.download = `ocr-result-${selectedFile?.name.replace('.pdf', '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setSelectedFile(null);
    setOcrResult(null);
    setError(null);
    setStatus({
      currentPage: 0,
      totalPages: 0,
      currentStep: "",
      progress: 0,
    });
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
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
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
              <h1 className="text-2xl font-bold text-[#1b4965]">Advanced OCR Test</h1>
              <p className="text-gray-600">Full PDF processing with Tesseract.js and PDF.js</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <RiEyeLine className="text-blue-600 text-lg mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Advanced Features:</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Full PDF.js integration for multi-page PDF processing</li>
                  <li>High-resolution image conversion for better OCR accuracy</li>
                  <li>Page-by-page processing with individual confidence scores</li>
                  <li>Real-time progress tracking for each processing step</li>
                  <li>Detailed statistics and per-page results</li>
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
          <h2 className="text-lg font-semibold text-[#1b4965] mb-4">Upload PDF File</h2>
          
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload-advanced"
              />
              <label
                htmlFor="pdf-upload-advanced"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1b4965] hover:bg-gray-50 transition-colors"
              >
                <div className="text-center">
                  <RiUploadLine className="text-3xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload PDF or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Multi-page PDF files supported
                  </p>
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <RiFilePdfLine className="text-[#1b4965] text-lg" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
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
                onClick={processPDFWithOCR}
                disabled={!selectedFile || isProcessing}
                className="flex items-center gap-2 bg-[#1b4965] text-white px-6 py-2 rounded-lg hover:bg-[#003049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <RiLoader4Line className="text-lg animate-spin" />
                ) : (
                  <RiFileTextLine className="text-lg" />
                )}
                {isProcessing ? "Processing..." : "Process with Advanced OCR"}
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
                <span className="text-gray-700">{status.currentStep}</span>
              </div>
              
              {status.totalPages > 0 && (
                <div className="text-sm text-gray-600">
                  Page {status.currentPage} of {status.totalPages}
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(status.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#1b4965] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${status.progress}%` }}
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
            className="space-y-6"
          >
            {/* Summary Stats */}
            <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1b4965]">Processing Summary</h3>
                <div className="flex items-center gap-2 text-green-600">
                  <RiCheckLine className="text-lg" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Pages Processed</p>
                  <p className="text-2xl font-bold text-blue-900">{ocrResult.pageCount}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Avg Confidence</p>
                  <p className="text-2xl font-bold text-green-900">{ocrResult.confidence}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Processing Time</p>
                  <p className="text-2xl font-bold text-purple-900">{ocrResult.processingTime}s</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">Word Count</p>
                  <p className="text-2xl font-bold text-orange-900">{ocrResult.wordCount}</p>
                </div>
              </div>
            </div>

            {/* Per-Page Results */}
            <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4">Per-Page Results</h4>
              <div className="space-y-4">
                {ocrResult.pages.map((page, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Page {page.pageNumber}</h5>
                      <span className="text-sm text-gray-600">Confidence: {page.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {page.text || "No text detected"}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Text */}
            <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3">Complete Extracted Text</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {ocrResult.text}
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
          <h3 className="font-semibold text-yellow-900 mb-3">Technical Implementation</h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>• <strong>PDF.js:</strong> Converts PDF pages to high-resolution images (2x scale)</p>
            <p>• <strong>Tesseract.js:</strong> Processes each image with English language recognition</p>
            <p>• <strong>Multi-page support:</strong> Handles PDFs with multiple pages sequentially</p>
            <p>• <strong>Progress tracking:</strong> Real-time updates for PDF conversion and OCR processing</p>
            <p>• <strong>Confidence scoring:</strong> Individual confidence scores per page and overall average</p>
            <p>• <strong>Performance:</strong> Optimized for better accuracy with higher resolution images</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
