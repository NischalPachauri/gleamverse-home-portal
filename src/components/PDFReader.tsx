import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { TurnFlipReader } from '@/components/reader/turn_flip_reader';
import { useUserHistory } from '@/hooks/useUserHistory';

import BookHeader from '@/components/reader/BookHeader';
import ChapterMenu from '@/components/reader/ChapterMenu';

try {
  (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
} catch { /* noop */ }

interface BookContentProps {
  magnification: number;
  pageMode: 'single' | 'double';
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  theme: 'light' | 'sepia' | 'dark';
  isChapterMenuOpen: boolean;
  pdfPath: string;
  onDocumentLoadSuccess: (pdf: unknown) => void;
  onDocumentLoadError: (error: Error) => void;
  isFullscreen?: boolean;
  isPanMode: boolean;
  onToggleChapters: () => void;
  fitToPage: boolean;
  headerHeight: number;
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
  fitToPage,
  headerHeight,
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
    light: 'bg-white', 
    sepia: 'bg-amber-50', 
    dark: 'bg-slate-900' 
  } as const;

  const containerBg = { 
    light: 'bg-gradient-to-b from-blue-50 to-indigo-50', 
    sepia: 'bg-gradient-to-b from-amber-50 to-yellow-50', 
    dark: 'bg-gradient-to-b from-slate-900 to-slate-950' 
  } as const;

  const textColor = {
    light: 'text-gray-900',
    sepia: 'text-amber-950',
    dark: 'text-gray-100'
  } as const;

  // Calculate page width: fit-to-page initially; magnification when disabled
  useEffect(() => {
    const base = 700;
    if (fitToPage) {
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
      const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
      const height = Math.max(300, containerHeight - Math.max(0, headerHeight));
      const widthFromHeight = Math.max(300, Math.floor(height / pageRatio));
      const cappedWidth = Math.min(widthFromHeight, pageMode === 'double' ? Math.floor(containerWidth / 2) : containerWidth);
      setPageWidth(cappedWidth);
    } else {
      const width = Math.max(300, Math.round(base * (magnification / 100)));
      setPageWidth(width);
    }
    setShowArrows(true);
    console.debug('BookContent sizing', { fitToPage, magnification, pageMode, headerHeight, pageWidthCandidate: pageMode === 'double' ? Math.floor((containerRef.current?.clientWidth || window.innerWidth) / 2) : (containerRef.current?.clientWidth || window.innerWidth) });
  }, [fitToPage, magnification, pageMode, pageRatio, headerHeight]);

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
  const onPointerDown = (_e: React.PointerEvent<HTMLDivElement>) => {};

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
        try { containerRef.current.releasePointerCapture(pointerIdRef.current); } catch (e) { console.warn('Release pointer capture failed', e); }
      }
    }
    pointerIdRef.current = null;
  };

  const onWheel = (_e: React.WheelEvent<HTMLDivElement>) => {};

  return (
    <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${containerBg[theme]} overflow-hidden`} role="main" aria-label="Book content">
      <div
        ref={containerRef}
        className={`reader-fixed-area flex items-center justify-center no-scrollbar`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onWheel={onWheel}
        style={(() => {
          const v = `${isFullscreen ? 0 : Math.max(0, headerHeight)}px`
          return { ['--reader-header' as unknown as string]: v } as React.CSSProperties
        })()}
      >
        {!isFullscreen && (
          <button
            onClick={onToggleChapters}
            className={`absolute left-4 top-4 z-20 size-10 rounded-full border-2 flex items-center justify-center transition-all ${
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
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 size-14 p-0 rounded-full transition-all opacity-95 ${
                theme === 'light' ? 'bg-blue-600 text-white ring-2 ring-white/70 hover:bg-blue-700' : 
                theme === 'sepia' ? 'bg-amber-700 text-amber-50 ring-2 ring-amber-200 hover:bg-amber-800' : 
                'bg-indigo-600 text-white ring-2 ring-slate-200/50 hover:bg-indigo-700'
              } disabled:opacity-50`}
            >
              <ChevronLeft className="size-7" />
            </Button>

            <Button 
              aria-label="Next page" 
              variant="ghost" 
              size="lg" 
              onClick={nextPage} 
              disabled={currentPage >= totalPages} 
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 size-14 p-0 rounded-full transition-all opacity-95 ${
                theme === 'light' ? 'bg-blue-600 text-white ring-2 ring-white/70 hover:bg-blue-700' : 
                theme === 'sepia' ? 'bg-amber-700 text-amber-50 ring-2 ring-amber-200 hover:bg-amber-800' : 
                'bg-indigo-600 text-white ring-2 ring-slate-200/50 hover:bg-indigo-700'
              } disabled:opacity-50`}
            >
              <ChevronRight className="size-7" />
            </Button>
          </>
        )}

        {/* Book Pages Container */}
        <div className={`gap-0 py-0 px-0 flex ${isFullscreen ? 'items-stretch justify-between' : 'items-center justify-center'}`}>
          {pageMode === 'double' ? (
            <TurnFlipReader
              pdfPath={pdfPath}
              currentPage={currentPage}
              totalPages={totalPages}
              pageWidth={pageWidth}
              theme={theme}
              onPageChange={onPageChange}
              isFullscreen={isFullscreen}
              onDocumentLoadSuccess={onDocumentLoadSuccess}
              onDocumentLoadError={onDocumentLoadError}
            />
          ) : (
            /* Single Page */
            <div 
              className={`${pageBackground[theme]} rounded-none p-0 transition-all duration-300`}
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
                  onLoadSuccess={(p: { getViewport: (opts: { scale: number }) => { width: number; height: number } }) => { try { const vp = p.getViewport({ scale: 1 }); setPageRatio(vp.height / vp.width); } catch (e) { console.warn('Viewport calc failed', e); } }}
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          )}
        </div>

        {/* Preload adjacent pages to warm cache and reduce transition delay */}
        <div className="sr-only select-none" aria-hidden="true">
          <Document file={pdfPath}><Page pageNumber={Math.max(1, currentPage - 1)} width={pageWidth} renderTextLayer={false} renderAnnotationLayer={false} /></Document>
          <Document file={pdfPath}><Page pageNumber={Math.min(totalPages, (pageMode === 'double' ? currentPage + 2 : currentPage + 1))} width={pageWidth} renderTextLayer={false} renderAnnotationLayer={false} /></Document>
        </div>

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
  bookId?: string;
}

