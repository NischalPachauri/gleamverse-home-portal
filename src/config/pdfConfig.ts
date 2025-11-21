import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
// CRITICAL: This must be set before any PDF documents are loaded
if (typeof window !== 'undefined') {
    // Use the version-matched worker from unpkg CDN
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    console.log('[PDF Config] Worker initialized:', pdfjs.GlobalWorkerOptions.workerSrc);
    console.log('[PDF Config] PDF.js version:', pdfjs.version);
}

export { pdfjs };
