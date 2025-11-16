import { ArrowLeft, ZoomIn, ZoomOut, Download, BookOpen, Book, Music, Maximize, Minimize, Sun, Moon, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { useState } from 'react';

interface BookHeaderProps {
  bookInfo: {
    title: string;
    author: string;
  };
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  theme: 'light' | 'sepia' | 'dark';
  onThemeChange: (theme: 'light' | 'sepia' | 'dark') => void;
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
}

export function BookHeader({
  bookInfo,
  fontSize,
  onFontSizeChange,
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
  onDownload
}: BookHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pageInput, setPageInput] = useState('');

  const handleDownload = () => {
    if (onDownload) onDownload();
  };

  const handleBackToLibrary = () => {
    if (onBack) onBack();
  };

  const increaseFontSize = () => {
    if (fontSize < 24) onFontSizeChange(fontSize + 2);
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) onFontSizeChange(fontSize - 2);
  };

  const handlePageJump = () => {
    const page = parseInt(pageInput);
    if (page >= 1 && page <= totalPages) {
      onPageJump(page);
      setIsDialogOpen(false);
      setPageInput('');
    }
  };

  const themeColors = {
    light: 'bg-gradient-to-r from-blue-100/80 via-blue-50/80 to-purple-100/80 backdrop-blur-sm border-blue-200 text-gray-900 shadow-sm',
    sepia: 'bg-gradient-to-r from-amber-100/80 via-orange-100/80 to-yellow-100/80 backdrop-blur-sm border-amber-300 text-amber-950 shadow-sm',
    dark: 'bg-gradient-to-r from-indigo-950/90 via-purple-950/90 to-slate-950/90 backdrop-blur-sm border-indigo-900 text-gray-100 shadow-sm'
  };

  const themeIcons = {
    light: <Sun className="size-4" />,
    sepia: <FileText className="size-4" />,
    dark: <Moon className="size-4" />
  };

  return (
    <header className={`${themeColors[theme]} border-b transition-colors duration-300`}>
      <div className="px-6 py-2.5">
        <div className="flex items-center justify-between gap-6">
          {/* Left Section: Back Button & Book Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLibrary}
              className="gap-2 flex-shrink-0 hover:bg-blue-50 dark:hover:bg-indigo-900"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Library</span>
            </Button>
            
            <Separator orientation="vertical" className="h-8 flex-shrink-0" />
            
            <div className="flex items-center gap-3 min-w-0">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1551300329-dc0a750a7483?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjB2aW50YWdlfGVufDF8fHx8MTc2MzE4NTU2MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Book Cover"
                className="h-12 w-8 object-cover rounded shadow-md flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="truncate font-medium">{bookInfo.title}</h1>
                <p className="text-xs opacity-60 truncate">{bookInfo.author}</p>
              </div>
            </div>
          </div>

          {/* Center Section: Page Counter - Clickable */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="px-4 py-1.5 rounded-lg bg-blue-100/50 dark:bg-indigo-900/50 border border-blue-200 dark:border-indigo-800 hover:bg-blue-200/50 dark:hover:bg-indigo-800/50 transition-colors cursor-pointer">
                <span className="text-sm font-medium whitespace-nowrap">
                  {currentPage}-{Math.min(currentPage + (pageMode === 'double' ? 1 : 0), totalPages)} / {totalPages}
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Jump to Page</DialogTitle>
                <DialogDescription>
                  Enter a page number between 1 and {totalPages}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageInput(e.target.value)}
                  placeholder="Page number"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') handlePageJump();
                  }}
                />
                <Button onClick={handlePageJump}>Go</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Right Section: Controls */}
          <div className="flex items-center gap-1.5 flex-1 justify-end">
            {/* Theme Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-blue-50 dark:hover:bg-indigo-900 size-8"
                  title="Change theme"
                >
                  {themeIcons[theme]}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onThemeChange('light')} className="gap-2">
                  <Sun className="size-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onThemeChange('sepia')} className="gap-2">
                  <FileText className="size-4" />
                  Sepia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onThemeChange('dark')} className="gap-2">
                  <Moon className="size-4" />
                  Dark
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-5" />

            {/* Font Size Controls */}
            <div className="flex items-center gap-0.5 bg-blue-50 dark:bg-indigo-900 rounded-md p-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={decreaseFontSize}
                disabled={fontSize <= 12}
                title="Decrease font size"
                className="size-7 p-0 hover:bg-white dark:hover:bg-indigo-800"
              >
                <ZoomOut className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={increaseFontSize}
                disabled={fontSize >= 24}
                title="Increase font size"
                className="size-7 p-0 hover:bg-white dark:hover:bg-indigo-800"
              >
                <ZoomIn className="size-3.5" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-5" />

            {/* Page Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageModeChange(pageMode === 'single' ? 'double' : 'single')}
              title={pageMode === 'single' ? 'Switch to double page' : 'Switch to single page'}
              className="size-8 p-0 hover:bg-blue-50 dark:hover:bg-indigo-900"
            >
              {pageMode === 'single' ? <Book className="size-4" /> : <BookOpen className="size-4" />}
            </Button>

            <Separator orientation="vertical" className="h-5" />

            {/* Background Music Selector */}
            <Select value={backgroundMusic} onValueChange={onBackgroundMusicChange}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <Music className="size-3.5 mr-1.5" />
                <SelectValue placeholder="Music" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Music</SelectItem>
                <SelectItem value="classical">Classical</SelectItem>
                <SelectItem value="ambient">Ambient</SelectItem>
                <SelectItem value="nature">Nature Sounds</SelectItem>
                <SelectItem value="jazz">Jazz</SelectItem>
                <SelectItem value="lofi">Lo-fi Beats</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-5" />

            {/* Download & Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              title="Download book"
              className="size-8 p-0 hover:bg-blue-50 dark:hover:bg-indigo-900"
            >
              <Download className="size-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="size-8 p-0 hover:bg-blue-50 dark:hover:bg-indigo-900"
            >
              {isFullscreen ? <Minimize className="size-3.5" /> : <Maximize className="size-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}