/**
 * OCR Utility Functions for PDF Text Extraction
 * Uses Tesseract.js for OCR processing and PDF.js for PDF handling
 */

import { createWorker } from "tesseract.js";

// PDF.js will be imported dynamically on the client side

export interface OCRProgress {
  currentPage: number;
  totalPages: number;
  currentStep: string;
  progress: number;
}

export interface OCRPageResult {
  pageNumber: number;
  text: string;
  confidence: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
  wordCount: number;
  pageCount: number;
  pages: OCRPageResult[];
}

export interface OCRConfig {
  language?: string;
  scale?: number;
  onProgress?: (progress: OCRProgress) => void;
}

/**
 * Convert PDF file to images using PDF.js
 */
export async function convertPDFToImages(
  pdfFile: File,
  scale: number = 2.0,
  onProgress?: (progress: OCRProgress) => void
): Promise<string[]> {
  // Dynamically import PDF.js only on the client side
  const pdfjsLib = await import("pdfjs-dist");
  
  // Configure PDF.js worker to use the bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress?.({
      currentPage: pageNum,
      totalPages: pdf.numPages,
      currentStep: `Converting page ${pageNum} to image...`,
      progress: (pageNum / pdf.numPages) * 30, // 30% for PDF conversion
    });

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

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
}

/**
 * Process a single image with OCR using Tesseract.js
 */
