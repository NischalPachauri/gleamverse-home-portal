import { ArrowLeft, Download, BookOpen, Book, Music, Maximize, Minimize, Sun, Moon, FileText, Palette, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { readerConfig, ReaderTheme } from '@/config/readerConfig';
import { cn } from '@/lib/utils';

interface BookHeaderProps {
  bookInfo: { title: string; author: string };
  bookCoverSrc?: string;
  theme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
  pageMode: 'single' | 'double';
  onPageModeChange: (mode: 'single' | 'double') => void;
  currentPage: number;
  totalPages: number;
  backgroundMusic: string;
  onBackgroundMusicChange: (music: string) => void;
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
  theme,
  onThemeChange,
  pageMode,
  onPageModeChange,
  currentPage,
  totalPages,
  backgroundMusic,
  onBackgroundMusicChange,
  isFullscreen,
  onToggleFullscreen,
  onPageJump,
  onBack,
  onDownload,
}: BookHeaderProps) {
  const [editingPage, setEditingPage] = useState(false);
  const [pageInput, setPageInput] = useState('');

  const handleDownload = () => { if (onDownload) onDownload(); };
  const handleBackToLibrary = () => { if (onBack) onBack(); };

  const commitPageJump = () => {
    const page = parseInt(pageInput);
    if (page >= 1 && page <= totalPages) onPageJump(page);
    setEditingPage(false);
    setPageInput('');
  };

  const currentTheme = readerConfig.themes[theme];
  const pct = Math.max(0, Math.min(100, totalPages ? (currentPage / totalPages) * 100 : 0));

  const themeIcons = {
    light: <Sun className="size-4" />,
    sepia: <FileText className="size-4" />,
    dark: <Moon className="size-4" />,
    forest: <Palette className="size-4" />,
    nebula: <Sparkles className="size-4" />
  } as const;

  return (
    <header
      className={cn(
        "transition-all duration-500 ease-in-out relative z-50",
        currentTheme.glass,
        currentTheme.text
      )}
      role="banner"
      aria-label="Reader header"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left Section - Back & Title */}
          <div className="flex items-center gap-5 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLibrary}
              className={cn(
                "gap-2 h-10 px-4 rounded-full transition-all duration-300",
                currentTheme.ui.hover,
                "hover:pr-5 group"
              )}
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="font-medium text-sm">Library</span>
            </Button>

            <div className={cn("h-6 w-px", currentTheme.ui.border)} />

            <div className="flex items-center gap-3 min-w-0 group cursor-default">
              <div className="relative overflow-hidden rounded shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
                <ImageWithFallback
                  src={bookCoverSrc || "/placeholder.svg"}
                  alt={bookInfo.title}
                  className="h-12 w-auto object-cover"
                />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h1 className="text-base font-bold leading-none tracking-tight truncate pr-4 opacity-90 group-hover:opacity-100 transition-opacity">
                  {bookInfo.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Center - Page Control */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1.5 rounded-full border transition-all duration-300",
              currentTheme.ui.border,
              currentTheme.ui.buttonGlass
            )}>
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
                  className={cn(
                    "h-7 w-16 text-center text-sm font-medium border-0 p-0 focus-visible:ring-0",
                    "bg-transparent"
                  )}
                />
              ) : (
                <button
                  onClick={() => { setEditingPage(true); setPageInput(String(currentPage)); }}
                  className="px-3 py-1 text-sm font-medium tabular-nums hover:opacity-70 transition-opacity"
                >
                  {currentPage}
                </button>
              )}
              <span className={cn("text-xs opacity-40 select-none font-medium")}>/</span>
              <span className="px-3 py-1 text-sm font-medium tabular-nums opacity-60">
                {totalPages}
              </span>
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Page Mode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageModeChange(pageMode === 'single' ? 'double' : 'single')}
              className={cn("size-10 rounded-full", currentTheme.ui.buttonGlass, currentTheme.ui.transition)}
              title={pageMode === 'single' ? 'Double Page View' : 'Single Page View'}
            >
              {pageMode === 'single' ? <Book className="size-4" /> : <BookOpen className="size-4" />}
            </Button>

            <div className={cn("h-5 w-px mx-1", currentTheme.ui.border)} />

            {/* Theme Selector */}
            <Select value={theme} onValueChange={(v) => onThemeChange(v as ReaderTheme)}>
              <SelectTrigger className={cn(
                "w-[40px] lg:w-[130px] h-10 px-2 lg:px-3 gap-2 border rounded-full",
                currentTheme.ui.buttonGlass,
                currentTheme.ui.transition,
                "focus:ring-0"
              )}>
                <div className="flex items-center justify-center lg:justify-start gap-2 w-full">
                  {themeIcons[theme as keyof typeof themeIcons]}
                  <span className="hidden lg:inline text-xs font-medium truncate">{readerConfig.themes[theme].name}</span>
                </div>
              </SelectTrigger>
              <SelectContent className={cn(currentTheme.ui.glass, "p-2 z-[100] min-w-[140px]", currentTheme.panelBg, currentTheme.text)}>
                {Object.entries(readerConfig.themes).map(([key, t]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className={cn(
                      "text-xs font-medium rounded-lg mb-1 last:mb-0 cursor-pointer",
                      currentTheme.ui.transition,
                      currentTheme.ui.glassHover
                    )}
                  >
                    <span className="font-medium pl-1">{t.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Music */}
            <Select value={backgroundMusic} onValueChange={onBackgroundMusicChange}>
              <SelectTrigger className={cn(
                "w-[40px] lg:w-auto h-10 px-2 lg:px-3 border rounded-full",
                currentTheme.ui.buttonGlass,
                currentTheme.ui.transition,
                "focus:ring-0"
              )}>
                <Music className="size-4" />
                <span className="hidden lg:inline ml-2 text-xs font-medium max-w-[80px] truncate">
                  {backgroundMusic === 'none' ? 'Music' : readerConfig.musicTracks.find(t => t.value === backgroundMusic)?.label}
                </span>
              </SelectTrigger>
              <SelectContent align="end" className={cn(currentTheme.ui.glass, "p-2 z-[100] min-w-[140px]", currentTheme.panelBg, currentTheme.text)}>
                <SelectItem value="none" className={cn("text-xs rounded-lg mb-1", currentTheme.ui.transition, currentTheme.ui.glassHover)}>No Music</SelectItem>
                {readerConfig.musicTracks.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className={cn("text-xs rounded-lg mb-1 last:mb-0", currentTheme.ui.transition, currentTheme.ui.glassHover)}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className={cn("h-5 w-px mx-1", currentTheme.ui.border)} />

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className={cn("size-10 rounded-full", currentTheme.ui.buttonGlass, currentTheme.ui.transition)}
            >
              {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </Button>

            {/* Download */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className={cn("size-10 rounded-full", currentTheme.ui.buttonGlass, currentTheme.ui.transition)}
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar - Increased size for better visibility */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out relative",
            currentTheme.ui.progressBar
          )}
          style={{ width: `${pct}%` }}
        >
          <div className={cn("absolute right-0 top-1/2 -translate-y-1/2 size-3 rounded-full blur-[3px]", currentTheme.ui.progressBar)} />
        </div>
      </div>
    </header>
  );
}

export default BookHeader;
