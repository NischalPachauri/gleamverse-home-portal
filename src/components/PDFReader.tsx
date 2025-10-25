import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
// Use a same-origin worker URL to avoid cross-origin/module worker issues
// Vite will bundle this and return a URL string
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite query suffix not typed
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Moon, Sun, Maximize, Minimize, Layout, Columns, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  bookId: string;
}

export const PDFReader = ({ pdfPath, title, bookId }: PDFReaderProps) => {
  console.log('PDFReader initialized with:', { pdfPath, title, bookId });
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [nightMode, setNightMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Music state management
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [audioContextInitialized, setAudioContextInitialized] = useState<boolean>(false);
  
  // Available instrumental tracks - Your music files
  const musicTracks = [
    { name: "Track 1", url: "/music/track1.mp3" },
    { name: "Track 2", url: "/music/track2.mp3" },
    { name: "Track 3", url: "/music/track3.mp3" },
    { name: "Track 4", url: "/music/track4.mp3" },
    { name: "Track 5", url: "/music/track5.mp3" },
    { name: "Track 6", url: "/music/track6.mp3" }
  ];

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

  const containerRef = useRef<HTMLDivElement>(null);

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
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      setIsFullscreen(isFullscreenNow);
      
      // Show/hide controls based on fullscreen state
      const controls = document.querySelector('.pdf-controls');
      if (controls) {
        (controls as HTMLElement).style.display = isFullscreenNow ? 'none' : 'flex';
      }
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
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, numPages, twoPageMode]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
    };
  }, [audioRef]);

  // Test audio file accessibility
  const testAudioFile = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`Audio file ${url} status:`, response.status);
      return response.ok;
    } catch (error) {
      console.error(`Error testing audio file ${url}:`, error);
      return false;
    }
  };

  // Test all audio files on component mount
  useEffect(() => {
    musicTracks.forEach((track, index) => {
      testAudioFile(track.url).then(isAccessible => {
        console.log(`Track ${index + 1} (${track.name}): ${isAccessible ? 'Accessible' : 'Not accessible'}`);
      });
    });
  }, []);

  // Initialize audio context on user interaction
  const initializeAudioContext = async () => {
    if (audioContextInitialized) return true;
    
    try {
      // Create a silent audio to initialize the audio context
      const silentAudio = new Audio();
      silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      silentAudio.volume = 0;
      
      await silentAudio.play();
      silentAudio.pause();
      silentAudio.remove();
      
      setAudioContextInitialized(true);
      console.log('Audio context initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  };

  const toggleMode = () => {
    const next = !twoPageMode;
    setTwoPageMode(next);
    localStorage.setItem("twoPageMode", String(next));
    // Normalize left page when switching to two-page mode
    if (next && pageNumber % 2 === 0) {
      setPageNumber(pageNumber - 1);
    }
  };

  // Music control functions
  const toggleMusic = async () => {
    if (isMusicPlaying) {
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
      setIsMusicPlaying(false);
      toast.success("Background music stopped");
    } else {
      // Initialize audio context first
      const contextInitialized = await initializeAudioContext();
      if (!contextInitialized) {
        toast.error("Failed to initialize audio. Please try again.");
        return;
      }

      const audio = new Audio();
      audio.loop = true;
      audio.volume = 0.6; // Set volume to 60% for background music
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Add event listeners before setting source
      audio.addEventListener('loadstart', () => {
        console.log('Audio loading started');
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log('Audio can play through');
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        const error = audio.error;
        let errorMessage = `Music file not found: ${musicTracks[currentTrack].name}`;
        
        if (error) {
          switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
              errorMessage = "Audio playback was aborted";
              break;
            case error.MEDIA_ERR_NETWORK:
              errorMessage = "Network error while loading audio";
              break;
            case error.MEDIA_ERR_DECODE:
              errorMessage = "Audio file format not supported";
              break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Audio file not found or format not supported";
              break;
          }
        }
        
        toast.error(errorMessage);
        setIsMusicPlaying(false);
      });
      
      // Set the source and try to play
      audio.src = musicTracks[currentTrack].url;
      
      try {
        await audio.play();
        setAudioRef(audio);
        setIsMusicPlaying(true);
        toast.success(`Playing: ${musicTracks[currentTrack].name}`);
        console.log('Audio started playing successfully');
      } catch (error: any) {
        console.error('Error playing music:', error);
        if (error.name === 'NotAllowedError') {
          toast.error("Autoplay blocked. Please click the play button to start music.");
        } else if (error.name === 'NotSupportedError') {
          toast.error("Audio format not supported by your browser.");
        } else {
          toast.error(`Failed to play: ${musicTracks[currentTrack].name}. Please check if the music file exists and is in a supported format.`);
        }
      }
    }
  };

  const changeTrack = async (trackIndex: number) => {
    const wasPlaying = isMusicPlaying;
    
    if (isMusicPlaying && audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }
    
    setCurrentTrack(trackIndex);
    
    if (wasPlaying) {
      // Initialize audio context first
      const contextInitialized = await initializeAudioContext();
      if (!contextInitialized) {
        toast.error("Failed to initialize audio. Please try again.");
        return;
      }

      const audio = new Audio();
      audio.loop = true;
      audio.volume = 0.6;
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Add event listeners before setting source
      audio.addEventListener('loadstart', () => {
        console.log('Audio loading started for track:', trackIndex);
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log('Audio can play through for track:', trackIndex);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio error for track:', trackIndex, e);
        const error = audio.error;
        let errorMessage = `Music file not found: ${musicTracks[trackIndex].name}`;
        
        if (error) {
          switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
              errorMessage = "Audio playback was aborted";
              break;
            case error.MEDIA_ERR_NETWORK:
              errorMessage = "Network error while loading audio";
              break;
            case error.MEDIA_ERR_DECODE:
              errorMessage = "Audio file format not supported";
              break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Audio file not found or format not supported";
              break;
          }
        }
        
        toast.error(errorMessage);
        setIsMusicPlaying(false);
      });
      
      // Set the source and try to play
      audio.src = musicTracks[trackIndex].url;
      
      try {
        await audio.play();
        setAudioRef(audio);
        toast.success(`Now playing: ${musicTracks[trackIndex].name}`);
        console.log('Audio track changed successfully');
      } catch (error: any) {
        console.error('Error playing music:', error);
        if (error.name === 'NotAllowedError') {
          toast.error("Autoplay blocked. Please click the play button to start music.");
        } else if (error.name === 'NotSupportedError') {
          toast.error("Audio format not supported by your browser.");
        } else {
          toast.error(`Failed to play: ${musicTracks[trackIndex].name}. Please check if the music file exists and is in a supported format.`);
        }
        setIsMusicPlaying(false);
      }
    } else {
      toast.success(`Selected: ${musicTracks[trackIndex].name}`);
    }
  };

  // Add useEffect to set book status to 'Reading' and add to bookmarks
  useEffect(() => {
    if (bookId) {
      // Update book status to 'Reading'
      const rawStatus = localStorage.getItem('bookStatus');
      const statusMap: Record<string, string> = rawStatus ? JSON.parse(rawStatus) : {};
      statusMap[bookId] = 'Reading';
      localStorage.setItem('bookStatus', JSON.stringify(statusMap));

      // Also add to bookmarks if not already there
      const bookmarks = JSON.parse(localStorage.getItem('gleamverse_bookmarks') || '[]');
      if (!bookmarks.includes(bookId)) {
        bookmarks.push(bookId);
        localStorage.setItem('gleamverse_bookmarks', JSON.stringify(bookmarks));
      }
    }
  }, [bookId]);

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
    <div ref={containerRef} className={`flex flex-col bg-background ${isFullscreen ? 'h-screen' : 'h-full'}`}>
      {/* Controls */}
      <div className="pdf-controls sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between gap-4 flex-wrap shadow-lg">
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
          </Button>

          <Button 
            onClick={toggleFullscreen} 
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          <Button 
            onClick={toggleMusic} 
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            {isMusicPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isMusicPlaying ? `Stop ${musicTracks[currentTrack].name}` : "Play Music"}
          </Button>

          <div className="relative">
            <select
              value={currentTrack}
              onChange={(e) => changeTrack(parseInt(e.target.value))}
              className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
            >
              {musicTracks.map((track, index) => (
                <option key={index} value={index}>
                  {track.name}
                </option>
              ))}
            </select>
          </div>

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
        className={`flex-1 overflow-auto transition-colors ${
          nightMode ? "bg-gray-900" : "bg-muted"
        } ${isFullscreen ? 'p-0' : 'p-2'}`}
        style={{ 
          maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 200px)',
          height: isFullscreen ? '100vh' : 'auto'
        }}
      >
        <div className={`flex flex-col items-center ${isFullscreen ? 'gap-0 fullscreen-pdf' : 'gap-1'}`}>
          {!isFullscreen && <p className="text-sm text-muted-foreground">Where Learning Never Stops</p>}
          <div className={isFullscreen ? 'fullscreen-pdf' : ''}>
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
                  <div className="pdf-page">
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={true}
                      className={`shadow-2xl ${nightMode ? "invert" : ""}`}
                    />
                  </div>
                  {pageNumber + 1 <= numPages && (
                    <div className="pdf-page">
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
                <div className="single-page-container">
                  <div className="pdf-page">
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={true}
                      className={`shadow-2xl ${nightMode ? "invert" : ""}`}
                    />
                  </div>
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
        /* Fullscreen styles */
        .fullscreen-pdf .pdf-page {
          max-height: 100vh !important;
          height: 100vh !important;
        }
        .fullscreen-pdf .pdf-page canvas {
          max-height: 100vh !important;
          height: 100vh !important;
          object-fit: contain;
        }
        .fullscreen-pdf .react-pdf__Page {
          max-height: 100vh !important;
          height: 100vh !important;
        }
        .fullscreen-pdf .react-pdf__Page__canvas {
          max-height: 100vh !important;
          height: 100vh !important;
        }
        .fullscreen-pdf .two-page-spread {
          height: 100vh;
          align-items: center;
        }
      `}} />
    </div>
  );
};