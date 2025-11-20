import { ChevronLeft, ChevronRight, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { toast } from 'sonner';
import { useUserHistory } from '@/hooks/useUserHistory';

import BookHeader from '@/components/reader/BookHeader';
import ChapterMenu from '@/components/reader/ChapterMenu';
import { readerConfig, ReaderTheme } from '@/config/readerConfig';
import { installErrorMonitor } from '@/utils/errorMonitor';

try {
  (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
} catch { /* noop */ }

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

  useLayoutEffect(() => {
    const measure = () => {
      const w = containerRef.current?.clientWidth || 0;
      setContainerWidth(w);
    };
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Calculate page width to fit screen
  const pageWidth = (() => {
    if (pageMode === 'double') {
      // For double page, each page takes ~48% of container width with gap between them
      return Math.max(300, Math.floor(containerWidth * 0.48));
    } else {
      // For single page, take 95% of container width
      return Math.max(400, Math.floor(containerWidth * 0.95));
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

  return (
    <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${currentTheme.bg} antialiased overflow-hidden`} role="main" aria-label="Book content">
      <div
        ref={containerRef}
        className={`reader-fixed-area relative flex items-center justify-center no-scrollbar w-full h-full`}
        style={(() => {
          const v = `${isFullscreen ? 0 : Math.max(0, headerHeight)}px`
          return { ['--reader-header' as unknown as string]: v } as React.CSSProperties
        })()}
      >
        {!isFullscreen && (
          <button
            onClick={onToggleChapters}
            className={`absolute left-4 top-4 z-30 size-10 rounded-full border flex items-center justify-center transition-all bg-white text-black hover:scale-105 shadow-sm`}
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
            loading={<div className="flex items-center gap-2 text-slate-500"><Loader2 className="size-4 animate-spin" /> Loading PDF…</div>}
            onLoadSuccess={(doc) => {
              const count = (doc as unknown as { numPages: number }).numPages || 0;
              onDocumentLoadSuccess(count);
            }}
            onLoadError={onDocumentLoadError}
          >
            {pageMode === 'single' ? (
              <Page
                pageNumber={Math.max(1, Math.min(totalPages || currentPage, currentPage))}
                width={pageWidth}
                renderMode="canvas"
              />
            ) : (
              <div className="flex items-start justify-center gap-6">
                <Page
                  pageNumber={Math.max(1, Math.min(totalPages || currentPage, currentPage))}
                  width={pageWidth}
                  renderMode="canvas"
                />
                {currentPage + 1 <= totalPages && (
                  <Page
                    pageNumber={currentPage + 1}
                    width={pageWidth}
                    renderMode="canvas"
                  />
                )}
              </div>
            )}
          </Document>

          {/* Navigation arrows - positioned slightly above center */}
          <button
            onClick={goPrev}
            disabled={!canGoPrev}
            className={`absolute left-2 sm:left-4 z-30 -translate-y-[20px] top-1/2 size-10 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20 text-white shadow-md border border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className={`absolute right-2 sm:right-4 z-30 -translate-y-[20px] top-1/2 size-10 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20 text-white shadow-md border border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Next page"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
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
      <div className="reader-fixed-area" style={(() => {
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
