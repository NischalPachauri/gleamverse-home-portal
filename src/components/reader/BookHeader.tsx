import { ArrowLeft, ZoomIn, ZoomOut, Download, BookOpen, Book, Music, Maximize, Minimize, Sun, Moon, FileText, Hand } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
 
import { Separator } from '@/components/ui/separator';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface BookHeaderProps {
  bookInfo: { title: string; author: string };
  bookCoverSrc?: string;
  magnification: number;
  onMagnificationChange: (size: number) => void;
  theme: 'light' | 'sepia' | 'dark';
  onThemeChange: (theme: 'light' | 'sepia' | 'dark') => void;
  pageMode: 'single' | 'double';
  onPageModeChange: (mode: 'single' | 'double') => void;
  currentPage: number;
  totalPages: number;
  backgroundMusic: string;
  onBackgroundMusicChange: (music: string) => void;
  musicOptions?: { value: string; label: string }[];
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onPageJump: (page: number) => void;
  onBack?: () => void;
  onDownload?: () => void;
  isPanMode: boolean;
  onTogglePanMode: () => void;
}

export function BookHeader({
  bookInfo,
  bookCoverSrc,
  magnification,
  onMagnificationChange,
  theme,
  onThemeChange,
  pageMode,
  onPageModeChange,
  currentPage,
  totalPages,
  backgroundMusic,
  onBackgroundMusicChange,
  musicOptions,
  isFullscreen,
  onToggleFullscreen,
  onPageJump,
  onBack,
  onDownload,
  isPanMode,
  onTogglePanMode
}: BookHeaderProps) {
  const [editingPage, setEditingPage] = useState(false);
  const [pageInput, setPageInput] = useState('');

  const handleDownload = () => { if (onDownload) onDownload(); };
  const handleBackToLibrary = () => { if (onBack) onBack(); };

  const increaseMagnification = () => { 
    if (magnification < 200) onMagnificationChange(Math.min(200, magnification + 10)); 
  };
  
  const decreaseMagnification = () => { 
    if (magnification > 50) onMagnificationChange(Math.max(50, magnification - 10)); 
  };

  const commitPageJump = () => {
    const page = parseInt(pageInput);
    if (page >= 1 && page <= totalPages) onPageJump(page);
    setEditingPage(false);
    setPageInput('');
  };

  const themeColors = {
    light: 'bg-gradient-to-r from-blue-50/95 via-indigo-50/95 to-purple-50/95 backdrop-blur-md border-blue-200 text-gray-900',
    sepia: 'bg-gradient-to-r from-amber-50/95 via-orange-50/95 to-yellow-50/95 backdrop-blur-md border-amber-300 text-amber-950',
    dark: 'bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md border-slate-700 text-gray-100'
  } as const;

  const buttonHover = {
    light: 'hover:bg-blue-100/50',
    sepia: 'hover:bg-amber-100/50',
    dark: 'hover:bg-slate-700/50'
  } as const;

  const inputBg = {
    light: 'bg-blue-50/50 border-blue-200 focus:border-blue-400',
    sepia: 'bg-amber-50/50 border-amber-300 focus:border-amber-500',
    dark: 'bg-slate-800/50 border-slate-600 focus:border-slate-400'
  } as const;

  const selectBg = {
    light: 'bg-blue-100/40 border-blue-300',
    sepia: 'bg-amber-100/40 border-amber-400',
    dark: 'bg-slate-800/60 border-slate-600'
  } as const;


  const themeIcons = { 
    light: <Sun className="size-5" />, 
    sepia: <FileText className="size-5" />, 
    dark: <Moon className="size-5" /> 
  } as const;

  const pct = Math.max(0, Math.min(100, totalPages ? (currentPage / totalPages) * 100 : 0));

  return (
    <header className={`${themeColors[theme]} border-b-2 transition-all duration-300 shadow-sm`} role="banner" aria-label="Reader header">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Back Button, Cover, and Title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToLibrary} 
              className={`gap-2 flex-shrink-0 ${buttonHover[theme]} transition-colors`}
              aria-label="Back to Library"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline font-medium">Library</span>
            </Button>
            
            <Separator orientation="vertical" className="h-8 flex-shrink-0 bg-current opacity-20" />
            
            {/* Book Cover and Title - No Gap */}
            <div className="flex items-center gap-3 min-w-0" aria-label="Book identity">
              <ImageWithFallback 
                src={bookCoverSrc || "/placeholder.svg"} 
                alt={bookInfo.title} 
                className="h-14 w-auto object-cover rounded shadow-md flex-shrink-0 ring-1 ring-black/10" 
              />
              <div className="min-w-0 max-w-md">
                <h1 className="text-base font-bold leading-tight line-clamp-2">
                  {bookInfo.title}
                </h1>
                <p className="text-xs opacity-70 truncate mt-0.5">{bookInfo.author}</p>
              </div>
            </div>
          </div>

          {/* Center - Page Number */}
          <div className="flex items-center gap-2">
            {editingPage ? (
              <Input
                type="number"
                min="1"
                max={totalPages}
                autoFocus
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={commitPageJump}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') commitPageJump(); 
                  if (e.key === 'Escape') { setEditingPage(false); setPageInput(''); } 
                }}
                placeholder={`${currentPage}`}
                className={`h-10 w-28 text-center text-base font-semibold rounded-md ${inputBg[theme]} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                aria-label="Jump to page"
              />
            ) : (
              <button
                onClick={() => { setEditingPage(true); setPageInput(String(currentPage)); }}
                className={`text-base font-semibold px-3 py-2 rounded-md ${buttonHover[theme]} transition-colors`}
                title="Click to jump to page"
                aria-label={`Current page ${currentPage} of ${totalPages}`}
              >
                {`${currentPage} / ${totalPages}`}
              </button>
            )}
          </div>

          {/* Right Section - All Controls */}
          <div className="flex items-center gap-1.5 flex-1 justify-end">
            {/* Theme Selector */}
            <button 
              onClick={() => {
                const themes: ('light' | 'sepia' | 'dark')[] = ['light', 'sepia', 'dark'];
                const idx = themes.indexOf(theme);
                onThemeChange(themes[(idx + 1) % 3]);
              }}
              className={`inline-flex items-center justify-center rounded-md size-9 ${buttonHover[theme]} transition-colors`}
              title="Change theme (T)"
              aria-label="Change theme"
            >
              {themeIcons[theme]}
            </button>

            <Separator orientation="vertical" className="h-5 bg-current opacity-20" />

            {/* Magnification Controls */}
            <div className="flex items-center gap-1 rounded-lg p-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={decreaseMagnification} 
                disabled={magnification <= 50} 
                className={`size-8 p-0 ${buttonHover[theme]} transition-colors disabled:opacity-30`}
                title="Zoom out (Ctrl + -)"
                aria-label="Zoom out"
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="text-xs font-bold px-2 min-w-[3.5rem] text-center tabular-nums">
                {magnification}%
              </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={increaseMagnification} 
              disabled={magnification >= 200} 
              className={`size-8 p-0 ${buttonHover[theme]} transition-colors disabled:opacity-30`}
              title="Zoom in (Ctrl + +)"
              aria-label="Zoom in"
            >
              <ZoomIn className="size-4" />
            </Button>
            </div>

            

            <Separator orientation="vertical" className="h-5 bg-current opacity-20" />

            {/* Pan Tool Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onTogglePanMode} 
                className={`size-9 p-0 transition-all ${
                  isPanMode 
                    ? theme === 'light' ? 'bg-blue-200 text-blue-700 hover:bg-blue-300' :
                      theme === 'sepia' ? 'bg-amber-200 text-amber-800 hover:bg-amber-300' :
                      'bg-indigo-700 text-indigo-100 hover:bg-indigo-600'
                    : buttonHover[theme]
                }`}
                title={isPanMode ? "Disable pan mode (H)" : "Enable pan mode (H)"}
                aria-pressed={isPanMode}
              >
                <Hand className={`size-5 ${isPanMode ? 'animate-pulse' : ''}`} />
              </Button>

            <Separator orientation="vertical" className="h-5 bg-current opacity-20" />

            {/* Page Mode Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onPageModeChange(pageMode === 'single' ? 'double' : 'single')} 
                className={`size-9 p-0 ${buttonHover[theme]} transition-colors`}
                title={pageMode === 'single' ? 'Switch to double page (D)' : 'Switch to single page (D)'}
                aria-label="Toggle page mode"
              >
                {pageMode === 'single' ? <Book className="size-5" /> : <BookOpen className="size-5" />}
              </Button>

            <Separator orientation="vertical" className="h-5 bg-current opacity-20" />

            {/* Music Selector */}
            <Select value={backgroundMusic} onValueChange={onBackgroundMusicChange}>
              <SelectTrigger className={`w-[140px] h-9 text-sm rounded-md border ${selectBg[theme]} transition-colors`}>
                <Music className="size-4 mr-1.5" />
                <SelectValue placeholder="Music" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Music</SelectItem>
                {(musicOptions || []).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-5 bg-current opacity-20" />

            

            {/* Download Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDownload} 
              className={`size-9 p-0 ${buttonHover[theme]} transition-colors`}
              title="Download PDF"
              aria-label="Download PDF"
            >
              <Download className="size-5" />
            </Button>

            {/* Fullscreen Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleFullscreen} 
              className={`size-9 p-0 ${buttonHover[theme]} transition-colors`}
              title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
              aria-pressed={isFullscreen}
            >
              {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Enhanced Progress Bar */}
      <div className="h-1 w-full bg-black/10 dark:bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div 
          className={`h-full transition-all duration-500 ${
            theme === 'light' ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500' :
            theme === 'sepia' ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500' :
            'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
          }`}
          style={{ width: `${pct}%` }} 
        />
      </div>
    </header>
  );
}

export default BookHeader;
