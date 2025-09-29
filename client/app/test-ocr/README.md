# OCR Test Pages

This directory contains test pages for testing PDF OCR functionality using Tesseract.js before integrating it into the bill management system.

## Pages

### 1. Basic OCR Test (`/test-ocr`)
- **File**: `page.tsx`
- **Purpose**: Simple OCR test with mock results
- **Features**:
  - File upload interface
  - Mock OCR processing with progress tracking
  - Results display with confidence scores
  - Download functionality for extracted text

### 2. Advanced OCR Test (`/test-ocr/advanced`)
- **File**: `advanced/page.tsx`
- **Purpose**: Full PDF processing with real OCR
- **Features**:
  - PDF.js integration for multi-page PDF processing
  - Real Tesseract.js OCR processing
  - High-resolution image conversion (2x scale)
  - Page-by-page processing with individual confidence scores
  - Detailed statistics and per-page results
  - Real-time progress tracking

### 3. Simple OCR Test (`/test-ocr/simple`)
- **File**: `simple/page.tsx`
- **Purpose**: Fixed OCR test without DataCloneError
- **Features**:
  - Image file processing (no PDF.js complexity)
  - Fixed Tesseract.js worker implementation
  - Manual progress tracking without worker callbacks
  - Better error handling and type safety
  - Simplified interface for testing OCR functionality

### 4. Parse Test (`/test-ocr/parse-test`)
- **File**: `parse-test/page.tsx`
- **Purpose**: Test enhanced bill data parsing from OCR text
- **Features**:
  - Enhanced pattern matching for better data extraction
  - Multiple regex patterns for invoice numbers, dates, vendors
  - Project and step information extraction
  - Improved line items parsing with validation
  - OCR result quality validation and suggestions
  - JSON export of parsed data

### 5. PDF Generator (`/test-ocr/pdf-generator`)
- **File**: `pdf-generator/page.tsx`
- **Purpose**: Generate OCR-optimized PDF bills for testing
- **Features**:
  - Interactive bill data form with real-time editing
  - Standard PDF generation with jsPDF
  - OCR-optimized PDF with high contrast and larger fonts
  - Line items management with automatic calculations
  - Customizable vendor, client, and project information
  - Download generated PDFs for OCR testing

## Utility Functions

### OCR Utils (`/utils/ocrUtils.ts`)
Reusable utility functions for OCR processing:

- `convertPDFToImages()` - Convert PDF pages to images using PDF.js
- `processImageWithOCR()` - Process single image with Tesseract.js
- `extractTextFromPDF()` - Complete PDF to text extraction
- `parseBillData()` - Parse structured data from OCR text
- `validateOCRResult()` - Validate OCR result quality

## How to Use

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to test pages**:
   - Basic test: `http://localhost:3000/test-ocr`
   - Advanced test: `http://localhost:3000/test-ocr/advanced`

3. **Upload a PDF file** and click "Process with OCR"

4. **View results** including:
   - Extracted text
   - Confidence scores
   - Processing time
   - Per-page results (advanced version)

## Integration with Bill Management

The utility functions in `ocrUtils.ts` can be directly integrated into the bill management system:

```typescript
import { extractTextFromPDF, parseBillData } from '@/app/utils/ocrUtils';

// In bill upload handler
const ocrResult = await extractTextFromPDF(pdfFile, {
  onProgress: (progress) => {
    // Update UI with progress
  }
});

// Parse structured bill data
const billData = parseBillData(ocrResult.text);
```

## Dependencies

- **Tesseract.js**: OCR engine for text extraction
- **PDF.js**: PDF processing and page-to-image conversion
- **Framer Motion**: Animations and transitions
- **React Icons**: UI icons

## Notes

- The basic test page shows mock results for demonstration
- The advanced test page performs real OCR processing
- The simple test page is fixed to avoid DataCloneError issues
- Processing time varies based on PDF size and image quality
- Higher resolution images (2x scale) provide better OCR accuracy
- Confidence scores indicate the reliability of text recognition

## DataCloneError Fix

The original implementation had a `DataCloneError` when using Tesseract.js logger functions. This has been fixed by:

1. **Removing logger functions** that couldn't be cloned to the worker
2. **Using basic createWorker()** without complex configuration
3. **Manual progress tracking** instead of worker callbacks
4. **Better type safety** with proper null checks
5. **Simplified worker initialization** process

The simple test page (`/test-ocr/simple`) demonstrates the working implementation without the DataCloneError.

## Next Steps

1. Test with various PDF types and qualities
2. Fine-tune OCR parameters for better accuracy
3. Integrate the utility functions into the bill management system
4. Add error handling and retry mechanisms
5. Optimize performance for large PDF files
