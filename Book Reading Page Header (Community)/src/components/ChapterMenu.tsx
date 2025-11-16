import { MoreVertical, BookMarked, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface Chapter {
  id: number;
  title: string;
  page: number;
}

interface ChapterMenuProps {
  chapters: Chapter[];
  currentChapter: number;
  isOpen: boolean;
  onToggle: () => void;
  onChapterSelect: (chapterId: number) => void;
  theme: 'light' | 'sepia' | 'dark';
}

export function ChapterMenu({
  chapters,
  currentChapter,
  isOpen,
  onToggle,
  onChapterSelect,
  theme
}: ChapterMenuProps) {
  const themeColors = {
    light: 'bg-white/95 backdrop-blur-md text-gray-900 border-blue-200',
    sepia: 'bg-amber-50/95 backdrop-blur-md text-amber-950 border-amber-300',
    dark: 'bg-slate-950/95 backdrop-blur-md text-gray-100 border-indigo-900'
  };

  const activeThemeColors = {
    light: 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-400',
    sepia: 'bg-gradient-to-r from-amber-200 to-orange-200 border-amber-400',
    dark: 'bg-gradient-to-r from-indigo-900 to-purple-900 border-indigo-700'
  };

  return (
    <>
      {/* Toggle Button - Better positioned at top left corner */}
      <div className="fixed left-8 top-24 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className={`rounded-full shadow-xl transition-all duration-300 ${
            isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          } hover:scale-110 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-2`}
          title="Chapter navigation"
        >
          <MoreVertical className="size-4" />
        </Button>
      </div>

      {/* Slide-out Menu */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-80 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${themeColors[theme]} border-r-2 shadow-2xl`}
      >
        <div className="p-5 border-b flex items-center justify-between bg-blue-100/30 dark:bg-indigo-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-indigo-600 dark:to-purple-600">
              <BookMarked className="size-5 text-white" />
            </div>
            <h2 className="font-semibold">Chapters</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="size-9 p-0 hover:bg-blue-100 dark:hover:bg-indigo-900 rounded-full"
            title="Close menu"
          >
            <ArrowLeft className="size-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-81px)]">
          <div className="p-3">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => onChapterSelect(chapter.id)}
                className={`w-full text-left p-4 mb-3 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                  currentChapter === chapter.id
                    ? activeThemeColors[theme] + ' shadow-md'
                    : themeColors[theme] + ' hover:bg-blue-50/50 dark:hover:bg-indigo-950/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${currentChapter === chapter.id ? '' : 'opacity-80'}`}>
                      {chapter.title}
                    </p>
                    <p className="text-xs opacity-50 mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-current" />
                      Page {chapter.page}
                    </p>
                  </div>
                  {currentChapter === chapter.id && (
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-indigo-500 dark:to-purple-500 mt-2 animate-pulse" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Overlay - lighter to see background */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}