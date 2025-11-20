import { ChevronLeft, ChevronRight, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { toast } from 'sonner';
import { useUserHistory } from '@/hooks/useUserHistory';
import { FlipBookViewer } from '@/components/FlipBookViewer';

import BookHeader from '@/components/reader/BookHeader';
import ChapterMenu from '@/components/reader/ChapterMenu';
import { readerConfig, ReaderTheme } from '@/config/readerConfig';

try {
  (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
} catch { /* noop */ }

interface BookContentProps {
  magnification: number;
  pageMode: 'single' | 'double';
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  theme: ReaderTheme;
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
  // FlipBookViewer handles its own rendering and controls
  // We just pass the props

  // Map theme to 'light' | 'dark'
  const flipbookTheme = theme === 'dark' || theme === 'midnight' ? 'dark' : 'light';

  return (
    <div className={`flex-1 flex items-center justify-center transition-all duration-300 bg-gray-100 overflow-hidden`} role="main" aria-label="Book content">
      <div
        className={`reader-fixed-area flex items-center justify-center no-scrollbar w-full h-full`}
        style={(() => {
          const v = `${isFullscreen ? 0 : Math.max(0, headerHeight)}px`
          return { ['--reader-header' as unknown as string]: v } as React.CSSProperties
        })()}
      >
        {!isFullscreen && (
          <button
            onClick={onToggleChapters}
            className={`absolute left-4 top-4 z-20 size-10 rounded-full border flex items-center justify-center transition-all bg-white text-black hover:scale-105 shadow-sm`}
            title="Open chapter navigation (C)"
            aria-label="Open chapter navigation"
            aria-expanded={isChapterMenuOpen}
          >
            <MoreVertical className="size-5" />
          </button>
        )}

        <FlipBookViewer
          pdfPath={pdfPath}
          startPage={currentPage}
          onPageChange={onPageChange}
          theme={flipbookTheme}
          onLoadError={onDocumentLoadError}
          onLoadSuccess={() => {}}
        />
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
  const [magnification, setMagnification] = useState<number>(80);
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
  const [fitToPage, setFitToPage] = useState<boolean>(true);
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

  const onDocumentLoadSuccess = useCallback((pdf: PdfDoc) => {
    const n = pdf?._pdfInfo?.numPages || pdf?.numPages || 0;
    setTotalPages(n);
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
    try { toast.error('Failed to load PDF. You can try downloading it.'); } catch {}
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
    const shouldPan = !fitToPage && magnification >= 130;
    setIsPanMode(shouldPan);
  }, [magnification, fitToPage]);


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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
