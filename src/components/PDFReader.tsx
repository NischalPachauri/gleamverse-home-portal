import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
try {
  (pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc as unknown as string;
} catch {}
try {
  const wk = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' });
  (pdfjs as any).GlobalWorkerOptions.workerPort = wk;
} catch {}
import BookHeader from '@/components/reader/BookHeader';
import ChapterMenu from '@/components/reader/ChapterMenu';

interface BookContentProps {
  magnification: number;
  pageMode: 'single' | 'double';
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  theme: 'light' | 'sepia' | 'dark';
  isChapterMenuOpen: boolean;
  pdfPath: string;
  onDocumentLoadSuccess: (pdf: any) => void;
  onDocumentLoadError: (error: Error) => void;
  isFullscreen?: boolean;
  isPanMode: boolean;
  onToggleChapters: () => void;
}

export function BookContent({
  magnification,
  pageMode,
  currentPage,
  onPageChange,
  totalPages,
  theme,
  isChapterMenuOpen,
  pdfPath,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  isFullscreen,
  isPanMode,
  onToggleChapters,
}: BookContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState<number>(700);
  const [showArrows, setShowArrows] = useState(true);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; scrollX: number; scrollY: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingMoveRef = useRef<{ dx: number; dy: number } | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [pageRatio, setPageRatio] = useState<number>(1.414);

  const pageBackground = { 
    light: 'bg-[#fafaf7]', 
    sepia: 'bg-[#f7f1e0]', 
    dark: 'bg-[#12161a]' 
  } as const;

  const containerBg = { 
    light: 'bg-white', 
    sepia: 'bg-amber-50', 
    dark: 'bg-slate-950' 
  } as const;

  const textColor = {
    light: 'text-gray-900',
    sepia: 'text-amber-950',
    dark: 'text-gray-100'
  } as const;

  // Calculate page width based on fit-to-screen
  useEffect(() => {
    const calculatePageSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      let targetHeight = containerHeight;
      if (pageMode === 'double') {
        const maxHeightByWidth = (containerWidth / 2) * pageRatio;
        targetHeight = Math.min(targetHeight, maxHeightByWidth);
      } else {
        const maxHeightByWidth = containerWidth * pageRatio;
        targetHeight = Math.min(targetHeight, maxHeightByWidth);
      }
      const widthFromHeight = Math.max(300, Math.floor(targetHeight / pageRatio));
      const cappedWidth = Math.min(widthFromHeight, pageMode === 'double' ? Math.floor(containerWidth / 2) : containerWidth);
      setPageWidth(cappedWidth);
      setShowArrows(true);
    };
    calculatePageSize();
    const resizeObserver = new ResizeObserver(calculatePageSize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', calculatePageSize);
    return () => {
      window.removeEventListener('resize', calculatePageSize);
      resizeObserver.disconnect();
    };
  }, [pageMode, magnification, isFullscreen, pageRatio]);

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

  // Enhanced pan/drag functionality
  // Fresh hand tool implementation using pointer events
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanMode || !containerRef.current) return;
    e.preventDefault();
    pointerIdRef.current = e.pointerId;
    containerRef.current.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollX: containerRef.current.scrollLeft,
      scrollY: containerRef.current.scrollTop,
    };
    containerRef.current.style.cursor = 'grabbing';
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !containerRef.current || !dragStartRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    pendingMoveRef.current = { dx, dy };
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const move = pendingMoveRef.current;
        if (!move || !containerRef.current || !dragStartRef.current) return;
        const targetLeft = dragStartRef.current.scrollX - move.dx;
        const targetTop = dragStartRef.current.scrollY - move.dy;
        const maxLeft = containerRef.current.scrollWidth - containerRef.current.clientWidth;
        const maxTop = containerRef.current.scrollHeight - containerRef.current.clientHeight;
        containerRef.current.scrollLeft = Math.max(0, Math.min(maxLeft, targetLeft));
        containerRef.current.scrollTop = Math.max(0, Math.min(maxTop, targetTop));
      });
    }
  };

  const endDrag = () => {
    isDraggingRef.current = false;
    dragStartRef.current = null;
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    pendingMoveRef.current = null;
    if (containerRef.current) {
      containerRef.current.style.cursor = '';
      if (pointerIdRef.current != null) {
        try { containerRef.current.releasePointerCapture(pointerIdRef.current); } catch {}
      }
    }
    pointerIdRef.current = null;
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isPanMode || !containerRef.current) return;
    // Smooth wheel panning in both axes
    containerRef.current.scrollLeft += e.deltaX;
    containerRef.current.scrollTop += e.deltaY;
  };

  return (
    <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${containerBg[theme]} overflow-hidden`} role="main" aria-label="Book content">
      <div
        ref={containerRef}
        className={`relative w-full ${
          isFullscreen ? 'h-[100vh]' : 'h-[calc(100vh-120px)] md:h-[calc(100vh-110px)]'
        } flex items-center justify-center overflow-auto ${
          isPanMode ? (isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onWheel={onWheel}
        style={{ 
          scrollBehavior: isDraggingRef.current ? 'auto' : 'smooth',
          userSelect: isPanMode ? 'none' : 'auto',
          touchAction: isPanMode ? 'none' : 'auto'
        }}
      >
        {!isFullscreen && (
          <button
            onClick={onToggleChapters}
            className={`absolute left-4 top-4 z-20 size-10 rounded-full border-2 shadow-md flex items-center justify-center transition-all ${
              theme === 'light' ? 'bg-white/95 text-gray-900 border-blue-300 hover:bg-blue-100' :
              theme === 'sepia' ? 'bg-amber-100/95 text-amber-900 border-amber-400 hover:bg-amber-100' :
              'bg-slate-800/95 text-gray-100 border-slate-600 hover:bg-slate-700'
            }`}
            title="Open chapter navigation (C)"
            aria-label="Open chapter navigation"
            aria-expanded={isChapterMenuOpen}
          >
            <MoreVertical className="size-5" />
          </button>
        )}
        {/* Navigation Arrows - Only show when not overflowing */}
        {showArrows && !isPanMode && (
          <>
            <Button 
              aria-label="Previous page" 
              variant="ghost" 
              size="lg" 
              onClick={prevPage} 
              disabled={currentPage === 1} 
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 size-12 p-0 rounded-full transition-all ${
                currentPage === 1 ? 'opacity-0 pointer-events-none' : 'opacity-80 hover:opacity-100 hover:scale-110'
              } ${
                theme === 'light' ? 'bg-white/95 text-gray-900 shadow-lg hover:shadow-xl' : 
                theme === 'sepia' ? 'bg-amber-100/95 text-amber-900 shadow-lg hover:shadow-xl' : 
                'bg-slate-800/95 text-gray-100 shadow-lg hover:shadow-xl'
              }`}
            >
              <ChevronLeft className="size-6" />
            </Button>

            <Button 
              aria-label="Next page" 
              variant="ghost" 
              size="lg" 
              onClick={nextPage} 
              disabled={currentPage >= totalPages} 
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 size-12 p-0 rounded-full transition-all ${
                currentPage >= totalPages ? 'opacity-0 pointer-events-none' : 'opacity-80 hover:opacity-100 hover:scale-110'
              } ${
                theme === 'light' ? 'bg-white/95 text-gray-900 shadow-lg hover:shadow-xl' : 
                theme === 'sepia' ? 'bg-amber-100/95 text-amber-900 shadow-lg hover:shadow-xl' : 
                'bg-slate-800/95 text-gray-100 shadow-lg hover:shadow-xl'
              }`}
            >
              <ChevronRight className="size-6" />
            </Button>
          </>
        )}

        {/* Book Pages Container */}
        <div className={`${isFullscreen ? 'gap-0 py-0 px-0' : 'gap-6 py-0 px-0'} flex ${isFullscreen ? 'items-stretch justify-between' : 'items-center justify-center'}`}>
          {pageMode === 'double' ? (
            <>
              {/* Left Page */}
              <div 
                className={`${pageBackground[theme]} ${isFullscreen ? 'rounded-none' : 'rounded-lg'} ${isFullscreen ? 'p-0' : 'p-6'} transition-all duration-300`}
                style={{ 
                  width: `${pageWidth}px`,
                }}
              >
                <Document 
                  file={pdfPath} 
                  onLoadSuccess={onDocumentLoadSuccess} 
                  onLoadError={onDocumentLoadError}
                >
                  <Page 
                    pageNumber={currentPage} 
                    width={pageWidth}
                    onLoadSuccess={(p: any) => { try { const vp = p.getViewport({ scale: 1 }); setPageRatio(vp.height / vp.width); } catch {} }}
                    renderTextLayer={false} 
                    renderAnnotationLayer={false}
                  />
                </Document>
              </div>

              {/* Right Page */}
              {currentPage < totalPages && (
                <div 
                  className={`${pageBackground[theme]} ${isFullscreen ? 'rounded-none' : 'rounded-lg'} ${isFullscreen ? 'p-0' : 'p-6'} transition-all duration-300`}
                  style={{ 
                    width: `${pageWidth}px`,
                  }}
                >
                  <Document file={pdfPath}>
                    <Page 
                      pageNumber={currentPage + 1} 
                      width={pageWidth}
                      onLoadSuccess={(p: any) => { try { const vp = p.getViewport({ scale: 1 }); setPageRatio(vp.height / vp.width); } catch {} }}
                      renderTextLayer={false} 
                      renderAnnotationLayer={false}
                    />
                  </Document>
                </div>
              )}
            </>
          ) : (
            /* Single Page */
            <div 
              className={`${pageBackground[theme]} ${isFullscreen ? 'rounded-none' : 'rounded-lg'} ${isFullscreen ? 'p-0' : 'p-6'} transition-all duration-300`}
              style={{ 
                width: `${pageWidth}px`,
              }}
            >
              <Document 
                file={pdfPath} 
                onLoadSuccess={onDocumentLoadSuccess} 
                onLoadError={onDocumentLoadError}
              >
                <Page 
                  pageNumber={currentPage} 
                  width={pageWidth}
                  onLoadSuccess={(p: any) => { try { const vp = p.getViewport({ scale: 1 }); setPageRatio(vp.height / vp.width); } catch {} }}
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          )}
        </div>

        {/* Pan Mode Indicator */}
        {isPanMode && (
          <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full ${
            theme === 'light' ? 'bg-blue-600 text-white' :
            theme === 'sepia' ? 'bg-amber-600 text-white' :
            'bg-indigo-600 text-white'
          } text-sm font-medium shadow-lg z-30 pointer-events-none`}>
            🖐️ Pan Mode Active - Drag to move
          </div>
        )}
      </div>
    </div>
  );
}

export default BookContent;

interface PDFReaderProps {
  pdfPath: string;
  title: string;
  author?: string;
  bookCoverSrc?: string;
  onBack?: () => void;
}

export function PDFReader({ pdfPath, title, author, bookCoverSrc, onBack }: PDFReaderProps) {
  const [magnification, setMagnification] = useState<number>(80);
  const [pageMode, setPageMode] = useState<'single' | 'double'>('double');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState<boolean>(false);
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [chapters, setChapters] = useState<{ id: number; title: string; page: number }[]>([]);
  const [backgroundMusic, setBackgroundMusic] = useState<string>('none');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const onDocumentLoadSuccess = useCallback((pdf: any) => {
    const n = pdf?._pdfInfo?.numPages || pdf?.numPages || 0;
    setTotalPages(n);
    setCurrentPage((prev) => (pageMode === 'double' && prev % 2 === 0 ? prev - 1 : prev));
    (async () => {
      try {
        const outline = await pdf.getOutline?.();
        const collected: { id: number; title: string; page: number }[] = [];
        let id = 1;
        const pushItem = async (item: any) => {
          const title = item?.title || `Chapter ${id}`;
          let pageNum: number | null = null;
          const dest = item?.dest || item?.destRef || item?.url || null;
          try {
            if (Array.isArray(dest) && dest[0]) {
              const pageIndex = await pdf.getPageIndex(dest[0]);
              pageNum = pageIndex + 1;
            } else if (typeof dest === 'string' && pdf.getDestination) {
              const d = await pdf.getDestination(dest);
              if (Array.isArray(d) && d[0]) {
                const pageIndex = await pdf.getPageIndex(d[0]);
                pageNum = pageIndex + 1;
              }
            }
          } catch {}
          if (pageNum) {
            collected.push({ id, title, page: pageNum });
            id++;
          }
          if (Array.isArray(item?.items)) {
            for (const child of item.items) {
              await pushItem(child);
            }
          }
        };
        if (Array.isArray(outline) && outline.length) {
          for (const item of outline) {
            await pushItem(item);
          }
        }
        if (collected.length) {
          const uniqueByPage = new Map<number, { id: number; title: string; page: number }>();
          collected.sort((a, b) => a.page - b.page).forEach((c) => {
            if (!uniqueByPage.has(c.page)) uniqueByPage.set(c.page, c);
          });
          setChapters(Array.from(uniqueByPage.values()).map((c, idx) => ({ ...c, id: idx + 1 })));
        } else {
          const fallback: { id: number; title: string; page: number }[] = [];
          const step = Math.max(10, Math.floor(n / 10));
          let fid = 1;
          for (let p = 1; p <= n; p += step) {
            fallback.push({ id: fid, title: `Chapter ${fid}`, page: p });
            fid++;
          }
          setChapters(fallback);
        }
      } catch {
        const out: { id: number; title: string; page: number }[] = [];
        const step = Math.max(10, Math.floor(n / 10));
        let id = 1;
        for (let p = 1; p <= n; p += step) {
          out.push({ id, title: `Chapter ${id}`, page: p });
          id++;
        }
        setChapters(out);
      }
    })();
  }, [pageMode]);
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setTotalPages(0);
  }, []);

  const toggleFullscreen = async () => {
    try {
      const elem: any = document.documentElement;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn('Fullscreen not supported or blocked:', e);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      const active = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(active);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange as any);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange as any);
    };
  }, []);

  useEffect(() => {
    if (isFullscreen) setIsChapterMenuOpen(false);
  }, [isFullscreen]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (backgroundMusic === 'none') {
      audio.pause();
      audio.src = '';
      return;
    }
    audio.src = backgroundMusic;
    audio.loop = true;
    audio.volume = 0.2;
    audio.play().catch(() => {});
  }, [backgroundMusic]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCurrentPage(p => Math.min(totalPages || p + 1, pageMode === 'double' ? p + 2 : p + 1));
      if (e.key === 'ArrowLeft') setCurrentPage(p => Math.max(1, pageMode === 'double' ? p - 2 : p - 1));
      if (e.key.toLowerCase() === 'f') toggleFullscreen();
      if (e.key.toLowerCase() === 'd') setPageMode(m => (m === 'single' ? 'double' : 'single'));
      if (e.key.toLowerCase() === 'h') setIsPanMode(v => !v);
      if (e.key.toLowerCase() === 't') setTheme(t => (t === 'light' ? 'dark' : t === 'dark' ? 'sepia' : 'light'));
      if (e.key.toLowerCase() === 'c') setIsChapterMenuOpen(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [totalPages, pageMode]);

  useEffect(() => {
    if (!chapters.length) return;
    const current = chapters
      .filter(c => c.page <= currentPage)
      .sort((a, b) => b.page - a.page)[0];
    if (current && currentChapter !== current.id) setCurrentChapter(current.id);
  }, [currentPage, chapters]);

  const onChapterSelect = (chapterId: number) => {
    const ch = chapters.find(c => c.id === chapterId);
    if (ch) {
      setCurrentPage(ch.page);
      setCurrentChapter(chapterId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {!isFullscreen && (
        <BookHeader
          bookInfo={{ title, author: author || '' }}
          bookCoverSrc={bookCoverSrc}
          magnification={magnification}
          onMagnificationChange={setMagnification}
          theme={theme}
          onThemeChange={setTheme}
          pageMode={pageMode}
          onPageModeChange={setPageMode}
          currentPage={currentPage}
          totalPages={totalPages}
          backgroundMusic={backgroundMusic}
          onBackgroundMusicChange={setBackgroundMusic}
          musicOptions={[
            { value: '/music/track1.mp3', label: 'Ambient 1' },
            { value: '/music/track2.mp3', label: 'Ambient 2' },
            { value: '/music/track3.mp3', label: 'Ambient 3' },
            { value: '/music/track4.mp3', label: 'Ambient 4' },
            { value: '/music/track5.mp3', label: 'Ambient 5' },
            { value: '/music/track6.mp3', label: 'Ambient 6' },
          ]}
        isFullscreen={false}
          onToggleFullscreen={toggleFullscreen}
          onPageJump={setCurrentPage}
          onBack={onBack}
          onDownload={() => {
            const link = document.createElement('a');
            link.href = pdfPath;
            link.download = `${title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          isPanMode={isPanMode}
          onTogglePanMode={() => setIsPanMode(v => !v)}
        />
      )}
      {!isFullscreen && (
        <ChapterMenu
          chapters={chapters}
          currentChapter={currentChapter}
          isOpen={isChapterMenuOpen}
          onToggle={() => setIsChapterMenuOpen(v => !v)}
          onChapterSelect={onChapterSelect}
          theme={theme}
          magnification={magnification}
          variant="overlay"
          showOverlayToggle={false}
        />
      )}
      <audio hidden ref={audioRef} />
      <BookContent
        magnification={magnification}
        pageMode={pageMode}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
        theme={theme}
        isChapterMenuOpen={isChapterMenuOpen}
        pdfPath={pdfPath}
        onDocumentLoadSuccess={onDocumentLoadSuccess}
        onDocumentLoadError={onDocumentLoadError}
        isFullscreen={isFullscreen}
        isPanMode={isPanMode}
        onToggleChapters={() => setIsChapterMenuOpen(v => !v)}
      />
    </div>
  );
}
