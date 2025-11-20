import { MoreVertical, BookMarked, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { readerConfig, ReaderTheme } from '@/config/readerConfig';

interface Chapter { id: number; title: string; page: number }

interface ChapterMenuProps {
  chapters: Chapter[];
  currentChapter: number;
  isOpen: boolean;
  onToggle: () => void;
  onChapterSelect: (chapterId: number) => void;
  theme: ReaderTheme;
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

  // Helper to get colors based on theme
  const getThemeStyles = () => {
    const t = readerConfig.themes[theme];
    return {
      menuBg: t.panelBg,
      borderColor: t.panelBorder,
      textColor: t.text,
      activeItem: theme === 'dark' || theme === 'midnight' ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10',
      hoverItem: theme === 'dark' || theme === 'midnight' ? 'hover:bg-white/5' : 'hover:bg-black/5',
      iconBg: theme === 'dark' || theme === 'midnight' ? 'bg-indigo-500' : 'bg-blue-500',
    };
  };

  const styles = getThemeStyles();

  // Smart button positioning based on magnification
  const buttonPosition = magnification > 130 ? 'top-16' : 'top-16';

  if (variant === 'inline') {
    return (
      <div className={`mt-2 border-t ${styles.borderColor}`}>
        <div className="p-3 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${styles.iconBg} shadow-sm`}>
            <BookMarked className="size-4 text-white" />
          </div>
          <h2 className={`font-bold text-sm ${styles.textColor}`}>Chapters</h2>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => onChapterSelect(chapter.id)}
              className={`text-left px-3 py-2 rounded-lg border transition-colors ${currentChapter === chapter.id ? styles.activeItem : `${styles.borderColor} ${styles.hoverItem}`
                } ${styles.textColor}`}
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
              className={`inline-flex items-center justify-center size-9 rounded-md border transition-all duration-300 hover:scale-105 ${styles.menuBg} ${styles.borderColor} ${styles.textColor}`}
              title="Open chapter navigation (C)"
              aria-haspopup="menu"
              aria-expanded={isOpen}
            >
              <MoreVertical className="size-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="bottom" className={`${styles.menuBg} border ${styles.borderColor} w-[min(92vw,700px)] p-0 backdrop-blur-xl`}
            aria-label="Chapters list"
          >
            <div className={`p-3 border-b flex items-center gap-3 ${styles.borderColor} bg-black/5`}>
              <div className={`p-2 rounded-lg ${styles.iconBg} shadow-sm`}>
                <BookMarked className="size-4 text-white" />
              </div>
              <h2 className={`font-bold text-sm ${styles.textColor}`}>Chapters</h2>
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
                    className={`text-left px-3 py-2 rounded-lg border transition-colors ${currentChapter === chapter.id ? styles.activeItem : `${styles.borderColor} ${styles.hoverItem}`
                      } ${styles.textColor}`}
                    aria-current={currentChapter === chapter.id ? 'true' : undefined}
                  >
                    <div className="text-xs font-medium truncate">{chapter.title}</div>
                    <div className="text-[10px] opacity-60">Page {chapter.page}</div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className={`p-3 border-t text-xs text-center opacity-60 ${styles.borderColor} bg-black/5 ${styles.textColor}`}>
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
          className={`fixed left-4 z-40 transition-all duration-300 ${buttonPosition} ${isOpen ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 scale-100'
            }`}
        >
          <button
            onClick={onToggle}
            className={`inline-flex items-center justify-center size-11 rounded-full shadow-xl border transition-all duration-300 hover:scale-110 ${styles.menuBg} ${styles.borderColor} ${styles.textColor}`}
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
        className={`fixed left-0 top-0 bottom-0 w-80 z-40 transition-all duration-300 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
          } ${styles.menuBg} backdrop-blur-xl border-r ${styles.borderColor} ${styles.textColor}`}
        role="dialog" aria-modal="true" aria-label="Chapter navigation"
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${styles.borderColor} bg-black/5`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${styles.iconBg} shadow-sm`}>
              <BookMarked className="size-5 text-white" />
            </div>
            <h2 className="font-bold text-lg">Chapters</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={`size-9 p-0 rounded-full transition-colors hover:bg-black/10`}
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
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${currentChapter === chapter.id
                    ? styles.activeItem
                    : `${styles.borderColor} ${styles.hoverItem} hover:scale-[1.02]`
                  }`}
                aria-current={currentChapter === chapter.id ? 'true' : undefined}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug mb-2 ${currentChapter === chapter.id ? 'font-bold' : 'opacity-90'
                      }`}>
                      {chapter.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs opacity-60">
                      <span className={`w-1.5 h-1.5 rounded-full ${currentChapter === chapter.id
                          ? styles.iconBg
                          : 'bg-current'
                        }`} />
                      <span>Page {chapter.page}</span>
                    </div>
                  </div>
                  {currentChapter === chapter.id && (
                    <div className={`w-2.5 h-2.5 rounded-full ${styles.iconBg} animate-pulse shadow-sm`} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Chapter Count Footer */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 border-t text-xs text-center opacity-60 ${styles.borderColor} bg-black/5`}>
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