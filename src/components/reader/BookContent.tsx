import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
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
  onDocumentLoadSuccess: (pdf: any) => void;
  onDocumentLoadError: (error: Error) => void;
  isFullscreen?: boolean;
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
  // options removed
  isFullscreen,
}: BookContentProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [displayPage, setDisplayPage] = useState(currentPage);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState<number>(700);
  const draggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; sx: number; sy: number } | null>(null);

  useEffect(() => { setDisplayPage(currentPage); }, [currentPage]);

  const nextPage = () => {
    const increment = pageMode === 'double' ? 2 : 1;
    if (currentPage + increment <= totalPages) {
      onPageChange(currentPage + increment);
    }
  };

  const prevPage = () => {
    const decrement = pageMode === 'double' ? 2 : 1;
    if (currentPage - decrement >= 1) {
      onPageChange(currentPage - decrement);
    }
  };

  const pageBackground = { light: 'bg-[#fafaf7]', sepia: 'bg-[#f7f1e0]', dark: 'bg-[#12161a]' } as const;

  const pageStyleCommon = { boxShadow: '0 10px 30px rgba(0,0,0,0.12)' } as React.CSSProperties;

  const containerBg = { light: 'bg-white', sepia: 'bg-amber-50', dark: 'bg-slate-950' } as const;

  useEffect(() => {
    const calc = () => {
      const w = containerRef.current?.clientWidth || window.innerWidth;
      const h = containerRef.current?.clientHeight || window.innerHeight;
      const baseFactor = 0.85 + Math.max(0, (fontSize - 16) / 2) * 0.05;
      const zoomFactor = Math.min(1.6, Math.max(0.6, baseFactor));
      const ratio = 1.414; // approximate page aspect ratio (height/width)
      const heightLimit = Math.max(360, h - 48);
      if (pageMode === 'double') {
        const maxByWidth = (w - 96) / 2;
        const maxByHeight = heightLimit / ratio;
        const each = Math.min(maxByWidth, maxByHeight) * zoomFactor;
        setPageWidth(Math.floor(each));
      } else {
        const maxByWidth = w - 64;
        const maxByHeight = heightLimit / ratio;
        const single = Math.min(maxByWidth, maxByHeight) * zoomFactor;
        setPageWidth(Math.floor(single));
      }
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [pageMode, fontSize]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current || !dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      containerRef.current.scrollLeft = dragStartRef.current.sx - dx;
      containerRef.current.scrollTop = dragStartRef.current.sy - dy;
    };
    const onMouseUp = () => {
      draggingRef.current = false;
      dragStartRef.current = null;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
  return (
    <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${containerBg[theme]} ${isChapterMenuOpen ? 'ml-0' : 'ml-0'} overflow-hidden`}>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none;} .no-scrollbar{scrollbar-width:none;}`}</style>
      <div
        ref={containerRef}
        className={`relative w-full ${isFullscreen ? 'h-[100vh]' : 'h-[calc(100vh-120px)] md:h-[calc(100vh-110px)]'} flex items-stretch justify-center px-4 overflow-auto`}
        onMouseDown={(e) => {
          if (!containerRef.current) return;
          draggingRef.current = true;
          dragStartRef.current = { x: e.clientX, y: e.clientY, sx: containerRef.current.scrollLeft, sy: containerRef.current.scrollTop };
          document.body.style.cursor = 'grabbing';
          e.preventDefault();
        }}
      >
        <Button aria-label="Previous page" variant="ghost" size="lg" onClick={prevPage} disabled={currentPage === 1 || isFlipping} className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 size-14 p-0 rounded-full shadow-xl ${theme === 'light' ? 'bg-white/90 text-gray-900' : theme === 'sepia' ? 'bg-amber-100 text-amber-900' : 'bg-slate-800 text-gray-100'}`}>
          <ChevronLeft className="size-7" />
        </Button>
        <div className="flex gap-4 items-stretch justify-center h-full max-w-[2000px]">
          {pageMode === 'double' ? (
            <>
              <div className={`relative h-full p-6 ${pageBackground[theme]} rounded-l-lg shadow-2xl flex flex-col transition-all duration-300 cursor-grab`} style={{ ...pageStyleCommon }}>
                <div className="flex-1 overflow-hidden">
                  <Document file={pdfPath} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError}>
                    <Page pageNumber={displayPage} width={pageWidth} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-2xl" />
                  </Document>
                </div>
              </div>
              {currentPage < totalPages && (
                <div className={`relative h-full p-6 ${pageBackground[theme]} rounded-r-lg shadow-2xl flex flex-col transition-all duration-300 cursor-grab`} style={{ ...pageStyleCommon }}>
                  <div className="flex-1 overflow-hidden">
                    <Document file={pdfPath}>
                      <Page pageNumber={displayPage + 1} width={pageWidth} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-2xl" />
                    </Document>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={`relative h-full p-6 ${pageBackground[theme]} rounded-lg shadow-2xl flex flex-col transition-all duration-300 cursor-grab`} style={pageStyleCommon}>
              <div className="flex-1 overflow-hidden">
                <Document file={pdfPath} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError}>
                  <Page pageNumber={currentPage} width={pageWidth} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-2xl" />
                </Document>
              </div>
            </div>
          )}
        </div>
        <Button aria-label="Next page" variant="ghost" size="lg" onClick={nextPage} disabled={currentPage >= totalPages || isFlipping} className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 size-14 p-0 rounded-full shadow-xl ${theme === 'light' ? 'bg-white/90 text-gray-900' : theme === 'sepia' ? 'bg-amber-100 text-amber-900' : 'bg-slate-800 text-gray-100'}`}>
          <ChevronRight className="size-7" />
        </Button>
      </div>
    </div>
  );
}

export default BookContent;