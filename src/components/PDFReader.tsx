import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Moon, Sun, Volume2, VolumeX, Maximize, Minimize, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFReaderProps {
  pdfPath: string;
  title: string;
}

export const PDFReader = ({ pdfPath, title }: PDFReaderProps) => {
  const { id } = useParams();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [nightMode, setNightMode] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isInLibrary, setIsInLibrary] = useState<boolean>(false);
  const [isPageTurning, setIsPageTurning] = useState<boolean>(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem("sessionId");
    if (!sid) {
      sid = Math.random().toString(36).substring(7);
      localStorage.setItem("sessionId", sid);
    }
    return sid;
  });

  useEffect(() => {
    checkIfInLibrary();
  }, [id]);

  const checkIfInLibrary = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("user_library")
      .select("id")
      .eq("book_id", id)
      .eq("user_session_id", sessionId)
      .single();
    
    setIsInLibrary(!!data);
  };

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

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    toast.success(`Document loaded! ${numPages} pages available.`);
  }

  function onDocumentLoadError(error: Error) {
    toast.error("Failed to load PDF. Please try again.");
    console.error("PDF load error:", error);
  }

  const goToPrevPage = () => {
    if (pageNumber <= 1) return;
    setIsPageTurning(true);
    setTimeout(() => {
      setPageNumber((prev) => Math.max(prev - 1, 1));
      setIsPageTurning(false);
    }, 300);
  };

  const goToNextPage = () => {
    if (pageNumber >= numPages) return;
    setIsPageTurning(true);
    setTimeout(() => {
      setPageNumber((prev) => Math.min(prev + 1, numPages));
      setIsPageTurning(false);
    }, 300);
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

  const toggleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast.success("Text-to-speech stopped");
    } else {
      const utterance = new SpeechSynthesisUtterance(
        `Reading page ${pageNumber} of ${title}. This is a PDF document viewer with text-to-speech functionality.`
      );
      utterance.onend = () => setIsSpeaking(false);
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast.success("Text-to-speech started");
    }
  };

  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  useEffect(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [pageNumber]);

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
            Page {pageNumber} of {numPages || "..."}
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

        <div className="flex items-center gap-2">
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

          <Button 
            onClick={toggleTextToSpeech} 
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

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
        </div>
      </div>

      {/* PDF Viewer */}
      <div 
        className={`flex-1 overflow-auto p-8 transition-colors ${
          nightMode ? "bg-gray-900" : "bg-muted"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Where Learning Never Stops</p>
          <div className={`transition-all duration-300 ${
            isPageTurning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}>
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
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className={`shadow-2xl ${nightMode ? "invert" : ""}`}
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
};