export async function processImageWithOCR(
  imageDataUrl: string,
  pageNumber: number,
  language: string = "eng",
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRPageResult> {
  // Update progress manually since logger function causes DataCloneError
  onProgress?.({
    currentPage: pageNumber,
    totalPages: 1,
    currentStep: `Processing page ${pageNumber} with OCR...`,
    progress: 30 + (pageNumber * 10), // Simple progress estimation
  });

  const worker = await createWorker(language);

  const { data } = await worker.recognize(imageDataUrl);
  await worker.terminate();

  return {
    pageNumber,
    text: data.text,
    confidence: data.confidence || 0,
  };
}

/**
 * Extract text from PDF using OCR
 */
export async function extractTextFromPDF(
  pdfFile: File,
  config: OCRConfig = {}
): Promise<OCRResult> {
  const {
    language = "eng",
    scale = 2.0,
    onProgress,
  } = config;

  const startTime = Date.now();

  try {
    // Step 1: Convert PDF to images
    onProgress?.({
      currentPage: 0,
      totalPages: 0,
      currentStep: "Converting PDF to images...",
      progress: 0,
    });

    const images = await convertPDFToImages(pdfFile, scale, onProgress);

    // Step 2: Process each image with OCR
    onProgress?.({
      currentPage: 0,
      totalPages: images.length,
      currentStep: "Processing images with OCR...",
      progress: 30,
    });

    const pageResults: OCRPageResult[] = [];
    let totalConfidence = 0;

    for (let i = 0; i < images.length; i++) {
      // Update progress for each page
      onProgress?.({
        currentPage: i + 1,
        totalPages: images.length,
        currentStep: `Processing page ${i + 1} of ${images.length} with OCR...`,
        progress: 30 + ((i + 1) / images.length) * 60,
      });

      const result = await processImageWithOCR(
        images[i],
        i + 1,
        language
      );
      
      pageResults.push(result);
      totalConfidence += result.confidence;
    }

    // Step 3: Combine results
    onProgress?.({
      currentPage: images.length,
      totalPages: images.length,
      currentStep: "Combining results...",
      progress: 95,
    });

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

    onProgress?.({
      currentPage: images.length,
      totalPages: images.length,
      currentStep: "Completed!",
      progress: 100,
    });

    return result;

  } catch (error) {
    onProgress?.({
      currentPage: 0,
      totalPages: 0,
      currentStep: "Error occurred",
      progress: 0,
    });
    throw error;
  }
}

/**
 * Parse bill data from OCR text
 * Enhanced version with better pattern matching and error correction
 */
export function parseBillData(ocrText: string): {
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  total: number;
  subtotal: number;
  tax: number;
  invoiceNumber?: string;
  date?: string;
  vendor?: string;
  project?: string;
  step?: string;
  client?: string;
} {
  const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }> = [];
  
  let total = 0;
  let subtotal = 0;
  let tax = 0;
  let invoiceNumber: string | undefined;
  let date: string | undefined;
  let vendor: string | undefined;
  let project: string | undefined;
  let step: string | undefined;
  let client: string | undefined;

  // Enhanced invoice number extraction
  const invoicePatterns = [
    /(?:bill|invoice|receipt)[\s#:]*([A-Z0-9-]+)/i,
    /bill\s+no[:\s]*([A-Z0-9-]+)/i,
    /invoice\s+#[:\s]*([A-Z0-9-]+)/i
  ];
  
  for (const pattern of invoicePatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      invoiceNumber = match[1];
      break;
    }
  }

  // Enhanced date extraction
  const datePatterns = [
    /date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/
  ];
  
  for (const pattern of datePatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      date = match[1];
      break;
    }
  }

  // Extract vendor/company name
  const vendorPatterns = [
    /from[:\s]*([A-Za-z\s&.,]+?)(?:\n|to:|bill\s+to)/i,
    /supplier[:\s]*([A-Za-z\s&.,]+?)(?:\n|to:|bill\s+to)/i,
    /vendor[:\s]*([A-Za-z\s&.,]+?)(?:\n|to:|bill\s+to)/i
  ];
  
  for (const pattern of vendorPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      vendor = match[1].trim();
      break;
    }
  }

  // Extract client information
  const clientMatch = ocrText.match(/to[:\s]*([A-Za-z\s&.,]+?)(?:\n|project:|step:)/i);
  if (clientMatch) {
    client = clientMatch[1].trim();
  }

  // Extract project information
  const projectMatch = ocrText.match(/project[:\s]*([A-Za-z\s&.,]+?)(?:\n|step:)/i);
  if (projectMatch) {
    project = projectMatch[1].trim();
  }

  // Extract step information
  const stepMatch = ocrText.match(/step[:\s]*([A-Za-z\s&.,]+?)(?:\n|description|qty)/i);
  if (stepMatch) {
    step = stepMatch[1].trim();
  }

  // Enhanced financial data extraction
  const totalPatterns = [
    /total[:\s]*\$?([\d,]+\.?\d*)/i,
    /amount\s+due[:\s]*\$?([\d,]+\.?\d*)/i,
    /grand\s+total[:\s]*\$?([\d,]+\.?\d*)/i
  ];
  
  for (const pattern of totalPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      total = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Enhanced subtotal extraction
  const subtotalPatterns = [
    /subtotal[:\s]*\$?([\d,]+\.?\d*)/i,
    /sub\s+total[:\s]*\$?([\d,]+\.?\d*)/i,
    /net\s+amount[:\s]*\$?([\d,]+\.?\d*)/i
  ];
  
  for (const pattern of subtotalPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      subtotal = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Enhanced tax extraction
  const taxPatterns = [
    /tax\s*\([^)]*\)[:\s]*\$?([\d,]+\.?\d*)/i,
    /vat[:\s]*\$?([\d,]+\.?\d*)/i,
    /gst[:\s]*\$?([\d,]+\.?\d*)/i,
    /tax[:\s]*\$?([\d,]+\.?\d*)/i
  ];
  
  for (const pattern of taxPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      tax = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Enhanced line items extraction
  // Look for table structure with multiple patterns
  const itemPatterns = [
    // Pattern: description quantity rate amount
    /^(.+?)\s+(\d+(?:\.\d+)?)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)$/,
    // Pattern: description qty rate amount (with currency symbols)
    /^(.+?)\s+(\d+(?:\.\d+)?)\s+\$?([\d,]+\.?\d*)\s+\$?([\d,]+\.?\d*)$/,
    // Pattern for items with parentheses or special characters
    /^(.+?\([^)]*\))\s+(\d+(?:\.\d+)?)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)$/
  ];

  for (const line of lines) {
    // Skip header lines
    if (/^(description|qty|rate|amount|item)/i.test(line)) {
      continue;
    }
    
    // Skip empty lines or lines with only numbers
    if (line.length < 5 || /^\d+$/.test(line)) {
      continue;
    }

    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      if (match) {
        const [, description, quantity, rate, amount] = match;
        
        // Validate that this looks like a real line item
        if (parseFloat(rate) > 0 && parseFloat(amount) > 0) {
          items.push({
            description: description.trim(),
            quantity: parseFloat(quantity),
            rate: parseFloat(rate.replace(/,/g, '')),
            amount: parseFloat(amount.replace(/,/g, '')),
          });
          break;
        }
      }
    }
  }

  return {
    items,
    total,
    subtotal,
    tax,
    invoiceNumber,
    date,
    vendor,
    project,
    step,
    client,
  };
}

/**
 * Validate OCR result quality
 */
export function validateOCRResult(result: OCRResult): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check confidence score
  if (result.confidence < 70) {
    issues.push("Low confidence score");
    suggestions.push("Consider re-scanning the document with better quality");
  }

  // Check if we extracted any text
  if (result.wordCount < 10) {
    issues.push("Very little text extracted");
    suggestions.push("Document might be blank or OCR failed");
  }

  // Check for common OCR issues
  if (result.text.includes("??") || result.text.includes("***")) {
    issues.push("Unrecognized characters detected");
    suggestions.push("Document quality might be poor");
  }

  // Check if we found financial data
  const hasFinancialData = /\$[\d,]+\.?\d*/.test(result.text) || 
                          /total|amount|invoice|bill/i.test(result.text);
  
  if (!hasFinancialData) {
    issues.push("No financial data detected");
    suggestions.push("This might not be a bill/invoice document");
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}
