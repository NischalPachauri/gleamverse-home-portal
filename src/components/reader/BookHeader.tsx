import { ArrowLeft, Download, BookOpen, Book, Music, Maximize, Minimize, Sun, Moon, FileText, Palette } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { readerConfig, ReaderTheme } from '@/config/readerConfig';

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
  isPanMode,
  onTogglePanMode
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

  const themeIcons = {
    light: <Sun className="size-5" />,
    sepia: <FileText className="size-5" />,
    dark: <Moon className="size-5" />,
    midnight: <Moon className="size-5" />,
    forest: <Palette className="size-5" />
  } as const;

  const pct = Math.max(0, Math.min(100, totalPages ? (currentPage / totalPages) * 100 : 0));

  return (
    <header className={`${currentTheme.panelBg} backdrop-blur-2xl border-b ${currentTheme.panelBorder} ${currentTheme.text} transition-all duration-300 shadow-md relative z-50`} role="banner" aria-label="Reader header">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left Section - Back Button, Cover, and Title */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLibrary}
              className={`gap-2 flex-shrink-0 hover:bg-black/5 transition-colors h-10 px-4`}
              aria-label="Back to Library"
            >
              <ArrowLeft className="size-5" />
              <span className="hidden sm:inline font-medium text-sm">Library</span>
            </Button>

            <Separator orientation="vertical" className="h-10 flex-shrink-0 bg-current opacity-10" />

            {/* Book Cover and Title */}
            <div className="flex items-center gap-5 min-w-0" aria-label="Book identity">
              <ImageWithFallback
                src={bookCoverSrc || "/placeholder.svg"}
                alt={bookInfo.title}
                className="h-14 w-auto object-cover rounded-md shadow-sm flex-shrink-0 ring-1 ring-black/5"
              />
              <div className="min-w-0 flex flex-col justify-center">
                <h1 className="text-xl font-bold leading-tight truncate pr-4 tracking-tight">
                  {bookInfo.title}
                </h1>
                <p className="text-sm opacity-60 truncate font-medium">{bookInfo.author}</p>
              </div>
            </div>
          </div>

          {/* Center - Page Number */}
          <div className="flex items-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
                className={`h-10 w-24 text-center text-sm font-semibold rounded-lg bg-white/10 border-white/20 focus:ring-2 focus:ring-blue-500/50 shadow-inner`}
                aria-label="Jump to page"
              />
            ) : (
              <button
                onClick={() => { setEditingPage(true); setPageInput(String(currentPage)); }}
                className={`text-sm font-semibold px-4 py-2 rounded-lg hover:bg-black/5 transition-all duration-200 tabular-nums tracking-wide`}
                title="Click to jump to page"
                aria-label={`Current page ${currentPage} of ${totalPages}`}
              >
                {currentPage} <span className="opacity-30 mx-2">/</span> {totalPages}
              </button>
            )}
          </div>

          {/* Right Section - All Controls */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            {/* Theme Selector */}
            <Select value={theme} onValueChange={(v) => onThemeChange(v as ReaderTheme)}>
              <SelectTrigger className="w-[110px] h-10 text-xs font-medium rounded-lg border-0 bg-black/5 hover:bg-black/10 transition-colors focus:ring-0 shadow-sm">
                <div className="flex items-center gap-2.5">
                  {themeIcons[theme as keyof typeof themeIcons] || <Palette className="size-4" />}
                  <span className="truncate">{readerConfig.themes[theme].name}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(readerConfig.themes).map(([key, t]) => (
                  <SelectItem key={key} value={key} className="text-xs font-medium">{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6 bg-current opacity-10" />

            {/* Page Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageModeChange(pageMode === 'single' ? 'double' : 'single')}
              className={`size-10 p-0 hover:bg-black/5 transition-colors rounded-lg`}
              title={pageMode === 'single' ? 'Switch to double page (D)' : 'Switch to single page (D)'}
              aria-label="Toggle page mode"
            >
              {pageMode === 'single' ? <Book className="size-5 opacity-70" /> : <BookOpen className="size-5 opacity-70" />}
            </Button>

            <Separator orientation="vertical" className="h-6 bg-current opacity-10" />

            {/* Music Selector */}
            <Select value={backgroundMusic} onValueChange={onBackgroundMusicChange}>
              <SelectTrigger className={`w-[140px] h-10 text-xs font-medium rounded-lg border-0 bg-black/5 hover:bg-black/10 transition-colors focus:ring-0 shadow-sm`}>
                <Music className="size-4 mr-2 opacity-70" />
                <SelectValue placeholder="Music" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">No Music</SelectItem>
                {readerConfig.musicTracks.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6 bg-current opacity-10" />

            {/* Download Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className={`size-10 p-0 hover:bg-black/5 transition-colors rounded-lg`}
              title="Download PDF"
              aria-label="Download PDF"
            >
              <Download className="size-5 opacity-70" />
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullscreen}
              className={`size-10 p-0 hover:bg-black/5 transition-colors rounded-lg`}
              title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
              aria-pressed={isFullscreen}
            >
              {isFullscreen ? <Minimize className="size-5 opacity-70" /> : <Maximize className="size-5 opacity-70" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/5">
        <div
          className="h-full bg-blue-500/80 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </header>
  );
}

export default BookHeader;
