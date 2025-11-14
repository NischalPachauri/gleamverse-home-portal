import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { useReadingProgress } from '@/hooks/useReadingProgress';
const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Moon, Sun, Maximize, Minimize, BookmarkPlus, BookmarkCheck, Layout, Columns, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { useLocalBookmarks } from "@/hooks/useLocalBookmarks";

// Configure PDF.js worker to use locally bundled worker for reliability
try {
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl as unknown as string;
  console.log('PDF.js worker configured:', workerUrl);
} catch (error) {
  console.error('Failed to configure PDF.js worker:', error);
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

try {
  const worker = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  pdfjs.GlobalWorkerOptions.workerPort = worker;
} catch {}

interface PDFReaderProps {
  pdfPath: string;
  title: string;
  author?: string;
  bookCoverSrc?: string;
  onBack?: () => void;
}

const extractFilename = (path: string) => {
  const last = path.split('/').pop() || path;
  return decodeURIComponent(last);
};

const validatePdfFilename = (filename: string) => {
  const hasPdfExt = /\.pdf$/i.test(filename);
  if (!hasPdfExt) return { ok: false, message: 'Filename must end with .pdf' };
  const validChars = /^[A-Za-z0-9 _().,-]+\.pdf$/;
  if (!validChars.test(filename)) return { ok: false, message: 'Unsupported characters in filename' };
  if (filename.length > 200) return { ok: false, message: 'Filename is too long' };
  return { ok: true };
};

const sanitizeDownloadTitle = (title: string) => {
  const base = title.replace(/[^A-Za-z0-9 _().,-]/g, ' ').replace(/\s+/g, ' ').trim();
  return `${base}.pdf`;
};

function isDomException(error: unknown): error is DOMException {
  return error instanceof DOMException;
}

export const PDFReader = ({ pdfPath, title, author, bookCoverSrc, onBack }: PDFReaderProps) => {
  // Normalize PDF path to handle renamed files
  const normalizedPdfPath = pdfPath.replace(/\s+/g, ' ').trim();
  console.log('PDFReader initialized with:', { pdfPath: normalizedPdfPath, title });
  
  // Debug PDF.js worker status
  console.log('PDF.js version:', pdfjs.version);
  console.log('PDF.js worker source:', pdfjs.GlobalWorkerOptions.workerSrc);
  
  // Test if PDF path is accessible
  const filename = extractFilename(normalizedPdfPath);
  const filenameCheck = validatePdfFilename(filename);
  const [preflightChecked, setPreflightChecked] = useState(false);
  useEffect(() => {
    setPreflightChecked(false);
    const check = async () => {
      if (!filenameCheck.ok) {
        const msg = `Filename doesn't match requirements: ${filenameCheck.message}`;
        setError(msg);
        setLoading(false);
        toast.error(msg);
        setPreflightChecked(true);
        return;
      }
      try {
        const res = await fetch(normalizedPdfPath, { method: 'HEAD' });
        const ct = res.headers.get('content-type') || '';
        const cl = res.headers.get('content-length');
        const size = cl ? parseInt(cl, 10) : NaN;
        if (!res.ok) {
          const msg = 'File not accessible. Please try again later.';
          setError(msg);
          setLoading(false);
          toast.error(msg);
        } else if (ct && !/pdf/i.test(ct)) {
          const msg = 'File is not a PDF based on server headers.';
          setError(msg);
          setLoading(false);
          toast.error(msg);
        } else if (!isNaN(size) && size <= 0) {
          const msg = 'File size is 0 bytes.';
          setError(msg);
          setLoading(false);
          toast.error(msg);
        }
      } catch (err) {
        
      } finally {
        setPreflightChecked(true);
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedPdfPath]);
  const { id } = useParams();
  const { updateProgress, getProgress } = useReadingProgress();
  const { updateBookmarkStatus, addBookmark, bookmarkedBooks, bookmarkStatuses } = useLocalBookmarks();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [nightMode, setNightMode] = useState<boolean>(false);
  // TTS removed per requirements
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isInLibrary, setIsInLibrary] = useState<boolean>(false);
  // Remove page turning state to avoid flicker
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Magnifier functionality
  const [magnifierActive, setMagnifierActive] = useState<boolean>(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [magnifierZoom, setMagnifierZoom] = useState<number>(2);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const optionsMemo = useMemo(() => ({
    cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    disableAutoFetch: true,
    disableStream: false,
    disableRange: false,
    rangeChunkSize: 65536,
    useSystemFonts: false,
    useWorkerFetch: true,
  }), []);
  
  // Handle magnifier activation
  const toggleMagnifier = () => {
    setMagnifierActive(!magnifierActive);
    toast.success(magnifierActive ? "Magnifier disabled" : "Magnifier enabled");
  };

  // Handle mouse movement for magnifier
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!magnifierActive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setMagnifierPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  // Preloaded pages for smoother transitions
  const [cachedPages, setCachedPages] = useState<Record<number, boolean>>({});
  
  // Enhanced transition management
  
  
  // Music controls moved to global persistent player

  // Enhanced error boundary with performance optimization
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', { numPages, pdfPath });
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    toast.success(`Document loaded! ${numPages} pages available.`);

    if (id) {
      const savedProgress = getProgress(id);
      if (savedProgress && savedProgress.currentPage > 1) {
        const left = savedProgress.currentPage % 2 === 0 ? savedProgress.currentPage - 1 : savedProgress.currentPage;
        setPageNumber(left);
      }
      updateProgress(id, savedProgress?.currentPage || 1, numPages);
    }
    
    // Preload first few pages for better initial performance
    requestAnimationFrame(() => {
      const pagesToPreload = Math.min(3, numPages);
      for (let i = 1; i <= pagesToPreload; i++) {
        setCachedPages(prev => ({...prev, [i]: true}));
      }
    });
  }, [pdfPath, id, getProgress, updateProgress]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error, 'PDF path:', normalizedPdfPath);
    let errorMessage = 'Failed to load PDF. Please try again.';
    
    // Provide more specific error messages based on error type
    if (error.message) {
      if (error.message.includes('Missing PDF')) {
        errorMessage = 'PDF file not found. The file may have been moved or deleted.';
      } else if (error.message.includes('Invalid PDF')) {
        errorMessage = 'Invalid PDF file. The file may be corrupted or not a valid PDF.';
      } else if (error.message.includes('Unexpected server response')) {
        errorMessage = 'Server error while loading PDF. Please try again later.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Cross-origin error. The PDF cannot be loaded due to security restrictions.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('worker')) {
        errorMessage = 'PDF worker error. There may be an issue with the PDF rendering engine.';
      } else {
        errorMessage = `PDF loading error: ${error.message}`;
      }
    }
    
    setError(errorMessage);
    setLoading(false);
    toast.error(errorMessage);
  }, [normalizedPdfPath]);
  const [twoPageMode, setTwoPageMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("twoPageMode");
    return stored ? stored === "true" : true;
  });
  // TTS removed per requirements
  const containerRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem("sessionId");
    if (!sid) {
      sid = Math.random().toString(36).substring(7);
      localStorage.setItem("sessionId", sid);
    }
    return sid;
  });

  const checkIfInLibrary = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("user_library")
      .select("id")
      .eq("book_id", id)
      .eq("user_session_id", sessionId)
      .single();
    
    setIsInLibrary(!!data);
  }, [id, sessionId]);

  useEffect(() => {
    checkIfInLibrary();
  }, [id, checkIfInLibrary]);

  const toggleLibrary = async () => {
    if (!id) return;

    if (isInLibrary) {
      await supabase
        .from("user_library")
        .delete()
        .eq("book_id", id)
        .eq("user_session_id", sessionId);
      toast.success("Removed from your library");
      setIsInLibrary(false);
    } else {
      await supabase
        .from("user_library")
        .insert({ book_id: id, user_session_id: sessionId });
      toast.success("Added to your library!");
      setIsInLibrary(true);
    }
  };


  // Enhanced preloading with frame rate optimization
  const preloadAdjacentPages = useCallback((currentPage: number) => {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      // Preload next and previous pages
      const pagesToPreload = [];
      if (currentPage > 1) pagesToPreload.push(currentPage - 1);
      if (currentPage < numPages) pagesToPreload.push(currentPage + 1);
      
      // For two-page mode, also preload the paired pages
      if (twoPageMode) {
        if (currentPage + 1 <= numPages) pagesToPreload.push(currentPage + 1);
        if (currentPage + 2 <= numPages) pagesToPreload.push(currentPage + 2);
        if (currentPage - 2 > 0) pagesToPreload.push(currentPage - 2);
      }
      
      // Mark these pages as cached
      pagesToPreload.forEach(page => {
        setCachedPages(prev => ({...prev, [page]: true}));
      });
    });
  }, [numPages, twoPageMode]);

  const goToPrevPage = () => {
    if (pageNumber <= 1) return;
    const newPageNumber = twoPageMode ? Math.max(pageNumber - 2, 1) : Math.max(pageNumber - 1, 1);
    const normalizedPage = twoPageMode && newPageNumber % 2 === 0 ? newPageNumber - 1 : newPageNumber;
    setPageNumber(normalizedPage);
    if (id) {
      updateProgress(id, normalizedPage, numPages);
      if (!bookmarkedBooks.includes(id)) addBookmark(id);
      if (normalizedPage >= numPages) {
        if (bookmarkStatuses[id] !== 'Completed') updateBookmarkStatus(id, 'Completed');
      } else if (normalizedPage > 1) {
        if (bookmarkStatuses[id] !== 'Reading') updateBookmarkStatus(id, 'Reading');
      }
    }
    preloadAdjacentPages(normalizedPage);
  };

  const goToNextPage = () => {
    if (pageNumber >= numPages) return;
    const newPageNumber = twoPageMode ? Math.min(pageNumber + 2, numPages) : Math.min(pageNumber + 1, numPages);
    const normalizedPage = twoPageMode && newPageNumber % 2 === 0 ? newPageNumber - 1 : newPageNumber;
    setPageNumber(normalizedPage);
    if (id) {
      updateProgress(id, normalizedPage, numPages);
      if (!bookmarkedBooks.includes(id)) addBookmark(id);
      if (normalizedPage >= numPages) {
        if (bookmarkStatuses[id] !== 'Completed') updateBookmarkStatus(id, 'Completed');
      } else if (normalizedPage > 1) {
        if (bookmarkStatuses[id] !== 'Reading') updateBookmarkStatus(id, 'Reading');
      }
    }
    preloadAdjacentPages(normalizedPage);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = sanitizeDownloadTitle(title);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  const toggleNightMode = () => {
    setNightMode(!nightMode);
    toast.success(nightMode ? "Day mode enabled" : "Night mode enabled");
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      setIsFullscreen(isFullscreenNow);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevPage();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextPage();
      } else if (event.key === 'Escape' && isFullscreen) {
        event.preventDefault();
        document.exitFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage, isFullscreen]);

  // Touch gesture navigation for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  // Auto-hide controls in fullscreen mode
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isFullscreen) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    if (isFullscreen) {
      showControlsTemporarily();
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isFullscreen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const minSwipeDistance = 50;

    // Check if horizontal swipe is longer than vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        goToPrevPage();
      } else {
        goToNextPage();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // No local audio cleanup needed

  // Test audio file accessibility
  // Local audio testing removed

  // Local audio context removed

  const toggleMode = () => {
    const next = !twoPageMode;
    setTwoPageMode(next);
    localStorage.setItem("twoPageMode", String(next));
    // Normalize left page when switching to two-page mode
    if (next && pageNumber % 2 === 0) {
      setPageNumber(pageNumber - 1);
    }
  };

  // Music control functions removed; use global music player

  // TTS removed per requirements

  // TTS removed per requirements

  // TTS removed per requirements

  // TTS removed per requirements

  // Persist reading position whenever page changes
  useEffect(() => {
    if (id && numPages > 0) {
      updateProgress(id, pageNumber, numPages);
    }
  }, [pageNumber, id, numPages, updateProgress]);

  // Show error state if PDF failed to load
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">PDF Loading Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex flex-col bg-background h-full ${isFullscreen ? 'fullscreen-active' : ''}`}>
      {/* Controls */}
      <div 
        className={`pdf-controls sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between gap-4 flex-wrap shadow-lg transition-all duration-300 ${
          isFullscreen ? 'fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm' : ''
        } ${
          isFullscreen && !showControls ? 'transform -translate-y-full opacity-0' : 'transform translate-y-0 opacity-100'
        }`}
        onMouseEnter={() => isFullscreen && showControlsTemporarily()}
        onMouseMove={() => isFullscreen && showControlsTemporarily()}
      >
        <div className="flex items-center gap-3 flex-1 min-w-[220px]">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} aria-label="Back to Library">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          )}
          {bookCoverSrc && (
            <img src={bookCoverSrc} alt={title} className="h-10 w-8 rounded shadow-md" />
          )}
          <div className="truncate">
            <div className="text-sm font-semibold truncate">{title}</div>
            {author && <div className="text-xs text-muted-foreground truncate">{author}</div>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            size="sm"
            variant="outline"
            className={isFullscreen ? 'text-white border-white/20 hover:bg-white/10' : ''}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className={`text-sm font-medium px-3 ${isFullscreen ? 'text-white' : ''}`}>
            Pages {pageNumber}{pageNumber + 1 <= numPages ? `–${pageNumber + 1}` : ""} of {numPages || "..."}
          </span>
          <Button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            size="sm"
            variant="outline"
            className={isFullscreen ? 'text-white border-white/20 hover:bg-white/10' : ''}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm font-medium">Go to:</span>
            <input
              type="text"
              min="1"
              max={numPages}
              value={pageNumber}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string for backspace support
                if (value === '') {
                  return;
                }
                const page = parseInt(value);
                if (!isNaN(page) && page >= 1 && page <= numPages) {
                  setPageNumber(page);
                }
              }}
              onKeyDown={(e) => {
                // Allow backspace to work normally
                if (e.key === 'Backspace') {
                  e.stopPropagation();
                }
              }}
              className="w-16 px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
              placeholder="Page"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 justify-center flex-1">
          <Button onClick={zoomOut} size="sm" variant="outline" disabled={scale <= 0.5} className={isFullscreen ? 'text-white border-white/20 hover:bg-white/10' : ''}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className={`text-sm min-w-[60px] text-center ${isFullscreen ? 'text-white' : 'text-muted-foreground'}`}>
            {Math.round(scale * 100)}%
          </span>
          <Button onClick={zoomIn} size="sm" variant="outline" disabled={scale >= 3} className={isFullscreen ? 'text-white border-white/20 hover:bg-white/10' : ''}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={toggleLibrary} 
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            {isInLibrary ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
            {isInLibrary ? "Saved" : "Save"}
          </Button>

          <Button 
            onClick={toggleNightMode} 
            size="sm" 
            variant="outline"
            className={`gap-2 ${isFullscreen ? 'text-white border-white/20 hover:bg-white/10' : ''}`}
          >
            {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* TTS control removed per requirements */}

          <Button 
            onClick={toggleFullscreen} 
            size="sm" 
            variant="outline"
            className={`gap-2 ${isFullscreen ? 'text-white border-white/20 hover:bg-white/10' : ''}`}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          {/* Music controls removed; use global music bar */}


          <Button onClick={handleDownload} size="sm" className={`bg-primary hover:bg-primary/90 gap-2 ${isFullscreen ? 'bg-white/20 hover:bg-white/30 text-white border-white/20' : ''}`}>
            <Download className="w-4 h-4" />
            Download
          </Button>

          <Button onClick={toggleMode} size="sm" variant="outline" className={`gap-2 ${isFullscreen ? 'text-white border-white/20 hover:bg-white/10' : ''}`}>
            {twoPageMode ? <Layout className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
            {twoPageMode ? "Two" : "Single"}
          </Button>
        </div>
      </div>

      {/* PDF Viewer - supports Single/Two-page. Duplicate text fix: text layer disabled. */}
      <div 
        className={`flex-1 overflow-auto transition-colors ${
          nightMode ? "bg-gray-900" : "bg-muted"
        } ${isFullscreen ? 'p-0' : 'p-2'}`}
        style={{ 
          maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 200px)',
          height: isFullscreen ? '100vh' : 'auto'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`flex flex-col items-center ${isFullscreen ? 'gap-0 fullscreen-pdf' : 'gap-1'}`}>
          
          <div className={isFullscreen ? 'fullscreen-pdf' : ''}>
            <Document
              file={normalizedPdfPath}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center p-12 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary animate-pulse"></div>
                  <p className="text-muted-foreground animate-pulse">Loading your book...</p>
                  <div className="text-xs text-muted-foreground opacity-70">Optimizing for smooth reading</div>
                </div>
              }
              options={optionsMemo}
            >
              {twoPageMode ? (
                <div className="two-page-spread" onMouseMove={handleMouseMove}>
                  {magnifierActive && (
                    <div 
                      className="magnifier" 
                      style={{
                        left: `${magnifierPosition.x}px`,
                        top: `${magnifierPosition.y}px`,
                        transform: `translate(-50%, -50%) scale(${magnifierZoom})`,
                        pointerEvents: 'none',
                        position: 'absolute',
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        border: '2px solid #333',
                        overflow: 'hidden',
                        zIndex: 100,
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                        background: 'white'
                      }}
                    >
                      <div 
                        style={{
                          transform: `translate(${-magnifierPosition.x * magnifierZoom + 75}px, ${-magnifierPosition.y * magnifierZoom + 75}px) scale(${magnifierZoom})`,
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        {/* This is a visual representation only - actual magnification happens via CSS */}
                      </div>
                    </div>
                  )}
                  <div className="pdf-page">
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className={`shadow-2xl ${nightMode ? "invert" : ""}`}
                      onRenderSuccess={() => {
                        setCachedPages(prev => ({...prev, [pageNumber]: true}));
                        setIsRendering(false);
                      }}
                      onRenderError={(error) => {
                        console.error('Page render error:', error);
                        setIsRendering(false);
                      }}
                      loading={<div className="animate-pulse bg-muted rounded" style={{width: '100%', height: '100%', minHeight: '400px'}} />}
                      error={<div className="flex items-center justify-center text-destructive bg-destructive/10 rounded p-4">Failed to render page</div>}
                    />
                  </div>
                  {pageNumber + 1 <= numPages && (
                    <div className="pdf-page">
                      <Page
                        pageNumber={pageNumber + 1}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className={`shadow-2xl ${nightMode ? "invert" : ""}`}
                        onRenderSuccess={() => {
                          setCachedPages(prev => ({...prev, [pageNumber]: true}));
                          setIsRendering(false);
                        }}
                        onRenderError={(error) => {
                          console.error('Page render error:', error);
                          setIsRendering(false);
                        }}
                        loading={<div className="animate-pulse bg-muted rounded" style={{width: '100%', height: '100%', minHeight: '400px'}} />}
                        error={<div className="flex items-center justify-center text-destructive bg-destructive/10 rounded p-4">Failed to render page</div>}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="single-page-container">
                  <div className="pdf-page">
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className={`shadow-2xl ${nightMode ? "invert" : ""}`}
                      onRenderSuccess={() => setIsRendering(false)}
                      onRenderError={(error) => {
                        console.error('Page render error:', error);
                        setIsRendering(false);
                      }}
                      loading={<div className="animate-pulse bg-muted rounded" style={{width: '100%', height: '100%', minHeight: '400px'}} />}
                      error={<div className="flex items-center justify-center text-destructive bg-destructive/10 rounded p-4">Failed to render page</div>}
                    />
                  </div>
                </div>
              )}
            </Document>
          </div>

          <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 0, width: 0, height: 0, overflow: 'hidden' }}>
            <Document file={normalizedPdfPath} options={optionsMemo}>
              {Object.keys(cachedPages)
                .map((p) => parseInt(p, 10))
                .filter((p) => p !== pageNumber && p !== pageNumber + 1)
                .slice(0, 4)
                .map((p) => (
                  <Page
                    key={`preload-${p}`}
                    pageNumber={p}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="preload-page"
                  />
                ))}
            </Document>
          </div>

          {error && (
            <div className="flex flex-col items-center justify-center p-12 gap-4 bg-red-50 border border-red-200 rounded-lg m-4">
              <div className="text-red-600 text-lg font-semibold">⚠️ PDF Loading Error</div>
              <p className="text-red-700 text-center max-w-md">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .two-page-spread {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          position: relative;
        }
        
        .single-page-container {
          position: relative;
          display: inline-block;
        }
        
        .pdf-page {
          margin-bottom: 0;
          padding-bottom: 0;
          max-height: 80vh;
          overflow: hidden;
          position: relative;
          will-change: transform, opacity;
          backface-visibility: hidden;
          contain: paint;
          transform: translateZ(0);
        }
        
        .pdf-page canvas {
          display: block;
          margin: 0 auto;
          max-height: 80vh;
          object-fit: contain;
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
        .react-pdf__Page {
          max-height: 80vh !important;
        }
        .react-pdf__Page__canvas {
          max-height: 80vh !important;
          height: auto !important;
        }
        /* Fullscreen styles with responsive design fixes */
        .fullscreen-active {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          background: #000;
          overflow: hidden;
        }
        .fullscreen-pdf {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fullscreen-pdf .pdf-page {
          max-height: calc(100vh - 120px);
          height: calc(100vh - 120px);
          width: auto;
          max-width: 100%;
          overflow: hidden;
        }
        .fullscreen-pdf .pdf-page canvas {
          max-height: calc(100vh - 120px);
          height: calc(100vh - 120px) !important;
          width: auto !important;
          max-width: 100%;
          object-fit: contain;
          margin: 0 auto;
          display: block;
        }
        .fullscreen-pdf .react-pdf__Page {
          max-height: calc(100vh - 120px);
          height: calc(100vh - 120px);
          width: auto;
          max-width: 100%;
        }
        .fullscreen-pdf .react-pdf__Page__canvas {
          max-height: calc(100vh - 120px);
          height: calc(100vh - 120px) !important;
          width: auto !important;
          max-width: 100%;
        }
        .fullscreen-pdf .two-page-spread {
          height: calc(100vh - 120px);
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 0 20px;
          width: 100%;
        }
        .fullscreen-pdf .two-page-spread .pdf-page {
          max-height: calc(100vh - 120px);
          height: calc(100vh - 120px);
          flex: 0 0 auto;
          max-width: calc(50% - 8px);
        }
        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .fullscreen-pdf .two-page-spread {
            flex-direction: column;
            gap: 8px;
            padding: 0 10px;
          }
          .fullscreen-pdf .two-page-spread .pdf-page {
            max-width: 100%;
            max-height: calc(50vh - 60px);
          }
          .fullscreen-pdf .two-page-spread .pdf-page canvas {
            max-height: calc(50vh - 60px);
            height: calc(50vh - 60px) !important;
          }
        }
        /* Tablet responsive styles */
        @media (max-width: 1024px) and (min-width: 769px) {
          .fullscreen-pdf .two-page-spread {
            gap: 12px;
            padding: 0 15px;
          }
          .fullscreen-pdf .two-page-spread .pdf-page {
            max-width: calc(50% - 6px);
          }
        }
        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .fullscreen-pdf .pdf-page canvas {
            touch-action: pan-y pinch-zoom;
            -webkit-user-select: none;
            user-select: none;
          }
        }
        /* High DPI display optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .fullscreen-pdf .pdf-page canvas {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }
        /* Landscape orientation adjustments */
        @media (orientation: landscape) and (max-width: 896px) {
          .fullscreen-pdf .two-page-spread {
            flex-direction: row;
            gap: 8px;
          }
          .fullscreen-pdf .two-page-spread .pdf-page {
            max-width: calc(50% - 4px);
            max-height: calc(100vh - 120px);
          }
        }
        /* Prevent horizontal overflow */
        .fullscreen-active * {
          max-width: 100vw;
          box-sizing: border-box;
        }
        /* Smooth transitions for fullscreen mode */
        .fullscreen-pdf,
        
        /* Mobile-first responsive controls */
        @media (max-width: 640px) {
          .pdf-controls {
            padding: 8px;
            gap: 8px;
          }
          .pdf-controls .flex {
            gap: 4px;
          }
          .pdf-controls button {
            padding: 6px 8px;
            font-size: 12px;
          }
          .pdf-controls button svg {
            width: 14px;
            height: 14px;
          }
        }
        /* Prevent text selection during swipe */
        .fullscreen-pdf {
          -webkit-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
        /* Improve touch target size on mobile */
        @media (hover: none) and (pointer: coarse) {
          .pdf-controls button {
            min-height: 44px;
            min-width: 44px;
          }
        }
        /* Dark mode support for fullscreen */
        .fullscreen-active[data-theme="dark"] {
          background: #0a0a0a;
        }
        /* Loading state improvements */
        .fullscreen-pdf .react-pdf__Document {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 120px);
        }
        .preload-page {
          visibility: hidden;
          width: 0 !important;
          height: 0 !important;
        }
      `}} />
    </div>
  );
};
