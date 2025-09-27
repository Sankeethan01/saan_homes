declare module "pdfjs-dist" {
  export const GlobalWorkerOptions: any;
  export function getDocument(src: any): { promise: any };
}

declare module "tesseract.js" {
  export function createWorker(opts?: any): Promise<{
    loadLanguage: (lang: string) => Promise<void>;
    initialize: (lang: string) => Promise<void>;
    recognize: (image: any, opts?: any) => Promise<{ data: { text: string; confidence?: number } }>;
    terminate: () => Promise<void>;
  }>
}


