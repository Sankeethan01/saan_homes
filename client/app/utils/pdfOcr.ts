"use client";

// Types for OCR results
export type OcrLineItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type OcrResult = {
  rawText: string;
  items: OcrLineItem[];
  total: number;
  confidence: number; // 0..1
  issues: string[];
  meta: {
    pages: number;
    fileName: string;
  };
};

// Client-safe PDF.js loader (CDN-only to avoid Next bundling errors)
async function loadPdfJs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF extraction is only supported in the browser');
  }
  // Reuse if already loaded
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load pdf.js from CDN'));
    document.head.appendChild(script);
  });
  const lib = (window as any).pdfjsLib;
  try { lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; } catch {}
  return lib;
}

// Normalize numbers from strings
function normalizeNumber(input: string): number | null {
  if (!input) return null;
  let cleaned = input.replace(/[^0-9.,-]/g, "");
  if (cleaned.match(/\d+\.\d{3}/)) cleaned = cleaned.replace(/\.(?=\d{3}(\D|$))/g, "");
  if (cleaned.match(/\d+,\d{3}/)) cleaned = cleaned.replace(/,(?=\d{3}(\D|$))/g, "");
  cleaned = cleaned.replace(/,(\d{1,2})$/, ".$1");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// Clean and normalize description text
function cleanDescription(desc: string): string {
  return desc
    .replace(/^\d+\.?\s*/, '') // Remove leading numbers
    .replace(/[^\w\s\-().,]/g, ' ') // Remove special characters except basic punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Check if description is meaningful (not just garbled text)
function isMeaningfulDescription(desc: string): boolean {
  if (desc.length < 3) return false;
  
  // Check for common construction material keywords
  const constructionKeywords = [
    'cement', 'concrete', 'steel', 'rebar', 'reinforcement', 'sand', 'gravel', 'stone',
    'brick', 'block', 'tile', 'paint', 'primer', 'adhesive', 'grout', 'mortar',
    'lumber', 'wood', 'plywood', 'beam', 'column', 'slab', 'foundation', 'roof',
    'door', 'window', 'frame', 'hinge', 'lock', 'handle', 'knob', 'glass',
    'pipe', 'fitting', 'valve', 'faucet', 'sink', 'toilet', 'shower', 'bathtub',
    'wire', 'cable', 'switch', 'outlet', 'fixture', 'bulb', 'lamp', 'fan',
    'nail', 'screw', 'bolt', 'nut', 'washer', 'bracket', 'clamp', 'hanger',
    'insulation', 'foam', 'fiber', 'board', 'sheet', 'panel', 'covering'
  ];
  
  const lowerDesc = desc.toLowerCase();
  const hasKeyword = constructionKeywords.some(keyword => lowerDesc.includes(keyword));
  
  // Alphabetic/digit ratios
  const alphaChars = (desc.match(/[a-zA-Z]/g) || []).length;
  const digitChars = (desc.match(/[0-9]/g) || []).length;
  const alphaRatio = alphaChars / desc.length;
  const digitRatio = digitChars / desc.length;
  
  // Require at least two alphabetic words of length >= 3 if no keyword
  const alphaWords = desc.split(/\s+/).filter(w => /^[A-Za-z]{3,}$/.test(w));
  const hasTwoRealWords = alphaWords.length >= 2;
  
  // Filter obvious OCR noise: long alnum runs, many symbols, repeated underscores
  const hasNoise = /(?:[A-Z0-9]{4,}|_{2,}|[^a-zA-Z0-9\s]{3,})/.test(desc);
  
  return (hasKeyword || (alphaRatio >= 0.7 && hasTwoRealWords)) && !hasNoise && digitRatio < 0.2;
}

// Enhanced parseItemsFromText function with better pattern matching for the bill format
function parseItemsFromText(text: string): { items: OcrLineItem[]; total: number | null; issues: string[] } {
  const issues: string[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items: OcrLineItem[] = [];
  let total: number | null = null;

  // Enhanced regex patterns for construction bills
  const rowRegexes = [
    // Pattern for bill format: "Description Qty Rate Amount"
    /^(.+?)\s+(\d+(?:[.,]\d+)?)\s+([-₹$€]?\d[\d,.]*)\s+([-₹$€]?\d[\d,.]*)$/i,
    
    // Pattern for line items with item numbers: "1. Description Qty Rate Amount"
    /^\d+\.?\s*(.+?)\s+(\d+(?:[.,]\d+)?)\s+([-₹$€]?\d[\d,.]*)\s+([-₹$€]?\d[\d,.]*)$/i,
    
    // Pattern for line items with x between qty and rate: "Description Qty x Rate = Amount"
    /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*[x×]\s*([-₹$€]?\d[\d,.]*)\s*=\s*([-₹$€]?\d[\d,.]*)$/i,
    
    // Pattern for single amount items: "Description Amount"
    /^(.+?)\s+([-₹$€]?\d[\d,.]*)$/i,
  ];

  // Special handling: explicit table header detected
  const headerIndex = lines.findIndex(l => /^(description)\b.*\b(qty|quantity)\b.*\b(price|rate)\b.*\b(total)\b/i.test(l));
  if (headerIndex !== -1) {
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      if (/^(subtotal|grand\s*total|total|tax)/i.test(line)) break;
      // Split by 2+ spaces or tabs to keep description intact
      const cols = line.split(/\s{2,}|\t+/).map(s => s.trim()).filter(Boolean);
      if (cols.length >= 4) {
        const description = cleanDescription(cols[0]);
        const qty = normalizeNumber(cols[1] as any);
        const rate = normalizeNumber(cols[2] as any);
        const amount = normalizeNumber(cols[3] as any);
        if (description && isMeaningfulDescription(description) && qty != null && rate != null && amount != null) {
          items.push({ description, quantity: qty, rate, amount });
        }
      } else {
        // Fallback to generic row regex if split didn't work
        for (const rx of rowRegexes) {
          const m = line.match(rx);
          if (m) {
            const description = cleanDescription(m[1]);
            const qty = normalizeNumber(m[2]);
            const rate = normalizeNumber(m[3]);
            const amount = normalizeNumber(m[4]);
            if (description && isMeaningfulDescription(description) && qty != null && rate != null && amount != null) {
              items.push({ description, quantity: qty, rate, amount });
            }
            break;
          }
        }
      }
    }
  }

  // Try to find the total amount in the text
  const totalMatch = text.match(/\bGrand\s*Total\b\s*[:\-]?\s*[-₹$€]?\s*([\d,.]+)/i) ||
                    text.match(/\bTotal\s*Amount\b\s*[:\-]?\s*[-₹$€]?\s*([\d,.]+)/i) ||
                    text.match(/\bAmount\s*Payable\b\s*[:\-]?\s*[-₹$€]?\s*([\d,.]+)/i) ||
                    text.match(/\bTotal\b\s*[:\-]?\s*[-₹$€]?\s*([\d,.]+)/i);
  
  if (totalMatch) {
    total = normalizeNumber(totalMatch[1]);
  }

  // Process each line to extract items
  for (const line of lines) {
    // Skip lines that are likely headers or totals
    if (line.match(/^(description|item|particulars|qty|quantity|rate|price|amount|total|subtotal|gst|tax|vat|cgst|sgst|igst)\b/i)) {
      continue;
    }

    let match: RegExpMatchArray | null = null;
    
    // Try each pattern until we find a match
    for (const regex of rowRegexes) {
      match = line.match(regex);
      if (match) {
        const description = cleanDescription(match[1]);
        
        // Skip if description is not meaningful
        if (!isMeaningfulDescription(description)) {
          continue;
        }

        let quantity: number | null = null;
        let rate: number | null = null;
        let amount: number | null = null;

        if (match.length >= 5) {
          // Format: description qty rate amount
          quantity = normalizeNumber(match[2]);
          rate = normalizeNumber(match[3]);
          amount = normalizeNumber(match[4]);
        } else if (match.length === 4) {
          // Format: description qty rate
          quantity = normalizeNumber(match[2]);
          rate = normalizeNumber(match[3]);
          amount = quantity !== null && rate !== null ? quantity * rate : null;
        } else if (match.length === 3) {
          // Format: description amount
          amount = normalizeNumber(match[2]);
          quantity = 1;
          rate = amount;
        }

        // Only add if we have valid values
        if (description && quantity !== null && rate !== null && amount !== null) {
          items.push({
            description,
            quantity,
            rate,
            amount,
          });
        }
        break;
      }
    }
  }

  // If we couldn't find any items but found a total, create a single item
  if (items.length === 0 && total !== null) {
    items.push({
      description: "Bill Total",
      quantity: 1,
      rate: total,
      amount: total,
    });
  }

  // Verify the total matches the sum of items
  if (items.length > 0 && total === null) {
    const calculatedTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    total = calculatedTotal;
  } else if (items.length > 0 && total !== null) {
    const calculatedTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const difference = Math.abs(calculatedTotal - total);
    
    // If there's a significant difference, add an issue
    if (difference > 0.1) {
      issues.push(`The sum of items (${calculatedTotal.toFixed(2)}) does not match the total amount (${total.toFixed(2)})`);
    }
  }

  return { items, total, issues };
}

// Enhanced extraction function with better text cleaning and processing
export async function extractBillFromPdf(file: File): Promise<OcrResult> {
  const pdfjsLib = await loadPdfJs();
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true }).promise;
    let text = "";
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      text += strings.join("\n") + "\n\n";
    }

    // Clean up the extracted text (preserve line breaks!)
    text = text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
      .replace(/[\t ]+/g, ' ') // Collapse spaces/tabs but keep newlines
      .replace(/\r/g, '') // Normalize CRLF -> LF
      .replace(/\n{2,}/g, '\n') // Collapse multiple blank lines
      .trim();

    // If direct text extraction is empty/minimal (likely scanned PDF), fallback to image OCR
    const looksEmpty = !text || text.length < 50 || /^(?:\d|\s|\W){0,}$/.test(text);
    if (looksEmpty) {
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker({ logger: () => {} });
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        let ocrText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          await page.render({ canvasContext: ctx as any, viewport }).promise;
          const { data } = await worker.recognize(canvas);
          ocrText += (data?.text || '') + "\n";
        }
        await worker.terminate();
        if (ocrText && ocrText.length > text.length) {
          text = ocrText
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/[\t ]+/g, ' ')
            .replace(/\r/g, '')
            .replace(/\n{2,}/g, '\n')
            .trim();
        }
      } catch (ocrErr) {
        console.warn('Tesseract OCR fallback failed:', ocrErr);
      }
    }

    // Parse the text to extract items and total
    const { items, total, issues } = parseItemsFromText(text);

    // Calculate confidence based on successful extraction
    let confidence = 0.5; // Base confidence
    
    if (items.length > 0) {
      confidence += 0.3; // Found items
      
      // Increase confidence if we found a total and it matches the sum of items
      if (total !== null) {
        const calculatedTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const difference = Math.abs(calculatedTotal - total);
        
        if (difference < 0.1) {
          confidence += 0.2; // Totals match
        }
      }
    }

    return {
      rawText: text,
      items,
      total: total || items.reduce((sum, item) => sum + (item.amount || 0), 0),
      confidence: Math.min(confidence, 1.0), // Cap at 1.0
      issues,
      meta: {
        pages: pdf.numPages,
        fileName: file.name,
      },
    };
  } catch (error) {
    console.error("Error processing PDF:", error);
    return {
      rawText: "",
      items: [],
      total: 0,
      confidence: 0,
      issues: ["Failed to process PDF: " + (error as Error).message],
      meta: {
        pages: 0,
        fileName: file.name,
      },
    };
  }
}
