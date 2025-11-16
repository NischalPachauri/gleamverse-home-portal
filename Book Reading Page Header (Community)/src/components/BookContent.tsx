import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';

interface BookContentProps {
  fontSize: number;
  pageMode: 'single' | 'double';
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  theme: 'light' | 'sepia' | 'dark';
  isChapterMenuOpen: boolean;
  pdfPath: string;
  scale: number;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onDocumentLoadError: (error: Error) => void;
  options: any;
}

export function BookContent({
  fontSize,
  pageMode,
  currentPage,
  onPageChange,
  totalPages,
  theme,
  isChapterMenuOpen,
  pdfPath,
  scale,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  options
}: BookContentProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [displayPage, setDisplayPage] = useState(currentPage);

  useEffect(() => {
    setDisplayPage(currentPage);
  }, [currentPage]);

  const nextPage = () => {
    const increment = pageMode === 'double' ? 2 : 1;
    if (currentPage + increment <= totalPages) {
      if (pageMode === 'double') {
        setIsFlipping(true);
        setFlipDirection('next');
        setTimeout(() => {
          onPageChange(currentPage + increment);
          setIsFlipping(false);
          setFlipDirection(null);
        }, 600);
      } else {
        onPageChange(currentPage + increment);
      }
    }
  };

  const prevPage = () => {
    const decrement = pageMode === 'double' ? 2 : 1;
    if (currentPage - decrement >= 1) {
      if (pageMode === 'double') {
        setIsFlipping(true);
        setFlipDirection('prev');
        setTimeout(() => {
          onPageChange(currentPage - decrement);
          setIsFlipping(false);
          setFlipDirection(null);
        }, 600);
      } else {
        onPageChange(currentPage - decrement);
      }
    }
  };

  const themeColors = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-amber-50 text-amber-950',
    dark: 'bg-slate-900 text-gray-100'
  };

  const pageBackground = {
    light: 'bg-white',
    sepia: 'bg-amber-50',
    dark: 'bg-slate-900'
  };

  const pageStyleCommon = {
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  } as React.CSSProperties;

  return (
    <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${
      isChapterMenuOpen ? 'ml-0' : 'ml-0'
    } overflow-hidden`}>
      <div className="relative w-full h-full flex items-center justify-center px-4">
        {/* Previous Page Button */}
        <Button
          variant="ghost"
          size="lg"
          onClick={prevPage}
          disabled={currentPage === 1 || isFlipping}
          className="absolute left-4 z-10 size-12 rounded-full shadow-lg opacity-70 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="size-6" />
        </Button>

        {/* Book Pages */}
        <div className="flex gap-6 items-center justify-center h-[calc(100vh-120px)] max-w-[1800px]" style={{ perspective: '2000px' }}>
          {pageMode === 'double' ? (
            <>
              {/* Left Page */}
              <div
                className={`w-[48vw] max-w-[650px] h-full p-6 ${pageBackground[theme]} rounded-l-lg shadow-2xl flex flex-col transition-all duration-300`}
                style={{
                  ...pageStyleCommon,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15), inset -4px 0 10px rgba(0,0,0,0.05)',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-opacity-20">
                  <span className="text-xs opacity-40">{displayPage}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Document file={pdfPath} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} options={options}>
                    <Page pageNumber={displayPage} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-2xl" />
                  </Document>
                </div>
              </div>

              {/* Right Page - with flip animation */}
              {currentPage < totalPages && (
                <div
                  className={`w-[48vw] max-w-[650px] h-full p-6 ${pageBackground[theme]} rounded-r-lg shadow-2xl flex flex-col transition-all duration-600 ${
                    isFlipping && flipDirection === 'next' ? 'animate-page-turn-next' : ''
                  } ${
                    isFlipping && flipDirection === 'prev' ? 'animate-page-turn-prev' : ''
                  }`}
                  style={{
                    ...pageStyleCommon,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15), inset 4px 0 10px rgba(0,0,0,0.05)',
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'left center'
                  }}
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-opacity-20">
                    <span className="text-xs opacity-40">{displayPage + 1}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <Document file={pdfPath} options={options}>
                      <Page pageNumber={displayPage + 1} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-2xl" />
                    </Document>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Single Page */
            <div
              className={`w-[60vw] max-w-[700px] h-full p-6 ${pageBackground[theme]} rounded-lg shadow-2xl flex flex-col transition-all duration-300`}
              style={pageStyleCommon}
            >
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-opacity-20">
                <span className="text-xs opacity-40">{currentPage}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <Document file={pdfPath} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} options={options}>
                  <Page pageNumber={currentPage} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-2xl" />
                </Document>
              </div>
            </div>
          )}
        </div>

        {/* Next Page Button */}
        <Button
          variant="ghost"
          size="lg"
          onClick={nextPage}
          disabled={currentPage >= totalPages || isFlipping}
          className="absolute right-4 z-10 size-12 rounded-full shadow-lg opacity-70 hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="size-6" />
        </Button>
      </div>
    </div>
  );
}