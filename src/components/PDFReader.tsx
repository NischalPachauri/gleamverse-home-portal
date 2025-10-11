import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Moon, Sun, Volume2, VolumeX, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFReaderProps {
  pdfPath: string;
  title: string;
}

export const PDFReader = ({ pdfPath, title }: PDFReaderProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [nightMode, setNightMode] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<string>("default");
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    toast.success(`Document loaded! ${numPages} pages available.`);
  }

  function onDocumentLoadError(error: Error) {
    toast.error("Failed to load PDF. Please try again.");
    console.error("PDF load error:", error);
  }

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

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
    <div className="flex flex-col h-full">
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
            onClick={toggleNightMode} 
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {nightMode ? "Day" : "Night"}
          </Button>

          <Button 
            onClick={toggleTextToSpeech} 
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            TTS
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Type className="w-4 h-4" />
                Font
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Font Size</label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    min={12}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">{fontSize}px</span>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Font Family</label>
                  <DropdownMenuItem onClick={() => setFontFamily("default")}>
                    Default
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFontFamily("serif")}>
                    Serif
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFontFamily("mono")}>
                    Monospace
                  </DropdownMenuItem>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
        style={{ 
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily === "serif" ? "Georgia, serif" : fontFamily === "mono" ? "monospace" : "inherit"
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Where Learning Never Stops</p>
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
  );
};
