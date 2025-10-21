import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
// Use a same-origin worker URL to avoid cross-origin/module worker issues
// Vite will bundle this and return a URL string
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite query suffix not typed
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Moon, Sun, Maximize, Minimize, BookmarkPlus, BookmarkCheck, Layout, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

// Configure PDF.js worker to use locally bundled worker for reliability
try {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl as unknown as string;
  console.log('PDF.js worker configured:', pdfWorkerUrl);
} catch (error) {
  console.error('Failed to configure PDF.js worker:', error);
  // Fallback to CDN
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFReaderProps {
  pdfPath: string;
  title: string;
}

export const PDFReader = ({ pdfPath, title }: PDFReaderProps) => {
  console.log('PDFReader initialized with:', { pdfPath, title });
  const { id } = useParams();
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

  // Add error boundary for PDF loading
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', { numPages, pdfPath });
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    toast.success(`Document loaded! ${numPages} pages available.`);
  }, [pdfPath]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error, 'PDF path:', pdfPath);
    setError('Failed to load PDF. Please try again.');
    setLoading(false);
    toast.error("Failed to load PDF. Please try again.");
  }, [pdfPath]);
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

  const restoreLastPosition = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("user_library")
      .select("current_page")
      .eq("book_id", id)
      .eq("user_session_id", sessionId)
      .maybeSingle();

    if (!error && data?.current_page && data.current_page > 0) {
      // Ensure left page is odd for two-page spread
      const left = data.current_page % 2 === 0 ? data.current_page - 1 : data.current_page;
      setPageNumber(left);
    }
  }, [id, sessionId]);

  useEffect(() => {
    checkIfInLibrary();
    // Restore last read page for this book
    restoreLastPosition();
  }, [id, checkIfInLibrary, restoreLastPosition]);

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


  const goToPrevPage = () => {
    if (pageNumber <= 1) return;
    setPageNumber((prev) => {
        if (twoPageMode) {
          const nextPage = Math.max(prev - 2, 1);
          return nextPage % 2 === 0 ? nextPage - 1 : nextPage;
        }
        return Math.max(prev - 1, 1);
      });
  };

  const goToNextPage = () => {
    if (pageNumber >= numPages) return;
    setPageNumber((prev) => {
        if (twoPageMode) {
          const nextLeft = Math.min(prev + 2, numPages);
          return nextLeft % 2 === 0 ? nextLeft - 1 : nextLeft;
        }
        return Math.min(prev + 1, numPages);
      });
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = `${title}.pdf`;
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
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleMode = () => {
    const next = !twoPageMode;
    setTwoPageMode(next);
    localStorage.setItem("twoPageMode", String(next));
    // Normalize left page when switching to two-page mode
    if (next && pageNumber % 2 === 0) {
      setPageNumber(pageNumber - 1);
    }
  };

  // TTS removed per requirements

  // TTS removed per requirements

  // TTS removed per requirements

  // TTS removed per requirements

  // Persist reading position whenever page changes
  useEffect(() => {
    const persist = async () => {
      if (!id) return;
      const now = new Date().toISOString();
      // Save the left page of the spread
      await supabase
        .from("user_library")
        .upsert({
          book_id: id,
          user_session_id: sessionId,
          current_page: pageNumber,
          last_read_at: now,
        }, { onConflict: "book_id,user_session_id" });
    };
    persist();
    // We intentionally do not handle errors here; silent best-effort persistence
  }, [pageNumber, id, sessionId]);

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
    <div ref={containerRef} className="flex flex-col h-full bg-background">
      {/* Controls */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between gap-4 flex-wrap shadow-lg">
        <div className="flex items-center gap-2">
          <Button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-3">
            Pages {pageNumber}{pageNumber + 1 <= numPages ? `–${pageNumber + 1}` : ""} of {numPages || "..."}
          </span>
          <Button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            size="sm"
            variant="outline"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-center flex-1">
          <Button onClick={zoomOut} size="sm" variant="outline">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-2">{Math.round(scale * 100)}%</span>
          <Button onClick={zoomIn} size="sm" variant="outline">
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
            className="gap-2"
          >
            {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* TTS control removed per requirements */}

          <Button 
            onClick={toggleFullscreen} 
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          <Button onClick={handleDownload} size="sm" className="bg-primary hover:bg-primary/90 gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>

          <Button onClick={toggleMode} size="sm" variant="outline" className="gap-2">
            {twoPageMode ? <Layout className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
            {twoPageMode ? "Two-page" : "Single-page"}
          </Button>
        </div>
      </div>

      {/* PDF Viewer - supports Single/Two-page. Duplicate text fix: text layer disabled. */}
      <div 
        className={`flex-1 overflow-auto p-2 transition-colors ${
          nightMode ? "bg-gray-900" : "bg-muted"
        }`}
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-muted-foreground">Where Learning Never Stops</p>
          <div>
            <Document
              file={pdfPath}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center p-12 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Where Learning Never Stops</p>
                </div>
              }
            >
              {twoPageMode ? (
                <div className="two-page-spread">
                  <div className={`pdf-page`}>
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={true}
                      className={`shadow-2xl ${nightMode ? "invert" : ""}`}
                    />
                  </div>
                  {pageNumber + 1 <= numPages && (
                    <div className={`pdf-page`}>
                      <Page
                        pageNumber={pageNumber + 1}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={true}
                        className={`shadow-2xl ${nightMode ? "invert" : ""}`}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className={`pdf-page`}>
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={true}
                    className={`shadow-2xl ${nightMode ? "invert" : ""}`}
                  />
                </div>
              )}
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

      {/* Page animations removed per requirements */}
      <style dangerouslySetInnerHTML={{__html: `
        .two-page-spread {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }
        .pdf-page {
          margin-bottom: 0;
          padding-bottom: 0;
          max-height: 80vh;
          overflow: hidden;
        }
        .pdf-page canvas {
          display: block;
          margin: 0 auto;
          max-height: 80vh;
          object-fit: contain;
        }
        .react-pdf__Page {
          max-height: 80vh !important;
        }
        .react-pdf__Page__canvas {
          max-height: 80vh !important;
          height: auto !important;
        }
      `}} />
    </div>
  );
};
