import { ChevronLeft, ChevronRight, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from '@/config/pdfConfig'; // Import configured pdfjs
import { toast } from 'sonner';
import { useUserHistory } from '@/hooks/useUserHistory';

import { cn } from '@/lib/utils';
import BookHeader from '@/components/reader/BookHeader';
import ChapterMenu from '@/components/reader/ChapterMenu';
import { readerConfig, ReaderTheme } from '@/config/readerConfig';
import { installErrorMonitor } from '@/utils/errorMonitor';

interface BookContentProps {
  pageMode: 'single' | 'double';
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  theme: ReaderTheme;
  isChapterMenuOpen: boolean;
  pdfPath: string;
  onDocumentLoadSuccess: (pageCount: number) => void;
  onDocumentLoadError: (error: Error) => void;
  isFullscreen?: boolean;
  isPanMode: boolean;
  onToggleChapters: () => void;
  headerHeight: number;
}

export function BookContent({
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
  headerHeight,
}: BookContentProps) {
  const currentTheme = readerConfig.themes[theme];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  useLayoutEffect(() => {
    const measure = () => {
      const w = containerRef.current?.clientWidth || 0;
      const h = containerRef.current?.clientHeight || 0;
      setContainerWidth(w);
      setContainerHeight(h);
    };
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Calculate page width and height to fit screen properly
  const { pageWidth, pageHeight } = (() => {
    // Zero padding for all modes as requested
    const padding = 0;
    const availableWidth = Math.max(300, containerWidth - padding);
    const availableHeight = Math.max(400, containerHeight - padding);

    // Determine if container is landscape (wide) or portrait (tall)
    const isLandscape = availableWidth > availableHeight;

    if (pageMode === 'double') {
      // For double page on landscape screen, height is the limiting factor
      // We return undefined width to let react-pdf scale based on height
      return { pageWidth: undefined, pageHeight: availableHeight };
    } else {
      // For single page
      if (isLandscape) {
        // Fit to height on landscape screen
        return { pageWidth: undefined, pageHeight: availableHeight };
      } else {
        // Fit to width on portrait screen (e.g. mobile)
        const width = Math.floor(availableWidth * 0.95);
        return { pageWidth: width, pageHeight: undefined };
      }
    }
  })();

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const goPrev = () => {
    const step = pageMode === 'double' ? 2 : 1;
    onPageChange(Math.max(1, currentPage - step));
  };
  const goNext = () => {
    const step = pageMode === 'double' ? 2 : 1;
    onPageChange(Math.min(totalPages, currentPage + step));
  };

  // Keyboard navigation with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoPrev) {
        goPrev();
      } else if (e.key === 'ArrowRight' && canGoNext) {
        goNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, pageMode, canGoPrev, canGoNext]);

  // Memoize options to prevent unnecessary reloads
  const options = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@5.4.296/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@5.4.296/standard_fonts/',
  }), []);

  return (
    <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${currentTheme.bg} antialiased overflow-hidden`} role="main" aria-label="Book content">
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center w-full"
        style={(() => {
          const v = `${isFullscreen ? 0 : Math.max(0, headerHeight)}px`
          return { ['--reader-header' as unknown as string]: v } as React.CSSProperties
        })()}
      >
        {!isFullscreen && (
          <button
            onClick={onToggleChapters}
            className={`absolute left-4 top-4 z-30 size-11 rounded-full flex items-center justify-center transition-all ${currentTheme.ui.buttonGlass} shadow-lg hover:scale-105`}
            title="Open chapter navigation (C)"
            aria-label="Open chapter navigation"
            aria-expanded={isChapterMenuOpen}
          >
            <MoreVertical className="size-5" />
          </button>
        )}

        <div className={`relative flex items-center justify-center gap-6 px-4 w-full`}
          aria-live="polite"
        >
          <Document
            file={pdfPath}
            loading={<div className="flex flex-col items-center gap-3 text-slate-600">
              <Loader2 className="size-8 animate-spin" />
              <p>Loading PDF...</p>
            </div>}
            error={<div className="flex flex-col items-center gap-3 text-red-600">
              <p className="text-lg font-semibold">Failed to load PDF</p>
              <p className="text-sm">Please try downloading the file or refresh the page</p>
            </div>}
            onLoadSuccess={(doc) => {
              const count = (doc as unknown as { numPages: number }).numPages || 0;
              onDocumentLoadSuccess(count);
            }}
            onLoadError={(error) => {
              console.error('PDF load error:', error);
              onDocumentLoadError(error);
            }}
            options={options}
          >
            {pageMode === 'single' || (pageMode === 'double' && currentPage === totalPages && totalPages % 2 !== 0) ? (
              <Page
                pageNumber={Math.max(1, Math.min(totalPages || currentPage, currentPage))}
                width={pageWidth}
                height={pageHeight}
                renderMode="canvas"
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="size-4 animate-spin" />
                  Rendering page...
                </div>}
              />
            ) : (
              <div className="flex items-start justify-center gap-0 relative">
                {/* Left page */}
                <div className="shadow-2xl">
                  <Page
                    pageNumber={Math.max(1, Math.min(totalPages || currentPage, currentPage))}
                    width={pageWidth}
                    height={pageHeight}
                    renderMode="canvas"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={<div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="size-4 animate-spin" />
                    </div>}
                  />
                </div>
                {/* Binding shadow */}
                <div className="w-1 bg-gradient-to-r from-black/30 via-black/10 to-transparent absolute left-1/2 -translate-x-1/2 h-full z-10"></div>
                {/* Right page - only show if it exists */}
                {currentPage + 1 <= totalPages ? (
                  <div className="shadow-2xl">
                    <Page
                      pageNumber={currentPage + 1}
                      width={pageWidth}
                      height={pageHeight}
                      renderMode="canvas"
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={<div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="size-4 animate-spin" />
                      </div>}
                    />
                  </div>
                ) : null}
              </div>
            )}
          </Document>

          {/* Navigation arrows - positioned slightly above center */}
          <button
            onClick={goPrev}
            disabled={!canGoPrev}
            className={`absolute left-2 sm:left-4 z-30 -translate-y-[20px] top-1/2 size-12 rounded-full flex items-center justify-center ${currentTheme.ui.buttonGlass} shadow-xl transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100`}
            aria-label="Previous page (Left Arrow)"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className={`absolute right-2 sm:right-4 z-30 -translate-y-[20px] top-1/2 size-12 rounded-full flex items-center justify-center ${currentTheme.ui.buttonGlass} shadow-xl transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100`}
            aria-label="Next page (Right Arrow)"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      </div >
    </div >
  );
}

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
  const [pageMode, setPageMode] = useState<'single' | 'double'>(('' + (typeof localStorage !== 'undefined' ? localStorage.getItem('readerPageMode') : '')) === 'single' ? 'single' : 'double');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [theme, setTheme] = useState<ReaderTheme>(() => {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem('readerTheme') : null;
    return (t && readerConfig.themes[t as ReaderTheme]) ? (t as ReaderTheme) : 'light';
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState<boolean>(false);
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [chapters, setChapters] = useState<{ id: number; title: string; page: number }[]>([]);
  const [backgroundMusic, setBackgroundMusic] = useState<string>('none');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const headerWrapperRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const { updateProgress, getProgress, history } = useUserHistory();
  const progressDebounceRef = useRef<number | null>(null);

  const setPageSafely = useCallback((page: number) => {
    const total = totalPages || 0;
    const target = Math.max(1, Math.min(total || page, page));
    setCurrentPage(target);
  }, [totalPages]);


  const onDocumentLoadSuccess = useCallback(async (pageCount: number) => {
    setTotalPages(pageCount);

    // Try to extract real chapter names from PDF outline
    try {
      // Load the PDF to access its outline
      const loadingTask = pdfjs.getDocument(pdfPath);
      const pdf = await loadingTask.promise;
      const outline = await pdf.getOutline();

      if (outline && outline.length > 0) {
        // Extract chapters from PDF outline
        const extractedChapters: { id: number; title: string; page: number }[] = [];
        let id = 1;

        for (const item of outline) {
          try {
            const it = item as { dest?: unknown; title?: string };
            const dest = await (it.dest as unknown);
            let pageIndex = 0;

            if (typeof dest === 'string') {
              const destination = await pdf.getDestination(dest);
              if (destination && destination[0]) {
                pageIndex = await pdf.getPageIndex(destination[0]);
              }
            } else if (Array.isArray(dest) && dest[0]) {
              pageIndex = await pdf.getPageIndex(dest[0]);
            }

            extractedChapters.push({
              id,
              title: it.title || `Chapter ${id}`,
              page: pageIndex + 1,
            });
            id++;

            // Limit to reasonable number of chapters
            if (id > 50) break;
          } catch (e) {
            console.warn('Error extracting chapter:', e);
          }
        }

        if (extractedChapters.length > 0) {
          setChapters(extractedChapters);
          console.log('Extracted chapters from PDF outline:', extractedChapters);
          return;
        }
      }
    } catch (e) {
      console.warn('Error loading PDF outline, falling back to generated chapters:', e);
    }

    // Fallback: Generate generic chapters if outline extraction fails
    const out: { id: number; title: string; page: number }[] = [];
    const step = Math.max(10, Math.floor(pageCount / 10));
    let id = 1;
    for (let p = 1; p <= pageCount; p += step) {
      out.push({ id, title: `Section ${id}`, page: p });
      id++;
    }
    setChapters(out);
  }, [pdfPath]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setTotalPages(0);
    try { toast.error('Failed to load PDF. You can try downloading it.'); } catch { void 0; }
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
    try { localStorage.setItem('readerTheme', theme); } catch (err) { console.warn('Theme persist failed', err); }
  }, [theme]);

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
    audio.volume = 0.25; // Increased volume
    audio.play().catch(() => { });
  }, [backgroundMusic]);



  useEffect(() => {
    try { installErrorMonitor(); } catch (_err) { void 0; }
  }, []);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'f') toggleFullscreen();
      if (key === 'h') setIsPanMode(v => !v);
      if (key === 'c') setIsChapterMenuOpen(v => !v);
      if (key === 'd') setPageMode(m => (m === 'single' ? 'double' : 'single'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [totalPages, pageMode]);

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
  }, [bookId, pageMode]);

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
    <div className={`fixed inset-0 flex flex-col overflow-hidden transition-colors duration-300 ${readerConfig.themes[theme].bg}`}>
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
            onPageModeChange={(mode) => {
              setPageMode(mode);
              try { localStorage.setItem('readerPageMode', mode); } catch (err) { console.warn('Page mode persist failed', err); }
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            backgroundMusic={backgroundMusic}
            onBackgroundMusicChange={setBackgroundMusic}
            isFullscreen={isFullscreen}
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
      <div className="flex-1 relative overflow-hidden" style={(() => {
        const v = `${isFullscreen ? 0 : Math.max(0, headerHeight)}px`
        return { ['--reader-header' as unknown as string]: v } as React.CSSProperties
      })()}>
        <BookContent
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
          headerHeight={headerHeight}
        />
      </div>
    </div>
  );
}

export default PDFReader;
