import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Test PDF component to isolate loading issues
export const PDFTest = () => {
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const testPdfs = [
    "/books/10 Books in 1.pdf",
    "/books/2 States The story of my Marriage.pdf",
    "/books/Harry Potter and the Chamber of Secrets.pdf"
  ];

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', numPages);
    setNumPages(numPages);
    setError(null);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError(error.message || 'Failed to load PDF');
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PDF Loading Test</h1>
      
      <div className="mb-4">
        <p className="mb-2">PDF.js Version: {pdfjs.version}</p>
        <p className="mb-2">Worker Source: {pdfjs.GlobalWorkerOptions.workerSrc}</p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {testPdfs.map((pdfPath, index) => (
          <div key={index} className="border rounded p-4">
            <h3 className="font-semibold mb-2">{pdfPath}</h3>
            <Document
              file={pdfPath}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p>Loading PDF...</p>
                </div>
              }
              options={{
                cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                cMapPacked: true,
                standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                disableAutoFetch: true,
                disableStream: false,
                disableRange: false,
                rangeChunkSize: 65536,
                useSystemFonts: false,
                useWorkerFetch: true,
              }}
            >
              {numPages > 0 && (
                <Page pageNumber={1} width={300} />
              )}
            </Document>
            {numPages > 0 && (
              <p className="text-green-600 mt-2">✅ Loaded successfully! {numPages} pages</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};