type PdfDoc = {
  _pdfInfo?: { numPages?: number };
  numPages?: number;
  getOutline?: () => Promise<unknown[]>;
  getPageIndex?: (ref: unknown) => Promise<number>;
  getDestination?: (s: string) => Promise<unknown>;
};

export function PDFReader({ pdfPath, title, author, bookCoverSrc, onBack, bookId }: PDFReaderProps) {
  const [magnification, setMagnification] = useState<number>(80);
  const [pageMode, setPageMode] = useState<'single' | 'double'>(('' + (typeof localStorage !== 'undefined' ? localStorage.getItem('readerPageMode') : '')) === 'single' ? 'single' : 'double');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState<boolean>(false);
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [chapters, setChapters] = useState<{ id: number; title: string; page: number }[]>([]);
  const [backgroundMusic, setBackgroundMusic] = useState<string>('none');
  const [fitToPage, setFitToPage] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const headerWrapperRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const { updateProgress, getProgress, history } = useUserHistory();
  const progressDebounceRef = useRef<number | null>(null);
  
  const setPageSafely = useCallback((page: number) => {
    const total = totalPages || 0;
    let target = Math.max(1, Math.min(total || page, page));
    if (pageMode === 'double' && target % 2 === 0) target = target - 1;
    setCurrentPage(target);
  }, [totalPages, pageMode]);

  useEffect(() => {
    try { localStorage.setItem('readerPageMode', pageMode) } catch { /* noop */ }
  }, [pageMode])

  const onPageModeChange = useCallback((mode: 'single' | 'double') => {
    setPageMode(mode)
    setCurrentPage(prev => {
      const total = totalPages || 0
      let target = Math.max(1, Math.min(total || prev, prev))
      if (mode === 'double' && target % 2 === 0) target = target - 1
      return target
    })
  }, [totalPages])

  const onDocumentLoadSuccess = useCallback((pdf: PdfDoc) => {
    const n = pdf?._pdfInfo?.numPages || pdf?.numPages || 0;
    setTotalPages(n);
    setCurrentPage((prev) => (pageMode === 'double' && prev % 2 === 0 ? prev - 1 : prev));
    (async () => {
      try {
        const outline = await pdf.getOutline?.();
        const collected: { id: number; title: string; page: number }[] = [];
        let id = 1;
        const pushItem = async (item: Record<string, unknown>) => {
          const title = (item?.title as string) || `Chapter ${id}`;
          let pageNum: number | null = null;
          const src = (item as Record<string, unknown>);
          const dest = src.dest || src.destRef || src.url || null;
          try {
            if (Array.isArray(dest) && dest[0]) {
              const pageIndex = await pdf.getPageIndex?.(dest[0] as unknown) as number;
              pageNum = pageIndex + 1;
            } else if (typeof dest === 'string' && pdf.getDestination) {
              const d = await pdf.getDestination(dest);
              if (Array.isArray(d) && d[0]) {
                const pageIndex = await pdf.getPageIndex?.(d[0] as unknown) as number;
                pageNum = pageIndex + 1;
              }
            }
          } catch (e) { console.warn('Outline item resolution failed', e); }
          if (pageNum) {
            collected.push({ id, title, page: pageNum });
            id++;
          }
          const children = src.items as unknown[] | undefined;
          if (Array.isArray(children)) {
            for (const child of children) {
              await pushItem(child as Record<string, unknown>);
            }
          }
        };
        if (Array.isArray(outline) && outline.length) {
          for (const item of outline) {
            await pushItem(item as Record<string, unknown>);
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
      const elem = document.documentElement as Element & { webkitRequestFullscreen?: () => Promise<void> };
      const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> };
      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn('Fullscreen not supported or blocked:', e);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      const d = document as Document & { webkitFullscreenElement?: Element };
      const active = !!(document.fullscreenElement || d.webkitFullscreenElement);
      setIsFullscreen(active);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange as EventListener);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange as EventListener);
    };
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const h = headerWrapperRef.current?.offsetHeight || 72;
      setHeaderHeight(h);
      console.debug('Reader header measured height:', h);
    };
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
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
    const shouldPan = !fitToPage && magnification >= 130;
    setIsPanMode(shouldPan);
  }, [magnification, fitToPage]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPageSafely(pageMode === 'double' ? currentPage + 2 : currentPage + 1);
      if (e.key === 'ArrowLeft') setPageSafely(pageMode === 'double' ? currentPage - 2 : currentPage - 1);
      if (e.key.toLowerCase() === 'f') toggleFullscreen();
      if (e.key.toLowerCase() === 'd') setPageMode(m => (m === 'single' ? 'double' : 'single'));
      if (e.key.toLowerCase() === 'h') setIsPanMode(v => !v);
      if (e.key.toLowerCase() === 't') setTheme(t => (t === 'light' ? 'dark' : t === 'dark' ? 'sepia' : 'light'));
      if (e.key.toLowerCase() === 'c') setIsChapterMenuOpen(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [totalPages, pageMode, currentPage, setPageSafely]);

  useEffect(() => {
    if (!bookId) return;
    if (totalPages > 0 && currentPage >= 1) {
      if (progressDebounceRef.current) window.clearTimeout(progressDebounceRef.current);
      progressDebounceRef.current = window.setTimeout(() => {
        updateProgress(bookId, currentPage, totalPages);
      }, 400);
    }
    return () => {
      if (progressDebounceRef.current) {
        window.clearTimeout(progressDebounceRef.current);
        progressDebounceRef.current = null;
      }
    };
  }, [bookId, currentPage, totalPages, updateProgress]);

  // Initialize current page from Supabase/user history
  useEffect(() => {
    if (!bookId) return;
    const progress = getProgress(bookId);
    const cp = progress.currentPage || 0;
    if (cp > 0) {
      const normalized = pageMode === 'double' && cp % 2 === 0 ? cp - 1 : cp;
      setCurrentPage(normalized);
    }
  }, [bookId, pageMode, history, getProgress]);

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
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {!isFullscreen && (
        <div
          ref={headerWrapperRef}
          className="sticky top-0 z-30"
        >
          <BookHeader
          bookInfo={{ title, author: author || '' }}
          bookCoverSrc={bookCoverSrc}
          theme={theme}
          onThemeChange={setTheme}
          pageMode={pageMode}
          onPageModeChange={onPageModeChange}
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
          onPageJump={setPageSafely}
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
        </div>
      )}
      {!isFullscreen && (
        <ChapterMenu
          chapters={chapters}
          currentChapter={currentChapter}
          isOpen={isChapterMenuOpen}
          onToggle={() => setIsChapterMenuOpen(v => !v)}
          onChapterSelect={onChapterSelect}
          theme={theme}
          magnification={100}
          variant="overlay"
          showOverlayToggle={false}
        />
      )}
      <audio hidden ref={audioRef} />
      <div className="reader-fixed-area" style={(() => {
        const v = `${isFullscreen ? 0 : Math.max(0, headerHeight)}px`
        return { ['--reader-header' as unknown as string]: v } as React.CSSProperties
      })()}>
        <BookContent
          magnification={magnification}
          pageMode={pageMode}
          currentPage={currentPage}
          onPageChange={setPageSafely}
          totalPages={totalPages}
          theme={theme}
          isChapterMenuOpen={isChapterMenuOpen}
          pdfPath={pdfPath}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          onDocumentLoadError={onDocumentLoadError}
          isFullscreen={isFullscreen}
          isPanMode={isPanMode}
          onToggleChapters={() => setIsChapterMenuOpen(v => !v)}
          fitToPage={fitToPage}
          headerHeight={headerHeight}
        />
      </div>
    </div>
  );
}
