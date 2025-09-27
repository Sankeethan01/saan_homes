import { useState, useEffect } from "react";
import { RiCloseLine, RiFileTextLine, RiDownloadLine, RiEyeLine, RiCheckLine } from "react-icons/ri";
import { fetchWithAuth } from "@/app/utils/auth";
import { extractBillFromPdf } from "@/app/utils/pdfOcr";
import jsPDF from "jspdf";

interface InvoiceGenerationModalProps {
  open: boolean;
  step: any;
  project?: any;
  onClose: () => void;
  onInvoiceGenerated?: (savedInvoice: any) => void;
}

interface Bill {
  id: string;
  step: string;
  pdf: string;
  ocr_data: {
    total: number;
    items: Array<{
      itemName?: string;
      description?: string;
      quantity?: number;
      unitPrice?: number;
      rate?: number;
      amount?: number;
    }>;
    raw_text?: string;
  };
  uploaded_at: string;
  verified: boolean;
  uploaded_by: string;
  uploaded_by_name: string;
  file_size: number;
  is_submitted_to_admin: boolean;
}

interface GeneratedInvoice {
  amount: number;
  description: string;
  line_items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    bill_id: string;
  }>;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  subtotal?: number;
  tax_percent?: number;
  tax_amount?: number;
  grand_total?: number;
}

