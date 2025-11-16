import { MoreVertical, BookMarked, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Chapter { id: number; title: string; page: number }

interface ChapterMenuProps {
  chapters: Chapter[];
  currentChapter: number;
  isOpen: boolean;
  onToggle: () => void;
  onChapterSelect: (chapterId: number) => void;
  theme: 'light' | 'sepia' | 'dark';
  magnification: number;
  variant?: 'inline' | 'overlay' | 'dropdown';
  showOverlayToggle?: boolean;
}

export function ChapterMenu({ 
  chapters, 
  currentChapter, 
  isOpen, 
  onToggle, 
  onChapterSelect, 
  theme,
  magnification,
  variant = 'overlay',
  showOverlayToggle = true
}: ChapterMenuProps) {
  const themeColors = {
    light: 'bg-white/98 backdrop-blur-xl text-gray-900 border-blue-200',
    sepia: 'bg-amber-50/98 backdrop-blur-xl text-amber-950 border-amber-300',
    dark: 'bg-slate-950/98 backdrop-blur-xl text-gray-100 border-slate-700'
  } as const;

  const activeThemeColors = {
    light: 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-400 shadow-md',
    sepia: 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-400 shadow-md',
    dark: 'bg-gradient-to-r from-indigo-900 to-purple-900 border-indigo-600 shadow-md'
  } as const;

  const hoverThemeColors = {
    light: 'hover:border-blue-300 hover:bg-blue-50/30',
    sepia: 'hover:border-amber-300 hover:bg-amber-50/30',
    dark: 'hover:border-slate-600 hover:bg-slate-800/30'
  } as const;

  const buttonTheme = {
    light: 'bg-blue-100/90 border-blue-300 text-gray-900 hover:bg-blue-200',
    sepia: 'bg-amber-100/90 border-amber-400 text-amber-900 hover:bg-amber-200',
    dark: 'bg-slate-800/90 border-slate-600 text-gray-100 hover:bg-slate-700'
  } as const;

  const iconGradient = {
    light: 'from-blue-500 to-indigo-600',
    sepia: 'from-amber-500 to-orange-600',
    dark: 'from-indigo-500 to-purple-600'
  } as const;

  // Smart button positioning based on magnification
  const buttonPosition = magnification > 130 ? 'top-16' : 'top-16';

  if (variant === 'inline') {
    return (
      <div className={`mt-2 border-t ${
        theme === 'light' ? 'border-blue-200' : theme === 'sepia' ? 'border-amber-300' : 'border-slate-700'
      }`}>
        <div className="p-3 flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${iconGradient[theme]} shadow-md`}>
            <BookMarked className="size-5 text-white" />
          </div>
          <h2 className="font-bold text-sm">Chapters</h2>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => onChapterSelect(chapter.id)}
              className={`text-left px-3 py-2 rounded-lg border ${
                currentChapter === chapter.id ? activeThemeColors[theme] : `${themeColors[theme]} ${hoverThemeColors[theme]}`
              }`}
            >
              <div className="text-xs font-medium truncate">{chapter.title}</div>
              <div className="text-[10px] opacity-60">Page {chapter.page}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="px-4 pt-2" aria-label="Chapter navigation dropdown">
        <Popover open={isOpen} onOpenChange={(open) => { if (open !== isOpen) onToggle(); }}>
          <PopoverTrigger asChild>
            <button
              onClick={onToggle}
              className={`inline-flex items-center justify-center size-9 rounded-md border transition-all duration-300 ${buttonTheme[theme]} hover:scale-105`}
              title="Open chapter navigation (C)"
              aria-haspopup="menu"
              aria-expanded={isOpen}
            >
              <MoreVertical className="size-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="bottom" className={`${themeColors[theme]} border ${theme === 'dark' ? 'border-slate-700' : theme === 'sepia' ? 'border-amber-300' : 'border-blue-200'} w-[min(92vw,700px)] p-0`}
            aria-label="Chapters list"
          >
            <div className={`p-3 border-b-2 flex items-center gap-3 ${
              theme === 'light' ? 'border-blue-200 bg-blue-50/50' :
              theme === 'sepia' ? 'border-amber-300 bg-amber-50/50' :
              'border-slate-700 bg-slate-900/50'
            }`}>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${iconGradient[theme]} shadow-md`}>
                <BookMarked className="size-5 text-white" />
              </div>
              <h2 className="font-bold text-sm">Chapters</h2>
            </div>
            <ScrollArea className="max-h-[50vh]">
              <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      onChapterSelect(chapter.id);
                      onToggle();
                    }}
                    className={`text-left px-3 py-2 rounded-lg border ${
                      currentChapter === chapter.id ? activeThemeColors[theme] : `${themeColors[theme]} ${hoverThemeColors[theme]}`
                    }`}
                    aria-current={currentChapter === chapter.id ? 'true' : undefined}
                  >
                    <div className="text-xs font-medium truncate">{chapter.title}</div>
                    <div className="text-[10px] opacity-60">Page {chapter.page}</div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className={`p-3 border-t-2 text-xs text-center opacity-60 ${
              theme === 'light' ? 'border-blue-200 bg-blue-50/50' :
              theme === 'sepia' ? 'border-amber-300 bg-amber-50/50' :
              'border-slate-700 bg-slate-900/50'
            }`}>
              {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <>
      {/* Toggle Button - Smart Positioning */}
      {showOverlayToggle && (
        <div 
          className={`fixed left-4 z-40 transition-all duration-300 ${buttonPosition} ${
            isOpen ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 scale-100'
          }`}
        >
          <button
            onClick={onToggle}
            className={`inline-flex items-center justify-center size-11 rounded-full shadow-xl border-2 transition-all duration-300 hover:scale-110 ${buttonTheme[theme]}`}
            title="Open chapter navigation (C)"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
          >
            <MoreVertical className="size-5" />
          </button>
        </div>
      )}

      {/* Chapter Menu Panel */}
      <div 
        className={`fixed left-0 top-0 bottom-0 w-80 z-40 transition-all duration-300 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
        } ${themeColors[theme]} border-r-2`}
        role="dialog" aria-modal="true" aria-label="Chapter navigation"
      >
        {/* Header */}
        <div className={`p-5 border-b-2 flex items-center justify-between ${
          theme === 'light' ? 'border-blue-200 bg-blue-50/50' :
          theme === 'sepia' ? 'border-amber-300 bg-amber-50/50' :
          'border-slate-700 bg-slate-900/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${iconGradient[theme]} shadow-md`}>
              <BookMarked className="size-5 text-white" />
            </div>
            <h2 className="font-bold text-lg">Chapters</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggle} 
            className={`size-9 p-0 rounded-full transition-colors ${
              theme === 'light' ? 'hover:bg-blue-100' :
              theme === 'sepia' ? 'hover:bg-amber-100' :
              'hover:bg-slate-800'
            }`}
            title="Close menu (C)"
            aria-label="Close menu"
          >
            <ArrowLeft className="size-5" />
          </Button>
        </div>

        {/* Chapter List */}
        <ScrollArea className="h-[calc(100vh-81px)]">
          <div className="p-3 space-y-2">
            {chapters.map((chapter) => (
              <button 
                key={chapter.id} 
                onClick={() => {
                  onChapterSelect(chapter.id);
                  onToggle();
                }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  currentChapter === chapter.id 
                    ? activeThemeColors[theme]
                    : `${themeColors[theme]} ${hoverThemeColors[theme]} hover:scale-[1.02]`
                }`}
                aria-current={currentChapter === chapter.id ? 'true' : undefined}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug mb-2 ${
                      currentChapter === chapter.id ? 'font-bold' : 'opacity-90'
                    }`}>
                      {chapter.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs opacity-60">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        currentChapter === chapter.id 
                          ? 'bg-gradient-to-r ' + iconGradient[theme]
                          : 'bg-current'
                      }`} />
                      <span>Page {chapter.page}</span>
                    </div>
                  </div>
                  {currentChapter === chapter.id && (
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${iconGradient[theme]} animate-pulse shadow-lg`} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Chapter Count Footer */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 border-t-2 text-xs text-center opacity-60 ${
          theme === 'light' ? 'border-blue-200 bg-blue-50/50' :
          theme === 'sepia' ? 'border-amber-300 bg-amber-50/50' :
          'border-slate-700 bg-slate-900/50'
        }`}>
          {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity duration-300" 
          onClick={onToggle} 
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default ChapterMenu;