export default function InvoiceGenerationModal({
  open,
  step,
  project,
  onClose,
  onInvoiceGenerated,
}: InvoiceGenerationModalProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [generatedInvoice, setGeneratedInvoice] = useState<GeneratedInvoice | null>(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [reprocessingBill, setReprocessingBill] = useState<string | null>(null);
  const [billComputedTotals, setBillComputedTotals] = useState<Record<string, number>>({});
  const [autoProcessedOnce, setAutoProcessedOnce] = useState<boolean>(false);
  const [signedInvoiceFile, setSignedInvoiceFile] = useState<File | null>(null);
  const [signedInvoiceUrl, setSignedInvoiceUrl] = useState<string>("");
  const [localOcrBusy, setLocalOcrBusy] = useState<boolean>(false);

  // Helpers to compute reliable totals from OCR
  const normalizeNumber = (input: any): number => {
    if (input == null) return 0;
    if (typeof input === 'number') return input;
    const s = String(input)
      .replace(/[^0-9.,-]/g, '')
      .replace(/\.(?=\d{3}(\D|$))/g, '')
      .replace(/,(?=\d{3}(\D|$))/g, '')
      .replace(/,(\d{1,2})$/, '.$1');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  // Clean and normalize description text
  const cleanDescription = (desc: string): string => {
    return desc
      .replace(/^\d+\.?\s*/, '') // Remove leading numbers
      .replace(/[^\w\s\-().,]/g, ' ') // Remove special characters except basic punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  // Check if description is meaningful (not just garbled text)
  const isMeaningfulDescription = (desc: string): boolean => {
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
    
    // Alphabetic/digit ratios (ignore spaces in denominator)
    const compact = desc.replace(/\s+/g, '');
    const alphaChars = (compact.match(/[a-zA-Z]/g) || []).length;
    const digitChars = (compact.match(/[0-9]/g) || []).length;
    const alphaRatio = alphaChars / Math.max(1, compact.length);
    const digitRatio = digitChars / Math.max(1, compact.length);
    
    // Require at least two alphabetic words of length >= 3 if no keyword
    const alphaWords = desc.split(/\s+/).filter(w => /^[A-Za-z]{3,}$/.test(w));
    const hasTwoRealWords = alphaWords.length >= 2;
    
    // Filter obvious OCR noise
    const hasNoise = /(?:[A-Z0-9]{4,}|_{2,}|[^a-zA-Z0-9\s]{3,})/.test(desc);
    
    return (hasKeyword || (alphaRatio >= 0.6 && hasTwoRealWords)) && !hasNoise && digitRatio < 0.25;
  };

  // Parse line items from raw OCR text
  const parseItemsFromRawText = (text: string): Array<{description: string, quantity: number, rate: number, amount: number}> => {
    const items: Array<{description: string, quantity: number, rate: number, amount: number}> = [];
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const patterns = [
      /^(.+?)\t(\d+(?:[.,]\d+)?)\t([-₹$€]?\d[\d,.]*)\t([-₹$€]?\d[\d,.]*)$/i, // Tab-separated
      /^(.+?),\s*(\d+(?:[.,]\d+)?),\s*([-₹$€]?\d[\d,.]*),\s*([-₹$€]?\d[\d,.]*)$/i, // Comma-separated
      /^(.+?)\s+(\d+(?:[.,]\d+)?)\s+([-₹$€]?\d[\d,.]*)\s+([-₹$€]?\d[\d,.]*)$/i, // Space-separated
      /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*[x×]\s*([-₹$€]?\d[\d,.]*)\s*=\s*([-₹$€]?\d[\d,.]*)$/i, // Qty x Rate = Amount
    ];
    for (const line of lines) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          let description = match[1].trim();
          let qty = Number(match[2]);
          let rate = Number((match[3] || '').replace(/[^0-9.]/g, ""));
          let amount = Number((match[4] || '').replace(/[^0-9.]/g, ""));
          if (description && qty > 0 && (rate > 0 || amount > 0)) {
            if (!amount && rate && qty) amount = rate * qty;
            items.push({ description, quantity: qty, rate, amount });
          }
            break;
          }
        }
      }
    return items;
  };

  // Compute bill total from OCR data
  const computeBillTotal = (bill: Bill): number => {
    // Prefer itemized sum
    const items = bill?.ocr_data?.items || [];
    if (Array.isArray(items) && items.length > 0) {
      const sum = items.reduce((acc: number, it: any) => {
        const qty = normalizeNumber(it.quantity ?? 1) || 1;
        const rate = normalizeNumber((it as any).unitPrice ?? it.rate ?? 0);
        const amount = normalizeNumber(it.amount);
        return acc + (amount > 0 ? amount : qty * rate);
      }, 0);
      return sum;
    }

    // Try raw_text parsing for Subtotal/Grand Total/Tax
    const raw = (bill as any)?.ocr_data?.raw_text as string | undefined;
    if (raw && typeof raw === 'string') {
      const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      let subtotal = 0;
      let tax = 0;
      let grand = 0;
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        let m: RegExpMatchArray | null;
        if (!grand && (m = line.match(/\b(grand\s*total|total\s*amount|amount\s*due|total)\b\D*([\d,\.]+)/i))) {
          grand = normalizeNumber(m[2]);
          if (grand > 0) break;
        }
        if (!tax && (m = line.match(/\btax\b.*?([\d,\.]+)(?:\s*(?:LKR|Rs|₹))?$/i))) {
          tax = normalizeNumber(m[1]);
        }
        if (!subtotal && (m = line.match(/\bsub\s*total\b\D*([\d,\.]+)/i))) {
          subtotal = normalizeNumber(m[1]);
        }
      }
      if (grand > 0) return grand;
      if (subtotal > 0) return subtotal + (tax || 0);
    }

    // Fallback to provided total
    return normalizeNumber((bill as any)?.ocr_data?.total ?? 0);
  };

  // Compute reliable totals for all bills
  const computeReliableTotals = async (billsList: Bill[]) => {
    const totals: Record<string, number> = {};
    for (const bill of billsList) {
      let total = computeBillTotal(bill);
      // Skip client-side OCR to avoid fetch errors - rely on server reprocess
      totals[bill.id] = Math.max(0, Math.round(total));
    }
    setBillComputedTotals(totals);
  };

  // Fetch bills when modal opens
  useEffect(() => {
    if (open && step?.id) {
      fetchBills();
    }
  }, [open, step?.id]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/by_step/?step=${step?.id}`
      );
      if (response.ok) {
        const billsData = await response.json();
        if (!Array.isArray(billsData)) {
          // Handle unauthorized or unexpected payloads gracefully
          const status = (response as any)?.status;
          if (status === 401 || status === 403) {
            showToast("Your session expired. Please login again.", "error");
          } else {
            showToast("Unexpected response from server while fetching bills", "error");
          }
          setBills([]);
          setSelectedBills([]);
          return;
        }
        setBills(billsData);
        setSelectedBills(
          billsData.filter((bill: Bill) => bill.step === step?.id).map((bill: Bill) => bill.id)
        );
        
        computeReliableTotals(billsData);

        // Auto reprocess bills that look incomplete (no items and zero/invalid total)
        if (!autoProcessedOnce) {
          const needs = (billsData as Bill[]).filter((b) => {
            const itemsLen = Array.isArray(b?.ocr_data?.items) ? b.ocr_data.items.length : 0;
            const totalNum = Number((b as any)?.ocr_data?.total || 0);
            return itemsLen === 0 || !isFinite(totalNum) || totalNum <= 0;
          });
          if (needs.length > 0) {
            try {
              await Promise.all(
                needs.map((b) =>
                  fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/${b.id}/reprocess_ocr/`,
                    { method: 'POST' }
                  ).catch(() => null)
                )
              );
              // Refresh once to pull updated OCR results
              setAutoProcessedOnce(true);
              const refreshed = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/by_step/?step=${step?.id}`
              );
              if (refreshed.ok) {
                const refreshedData = await refreshed.json();
                setBills(refreshedData);
                computeReliableTotals(refreshedData);
              }
            } catch (e) {
              console.warn('Auto OCR reprocess failed:', e);
            }
          }
        }

        // Auto-generate a draft invoice preview if bills exist and none generated yet
        try {
          if (!generatedInvoice && Array.isArray(billsData) && billsData.length > 0) {
            const selected = billsData.filter((b: Bill) => b.step === step?.id);
            if (selected.length > 0) {
              const items: GeneratedInvoice["line_items"] = [];
              
              // Extract detailed line items from OCR data
              for (const [billIdx, bill] of selected.entries()) {
                const ocrItems = bill?.ocr_data?.items || [];
                const billTotal = billComputedTotals[bill.id] ?? computeBillTotal(bill);
                
                console.log(`🔍 Bill ${billIdx + 1} OCR Data:`, {
                  items: ocrItems,
                  total: billTotal,
                  rawText: bill?.ocr_data?.raw_text?.substring(0, 200) + '...'
                });
                
                if (Array.isArray(ocrItems) && ocrItems.length > 0) {
                  // Try parsing from raw text as well and choose the better set
                  const rawText = bill?.ocr_data?.raw_text || '';
                  const parsedFromRaw = rawText ? parseItemsFromRawText(rawText) : [];
                  const validOcr = ocrItems.map((item: any, itemIdx: number) => {
                    const qty = Number(item.quantity) || 0;
                    const rate = Number(item.unitPrice ?? item.rate ?? 0) || 0;
                    const amount = Number(item.amount) || (qty * rate);
                    let description = '';
                    if (item.itemName && item.itemName.trim()) {
                      description = item.itemName.trim();
                    } else if (item.description && item.description.trim()) {
                      description = item.description.trim();
                    } else {
                      description = `Construction Material ${itemIdx + 1}`;
                    }
                    description = cleanDescription(description);
                    if (!isMeaningfulDescription(description)) return null;
                    if (qty <= 0 || (rate <= 0 && amount <= 0)) return null;
                    const finalRate = rate > 0 ? rate : amount / Math.max(1, qty);
                    const finalAmount = amount > 0 ? amount : finalRate * qty;
                    return { description, quantity: qty, rate: finalRate, amount: finalAmount, bill_id: bill.id } as const;
                  }).filter(Boolean) as GeneratedInvoice["line_items"]; 

                  // Heuristic: if only one OCR item that looks like a summary (qty 1 or description contains bill name), prefer parsed/client OCR
                  const looksLikeSummary = validOcr.length === 1 && (
                    validOcr[0].quantity === 1 || /bill|construction/i.test(validOcr[0].description)
                  );
                  const useParsedRaw = looksLikeSummary || parsedFromRaw.length >= Math.max(3, validOcr.length);

                  if (useParsedRaw) {
                    if (parsedFromRaw.length === 0) {
                      // As a last resort, try client-side OCR
                      const clientItems = await clientExtractItemsFromPdf(bill);
                      clientItems.forEach(ci => items.push(ci));
                    } else {
                      parsedFromRaw.forEach((pi) => {
                        items.push({
                          description: pi.description,
                          quantity: pi.quantity,
                          rate: pi.rate,
                          amount: pi.amount,
                          bill_id: bill.id,
                        });
                      });
                    }
                  } else {
                    validOcr.forEach((vi) => items.push({ ...vi }));
                  }
                } else {
                  // Try to parse items from raw_text if items array is empty
                  const rawText = bill?.ocr_data?.raw_text || '';
                  let parsedItems = rawText ? parseItemsFromRawText(rawText) : [];
                  // If still empty, try client-side OCR fallback
                  if (parsedItems.length === 0) {
                    const clientItems = await clientExtractItemsFromPdf(bill);
                    if (clientItems.length > 0) {
                      clientItems.forEach(ci => items.push(ci));
                    } else {
                      // Fallback to bill summary with better description
                      const billName = bill.pdf ? bill.pdf.split("/").pop()?.replace('.pdf', '') || `Bill ${billIdx + 1}` : `Bill ${billIdx + 1}`;
                      items.push({
                        description: `${billName} - Construction Materials`,
                        quantity: 1,
                        rate: billTotal,
                        amount: billTotal,
                        bill_id: bill.id,
                      });
                    }
                  } else {
                    parsedItems.forEach((item) => items.push({ ...item, bill_id: bill.id } as any));
                  }
                }
              }
              
              // Consolidate duplicate items
              const consolidated = new Map<string, GeneratedInvoice["line_items"][0]>();
              items.forEach((item) => {
                const key = item.description.toLowerCase().trim();
                if (consolidated.has(key)) {
                  const existing = consolidated.get(key)!;
                  existing.quantity += item.quantity;
                  existing.amount += item.amount;
                  existing.rate = existing.amount / existing.quantity;
                  existing.bill_id += `,${item.bill_id}`;
                } else {
                  consolidated.set(key, { ...item });
                }
              });
              
              let finalItems = Array.from(consolidated.values());
              
              // If we still have only a single summary-like row or too few items, force client OCR for details
              const looksLikeSummaryOnly = finalItems.length === 1 && (
                finalItems[0].quantity === 1 || /bill|construction/i.test(finalItems[0].description)
              );
              if (looksLikeSummaryOnly || finalItems.length < 3) {
                console.warn('⚠️ Only summary/too few items found. Forcing client OCR pass for detailed items...');
                const forced: GeneratedInvoice["line_items"] = [];
                for (const b of selected) {
                  const clientItems = await clientExtractItemsFromPdf(b as any);
                  clientItems.forEach(ci => forced.push(ci));
                }
                if (forced.length > 0) {
                  // Consolidate again
                  const recon = new Map<string, GeneratedInvoice["line_items"][0]>();
                  forced.forEach((item) => {
                    const key = item.description.toLowerCase().trim();
                    if (recon.has(key)) {
                      const ex = recon.get(key)!;
                      ex.quantity += item.quantity;
                      ex.amount += item.amount;
                      ex.rate = ex.amount / Math.max(1, ex.quantity);
                      ex.bill_id += `,${item.bill_id}`;
                    } else {
                      recon.set(key, { ...item });
                    }
                  });
                  finalItems = Array.from(recon.values());
                }
              }
              
              const total = finalItems.reduce((s, it) => s + it.amount, 0);
              
              console.log('📊 Generated Invoice Data:', {
                totalAmount: total,
                itemCount: finalItems.length,
                items: finalItems.map(item => ({
                  description: item.description,
                  amount: item.amount
                }))
              });
              
              const invoiceData: GeneratedInvoice = {
                amount: Math.round(total + (total * 10) / 100),
                description: `Invoice for ${step?.title || 'Project Step'}`,
                line_items: finalItems,
                invoice_number: `INV-${step?.title?.slice(0, 3)?.toUpperCase() || "STEP"}-${new Date().toISOString().slice(0,10).replace(/-/g,"")}`,
                invoice_date: new Date().toISOString().slice(0, 10),
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                status: "DRAFT",
                subtotal: Math.round(total),
                tax_percent: 10,
                tax_amount: Math.round((total * 10) / 100),
                grand_total: Math.round(total + (total * 10) / 100),
              };
              setGeneratedInvoice(invoiceData);
              setInvoiceGenerated(true);
            }
          }
        } catch (_) {}
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch bills:", errorText);
        showToast("Failed to fetch bills", "error");
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      setBills([]);
      setSelectedBills([]);
      showToast("Cannot reach server. Check connection and API URL.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  // Generate invoice preview from selected bills
  const generateInvoicePreview = async (selectedBillIds: string[]) => {
    if (selectedBillIds.length === 0) {
      setGeneratedInvoice(null);
      setInvoiceGenerated(false);
      return;
    }

    try {
      const selectedBills = bills.filter(bill => selectedBillIds.includes(bill.id));
      if (selectedBills.length === 0) return;

      // Process bills into line items (similar to existing logic)
      const items: GeneratedInvoice["line_items"] = [];
      
      for (let billIdx = 0; billIdx < selectedBills.length; billIdx++) {
        const bill = selectedBills[billIdx];
        const billTotal = billComputedTotals[bill.id] || computeBillTotal(bill);
        
        // Process OCR data from bills
        const ocrItems = bill?.ocr_data?.items || [];
        if (Array.isArray(ocrItems) && ocrItems.length > 0) {
          const validOcr = ocrItems.map((it: any, itemIdx: number) => {
            const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
            const rate = Number(it.unitPrice ?? it.rate ?? 0) || 0;
            const amount = Number(it.amount ?? qty * rate) || (qty * rate);
            let description = (it.description || it.itemName || `Item ${itemIdx + 1}`).toString();
            if (!description || description.length < 3) {
              description = `Construction Material ${itemIdx + 1}`;
            }
            description = cleanDescription(description);
            if (!isMeaningfulDescription(description)) return null;
            if (qty <= 0 || (rate <= 0 && amount <= 0)) return null;
            const finalRate = rate > 0 ? rate : amount / Math.max(1, qty);
            const finalAmount = amount > 0 ? amount : finalRate * qty;
            return { description, quantity: qty, rate: finalRate, amount: finalAmount, bill_id: bill.id } as const;
          }).filter(Boolean) as GeneratedInvoice["line_items"];

          if (validOcr.length > 0) {
            validOcr.forEach((vi) => items.push({ ...vi }));
          } else {
            // Fallback to bill summary
            const billName = bill.pdf ? bill.pdf.split("/").pop()?.replace('.pdf', '') || `Bill ${billIdx + 1}` : `Bill ${billIdx + 1}`;
            items.push({
              description: `${billName} - Construction Materials`,
              quantity: 1,
              rate: billTotal,
              amount: billTotal,
              bill_id: bill.id,
            });
          }
        } else {
          // No OCR items, use bill total as single line item
          const billName = bill.pdf ? bill.pdf.split("/").pop()?.replace('.pdf', '') || `Bill ${billIdx + 1}` : `Bill ${billIdx + 1}`;
          items.push({
            description: `${billName} - Construction Materials`,
            quantity: 1,
            rate: billTotal,
            amount: billTotal,
            bill_id: bill.id,
          });
        }
      }
      
      // Consolidate duplicate items
      const consolidated = new Map<string, GeneratedInvoice["line_items"][0]>();
      items.forEach((item) => {
        const key = item.description.toLowerCase().trim();
        if (consolidated.has(key)) {
          const existing = consolidated.get(key)!;
          existing.quantity += item.quantity;
          existing.amount += item.amount;
          existing.rate = existing.amount / existing.quantity;
          existing.bill_id += `,${item.bill_id}`;
        } else {
          consolidated.set(key, { ...item });
        }
      });
      
      const finalItems = Array.from(consolidated.values());
      const total = finalItems.reduce((s, it) => s + it.amount, 0);
      
      const invoiceData: GeneratedInvoice = {
        amount: Math.round(total + (total * 10) / 100),
        description: `Invoice for ${step?.title || 'Project Step'}`,
        line_items: finalItems,
        invoice_number: `INV-${step?.title?.slice(0, 3)?.toUpperCase() || "STEP"}-${new Date().toISOString().slice(0,10).replace(/-/g,"")}`,
        invoice_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: "DRAFT",
        subtotal: Math.round(total),
        tax_percent: 10,
        tax_amount: Math.round((total * 10) / 100),
        grand_total: Math.round(total + (total * 10) / 100),
      };
      
      setGeneratedInvoice(invoiceData);
      setInvoiceGenerated(true);
    } catch (error) {
      console.error('Error generating invoice preview:', error);
      showToast('Error generating invoice preview', 'error');
    }
  };

  const handleBillSelection = (billId: string) => {
    setSelectedBills(prev => {
      const newSelection = prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId];
      
      // Regenerate invoice preview when bills are selected/deselected
      if (newSelection.length > 0) {
        generateInvoicePreview(newSelection);
      } else {
        setGeneratedInvoice(null);
        setInvoiceGenerated(false);
      }
      
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedBills.length === bills.length) {
      setSelectedBills([]);
      setGeneratedInvoice(null);
      setInvoiceGenerated(false);
    } else {
      const allBillIds = bills.map(bill => bill.id);
      setSelectedBills(allBillIds);
      if (allBillIds.length > 0) {
        generateInvoicePreview(allBillIds);
      }
    }
  };

  const handleGenerateInvoice = async () => {
    if (selectedBills.length === 0) {
      showToast("Please select at least one bill", "error");
      return;
    }
    // Ensure we have a prepared invoice payload
    if (!generatedInvoice) {
      showToast("Please generate the invoice preview first", "error");
      return;
    }

    setSaving(true);
    try {
      console.log("Generating invoice for step:", step?.id);
      
      // First, check if an invoice already exists for this step
      const existingInvoiceResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/by_step/?step=${step?.id}`
      );

      let response;
      if (existingInvoiceResponse.ok) {
        // Update existing invoice
        const existingInvoice = await existingInvoiceResponse.json();
        console.log("Updating existing invoice:", existingInvoice.id);
        
        const updateData = {
          data: {
            ...generatedInvoice,
            signed_invoice_url: signedInvoiceUrl || undefined,
            bill_ids: selectedBills
          }
        };
        console.log("Update data:", updateData);
        
        response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/${existingInvoice.id}/`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          }
        );
      } else {
        // Create new invoice (Invoice is linked to a Step)
        console.log("Creating new invoice for step:", step?.id);
        
        const createData = {
          step: step?.id,
          data: {
            ...generatedInvoice,
            signed_invoice_url: signedInvoiceUrl || undefined,
            bill_ids: selectedBills
          }
        };
        console.log("Create data:", createData);
        
        response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(createData),
          }
        );
      }

      if (response.ok) {
        const savedInvoice = await response.json();
        console.log("✅ Invoice saved successfully:", savedInvoice);
        console.log("✅ Invoice data structure:", {
          id: savedInvoice.id,
          project: savedInvoice.project,
          data: savedInvoice.data,
          created: savedInvoice.created,
          is_approved: savedInvoice.is_approved
        });
        showToast("Invoice saved successfully!", "success");
        onInvoiceGenerated?.(savedInvoice);
        onClose();
      } else {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error('Failed to save invoice');
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      showToast("Failed to save invoice", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      if (!generatedInvoice) {
        showToast('Generate the invoice first', 'error');
        return;
      }

      // If invoice has only a single summary row, try to hydrate from step bills
      const looksLikeSummary = (items: any[]) => items.length === 1 && (
        items[0]?.quantity === 1 || /bill|construction/i.test(String(items[0]?.description || ''))
      );

      const getItemsFromBills = async (): Promise<GeneratedInvoice["line_items"]> => {
        try {
          if (!step?.id) return [];
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
          const res = await fetchWithAuth(`${apiBaseUrl}/projects/bills/by_step/?step=${step.id}`);
          if (!res.ok) return [];
          const bills: any[] = await res.json();
          const out: GeneratedInvoice["line_items"] = [];
          bills.forEach((b: any) => {
            const arr: any[] = Array.isArray(b?.ocr_data?.items) ? b.ocr_data.items : [];
            arr.forEach((it) => {
              const qty = Number(it.quantity || it.qty || 1) || 1;
              const rate = Number(it.rate || it.unitPrice || 0) || 0;
              const amount = Number(it.amount || qty * rate) || (qty * rate);
              const desc = String(it.description || it.itemName || '').trim();
              if (desc && (rate > 0 || amount > 0)) {
                out.push({ description: desc, quantity: qty, rate: rate || Math.round(amount/Math.max(1,qty)), amount, bill_id: String(b.id) });
              }
            });
          });
          // Consolidate same descriptions
          const recon = new Map<string, GeneratedInvoice["line_items"][0]>();
          out.forEach((it) => {
            const key = it.description.toLowerCase().trim();
            if (recon.has(key)) {
              const ex = recon.get(key)!;
              ex.quantity += it.quantity;
              ex.amount += it.amount;
              ex.rate = Math.round(ex.amount / Math.max(1, ex.quantity));
              ex.bill_id += `,${it.bill_id}`;
            } else {
              recon.set(key, { ...it });
            }
          });
          return Array.from(recon.values());
        } catch { return []; }
      };

      let effectiveItems: GeneratedInvoice["line_items"] = Array.isArray(generatedInvoice.line_items)
        ? ([...generatedInvoice.line_items] as GeneratedInvoice["line_items"])
        : ([] as GeneratedInvoice["line_items"]);
      if (effectiveItems.length === 0 || looksLikeSummary(effectiveItems)) {
        const hydrated: GeneratedInvoice["line_items"] = await getItemsFromBills();
        if (hydrated.length > 0) {
          effectiveItems = hydrated;
        }
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 40;
    let y = 40;

    const formatNumber = (n: number) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(34, 85, 204); // Blue title
    pdf.setFontSize(28);
    pdf.text('INVOICE', pageWidth / 2, y, { align: 'center' });
    y += 24;

    // Invoice meta left
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(`Invoice No:`, marginX, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${generatedInvoice?.invoice_number}`, marginX + 76, y);
    y += 16;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Date:`, marginX, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${new Date(generatedInvoice?.invoice_date || new Date().toISOString()).toLocaleDateString('en-LK')}`, marginX + 40, y);

    // Bill To / From blocks
    const colMid = pageWidth / 2;
    y += 28;
    pdf.setFont('helvetica', 'bold');
    pdf.text('BILL TO:', marginX, y);
    pdf.text('FROM:', colMid, y);
    y += 16;
    pdf.setFont('helvetica', 'normal');
    const leftLines = [
      `Client: ${project?.name || 'Client Name'}`,
      `Project: ${step?.title || 'Project'}`,
    ];
    // Render left notes and track max height used
    let notesHeight = 0;
    leftLines.forEach((t) => { pdf.text(t, marginX, y); y += 16; notesHeight = y; });
    const rightLines = [
      'SAAN HOMES',
      'Construction & Development',
      'Sri Lanka',
      'Email: info@saanhomes.com',
    ];
    let payHeight = 0;
    rightLines.forEach((t, idx) => { pdf.text(t, colMid, y + 16 * idx); payHeight = y + 16 * idx; });
    // Move Y to the lower of the two columns + spacing
    y = Math.max(notesHeight, payHeight) + 24;

      pdf.save(`invoice-${generatedInvoice?.invoice_number || 'draft'}.pdf`);
      showToast('Invoice PDF downloaded successfully!', 'success');
    } catch (e) {
      console.error('Download PDF failed:', e);
      showToast('Failed to generate PDF. Please try again.', 'error');
    }
  };

  const handleSubmitToAdmin = async () => {
    if (!generatedInvoice) return;

    setSaving(true);
    try {
      console.log("Submitting invoice to admin for project:", step?.project_id);
      
      // First, check if an invoice already exists for this project
      const existingInvoiceResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/by_project/?projectId=${step?.project_id}`
      );

      let invoiceId;
      if (existingInvoiceResponse.ok) {
        // Update existing invoice
        const existingInvoice = await existingInvoiceResponse.json();
        invoiceId = existingInvoice.id;
        
        const updateData = {
          data: {
            ...generatedInvoice,
            bill_ids: selectedBills,
            status: 'SUBMITTED',
            submitted_at: new Date().toISOString(),
            signed_invoice_url: signedInvoiceUrl || undefined
          }
        };
        
        const updateResponse = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/${invoiceId}/`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!updateResponse.ok) {
          throw new Error('Failed to update invoice');
        }
      } else {
        // Create new invoice with submitted status
        const createData = {
          project: step?.project_id,
          data: {
            ...generatedInvoice,
            bill_ids: selectedBills,
            status: 'SUBMITTED',
            submitted_at: new Date().toISOString(),
            signed_invoice_url: signedInvoiceUrl || undefined
          }
        };
        
        const createResponse = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(createData),
          }
        );

        if (!createResponse.ok) {
          throw new Error('Failed to create invoice');
        }

        const createdInvoice = await createResponse.json();
        invoiceId = createdInvoice.id;
      }

      // Submit to admin
      const submitResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/${invoiceId}/submit_to_admin/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (submitResponse.ok) {
        const submittedInvoice = await submitResponse.json();
        showToast("Invoice submitted to admin successfully!", "success");
        onInvoiceGenerated?.(submittedInvoice);
        onClose();
      } else {
        const errorText = await submitResponse.text();
        console.error("Submit API Error:", errorText);
        throw new Error('Failed to submit invoice to admin');
      }
    } catch (error) {
      console.error("Error submitting invoice to admin:", error);
      showToast("Failed to submit invoice to admin", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReprocessOCR = async (billId: string) => {
    setReprocessingBill(billId);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/${billId}/reprocess_ocr/`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        const result = await response.json();
        showToast(`OCR reprocessed successfully! Total: ₹${result.total}`, "success");
        // Refresh once to pull updated OCR results
        await fetchBills();
      } else {
        const errorText = await response.text();
        console.error("OCR reprocess error:", errorText);
        showToast("Failed to reprocess OCR", "error");
      }
    } catch (error) {
      console.error("Error reprocessing OCR:", error);
      showToast("Failed to reprocess OCR", "error");
    } finally {
      setReprocessingBill(null);
    }
  };

  const handleClose = () => {
    setGeneratedInvoice(null);
    setInvoiceGenerated(false);
    setSelectedBills([]);
    onClose();
  };

  // Download a bill's PDF and run client-side OCR to extract items
  const clientExtractItemsFromPdf = async (bill: Bill) => {
    try {
      if (!bill.pdf) return [] as GeneratedInvoice["line_items"];
      const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(bill.pdf)}`;
      const resp = await fetch(proxyUrl);
      if (!resp.ok) return [] as GeneratedInvoice["line_items"];
      const blob = await resp.blob();
      const file = new File([blob], bill.pdf.split("/").pop() || "bill.pdf", { type: 'application/pdf' });
      const ocr = await extractBillFromPdf(file);
      const items = (ocr.items || []).map((it, idx) => ({
        description: it.description,
        quantity: Number(it.quantity) || 1,
        rate: Number(it.rate) || 0,
        amount: Number(it.amount) || (Number(it.quantity) || 1) * (Number(it.rate) || 0),
        bill_id: bill.id,
      })).filter(it => it.description && it.quantity > 0 && (it.rate > 0 || it.amount > 0));
      return items as GeneratedInvoice["line_items"];
    } catch (e) {
      console.warn('Client OCR fallback failed:', e);
      return [] as GeneratedInvoice["line_items"];
    }
  };

  // Use a local PDF selected by the user to force detailed itemization via client-side OCR
  const handleLocalPdfOcr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalOcrBusy(true);
    try {
      const ocr = await extractBillFromPdf(file);
      const items = (ocr.items || [])
        .map((it) => ({
          description: it.description,
          quantity: Number(it.quantity) || 1,
          rate: Number(it.rate) || 0,
          amount: Number(it.amount) || (Number(it.quantity) || 1) * (Number(it.rate) || 0),
          bill_id: 'LOCAL',
        }))
        .filter((it) => it.description && it.quantity > 0 && (it.rate > 0 || it.amount > 0));

      if (items.length === 0) {
        showToast('Could not extract items from the selected PDF', 'error');
        return;
      }

      // Consolidate duplicates
      const recon = new Map<string, GeneratedInvoice["line_items"][0]>();
      items.forEach((item) => {
        const key = item.description.toLowerCase().trim();
        if (recon.has(key)) {
          const ex = recon.get(key)!;
          ex.quantity += item.quantity;
          ex.amount += item.amount;
          ex.rate = ex.amount / Math.max(1, ex.quantity);
          ex.bill_id += `,${item.bill_id}`;
        } else {
          recon.set(key, { ...item });
        }
      });
      const finalLineItems = Array.from(recon.values());
      const subtotalAmount = finalLineItems.reduce((sum, item) => sum + item.amount, 0);
      const taxPercent = 10;
      const taxAmount = Math.round((subtotalAmount * taxPercent) / 100);
      const grandTotal = Math.round(subtotalAmount + taxAmount);

      const invoiceData: GeneratedInvoice = {
        amount: grandTotal,
        description: `Invoice for ${step?.title || 'Project Step'}`,
        line_items: finalLineItems,
        invoice_number: `INV-${step?.title?.slice(0, 3)?.toUpperCase() || "STEP"}-${new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, '')}`,
        invoice_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: 'DRAFT',
        subtotal: Math.round(subtotalAmount),
        tax_percent: taxPercent,
        tax_amount: taxAmount,
        grand_total: grandTotal,
      };

      setGeneratedInvoice(invoiceData);
      setInvoiceGenerated(true);
      showToast('Itemized invoice generated from local PDF!', 'success');
    } catch (err) {
      console.error('Local PDF OCR failed:', err);
      showToast('Local PDF OCR failed', 'error');
    } finally {
      setLocalOcrBusy(false);
      e.target.value = '';
    }
  };

  if (!open) return null;

  // Only include the selected bills for this step in the invoice preview
  const filteredBills = bills.filter(bill => selectedBills.includes(bill.id));

  // Use filteredBills for line items and invoice preview
  // const lineItems = filteredBills.map((bill, index) => ({
  //   description: bill.pdf ? bill.pdf.split("/").pop() : `Bill ${index + 1}`,
  //   quantity: 1,
  //   rate: bill.ocr_data?.total || 0,
  //   amount: bill.ocr_data?.total || 0,
  //   bill_id: bill.id
  // }));

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Generate Invoice</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Step Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                 <p className="text-sm text-blue-600"><span className="font-medium">Project:</span> {project?.name || project?.title || 'Loading...'}</p>
                 <p className="text-sm text-blue-600"><span className="font-medium">Step:</span> {step?.title || 'N/A'}</p>
               </div>
              <div>
                <p className="text-sm text-blue-600"><span className="font-medium">Status:</span> {bills.find(bill => selectedBills.includes(bill.id))?.is_submitted_to_admin ? 'Submitted' : 'Draft'}</p>
                                 <p className="text-sm text-blue-600"><span className="font-medium">Order:</span> {step?.order || 'N/A'}</p>
              </div>
            </div>
          </div>

          {!invoiceGenerated ? (
            <>
              {/* Bills Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Select Bills for Invoice</h3>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectedBills.length === bills.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading bills...</p>
                  </div>
                ) : bills.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <RiFileTextLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No bills available for this project</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bills.filter(bill => bill.step === step.id).map((bill) => (
                      <div
                        key={bill.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedBills.includes(bill.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleBillSelection(bill.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedBills.includes(bill.id)}
                              onChange={() => handleBillSelection(bill.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                                                         <div>
                               <p className="font-medium text-gray-800">{bill.pdf?.split("/").pop() || `Bill ${bill.id.slice(0, 8)}`}</p>
                               <p
                                 className="text-sm text-gray-600 underline-offset-2 hover:underline cursor-pointer"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   const current = billComputedTotals[bill.id] ?? computeBillTotal(bill);
                                   const entered = window.prompt("Enter bill total (Rs.)", String(current));
                                   if (entered != null) {
                                     const cleaned = Number(String(entered).replace(/[^0-9.]/g, ""));
                                     if (!isNaN(cleaned) && cleaned >= 0) {
                                       setBillComputedTotals((prev) => ({ ...prev, [bill.id]: Math.round(cleaned) }));
                                       // Persist override to backend so it survives refresh
                                       (async () => {
                                         try {
                                           const res = await fetchWithAuth(
                                             `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/${bill.id}/`,
                                             {
                                               method: 'PATCH',
                                               headers: { 'Content-Type': 'application/json' },
                                               body: JSON.stringify({ ocr_data: { ...(bill.ocr_data || {}), total: Math.round(cleaned) } })
                                             }
                                           );
                                           if (!res.ok) {
                                             const t = await res.text();
                                             console.error('Failed to persist bill total:', t);
                                             showToast('Failed to save amount. It will revert on refresh.', 'error');
                                           } else {
                                             showToast('Amount saved.');
                                           }
                                         } catch (err) {
                                           console.error('Persist override error:', err);
                                           showToast('Failed to save amount. It will revert on refresh.', 'error');
                                         }
                                       })();
                                     }
                                   }
                                 }}
                               >
                               Amount: Rs. {(billComputedTotals[bill.id] ?? computeBillTotal(bill)).toLocaleString('en-LK')}
                               </p>
                              <p className="text-sm text-gray-600">
                                Uploaded: {bill.uploaded_at ? new Date(bill.uploaded_at).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                                                     <div className="flex items-center gap-2">
                             {bill.pdf && (
                               <a
                                 href={bill.pdf}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-blue-600 hover:text-blue-800"
                                 onClick={(e) => e.stopPropagation()}
                                 title="View Bill"
                               >
                                 <RiEyeLine />
                               </a>
                             )}
                             {bill.pdf && (
                               <a
                                 href={bill.pdf}
                                 download
                                 className="text-green-600 hover:text-green-800"
                                 onClick={(e) => e.stopPropagation()}
                                 title="Download Bill"
                               >
                                 <RiDownloadLine />
                               </a>
                             )}
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleReprocessOCR(bill.id);
                               }}
                               disabled={reprocessingBill === bill.id}
                               className="text-purple-600 hover:text-purple-800 disabled:opacity-50"
                               title="Reprocess OCR to extract amount"
                             >
                               {reprocessingBill === bill.id ? (
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                               ) : (
                                 <RiFileTextLine />
                               )}
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { void handleGenerateInvoice(); }}
                  disabled={selectedBills.length === 0 || saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RiFileTextLine />
                  {saving ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Generated Invoice Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Generated Invoice Preview</h3>
                <div id="invoice-preview" className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <style>{`
                    #invoice-preview, #invoice-preview * {
                      background: #ffffff !important;
                      color: #222222 !important;
                      border-color: #e5e7eb !important;
                      box-shadow: none !important;
                      --tw-bg-opacity: 1 !important;
                      --tw-text-opacity: 1 !important;
                    }
                  `}</style>
                  {/* Signed Invoice Upload */}
                  <div className="mb-2">
                    <p className="text-sm text-gray-600 mb-2">Signed Invoice (optional, PDF/JPG/PNG)</p>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0] || null;
                        setSignedInvoiceFile(f);
                        if (f) {
                          try {
                            const fd = new FormData();
                            fd.append('file', f);
                            fd.append('project', step?.project_id || step?.project || '');
                            const uploadRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/uploads/signed_invoice/`, {
                              method: 'POST',
                              body: fd,
                            });
                            if (uploadRes.ok) {
                              const data = await uploadRes.json();
                              setSignedInvoiceUrl(data.url || data.file || '');
                              showToast('Signed invoice uploaded successfully!', 'success');
                            } else {
                              showToast('Failed to upload signed invoice', 'error');
                            }
                          } catch (err) {
                            showToast('Failed to upload signed invoice', 'error');
                          }
                        }
                      }}
                      className="block w-full text-sm"
                    />
                    {signedInvoiceUrl && (
                      <p className="text-xs text-green-700 mt-1">Uploaded: <a className="underline" href={signedInvoiceUrl} target="_blank" rel="noreferrer">View file</a></p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Invoice Number</p>
                      <p className="font-medium">{generatedInvoice?.invoice_number || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-xl text-blue-600">Rs. {generatedInvoice?.amount?.toLocaleString('en-LK') || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Invoice Date</p>
                      <p className="font-medium">{generatedInvoice?.invoice_date || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium">{generatedInvoice?.due_date || ''}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <p className="font-medium">{generatedInvoice?.description || ''}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Line Items</p>
                    <div className="space-y-2">
                      {(generatedInvoice?.line_items || []).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity} × Rs. {item.rate.toLocaleString('en-LK')}</p>
                          </div>
                          <p className="font-semibold">Rs. {item.amount.toLocaleString('en-LK')}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Subtotal */}
                    <div className="border-t pt-3 mt-4">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-700">Subtotal:</p>
                        <p className="font-bold text-lg text-blue-600">
                          Rs. {(generatedInvoice?.line_items || []).reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-LK')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                             {/* Action Buttons */}
               <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 border-t">
                 <button
                   onClick={handleClose}
                   className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                 >
                   Back to Bills
                 </button>
                 <button
                   onClick={handleDownloadInvoice}
                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                 >
                   <RiDownloadLine />
                   Download PDF
                 </button>
                 <button
                   onClick={() => { void handleGenerateInvoice(); }}
                   disabled={saving}
                   className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                 >
                   <RiCheckLine />
                   {saving ? "Saving..." : "Save Invoice"}
                 </button>
                 <button
                   onClick={handleSubmitToAdmin}
                   disabled={saving}
                   className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50"
                 >
                   <RiFileTextLine />
                   Submit to Admin
                 </button>
               </div>
            </>
          )}
        </div>
      </div>

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
