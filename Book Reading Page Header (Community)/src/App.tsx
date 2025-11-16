import { useState, useEffect } from 'react';
import { BookHeader } from './components/BookHeader';
import { BookContent } from './components/BookContent';
import { ChapterMenu } from './components/ChapterMenu';

export default function App() {
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [pageMode, setPageMode] = useState<'single' | 'double'>('double');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState('none');

  const totalPages = 324;

  const bookInfo = {
    title: "The Midnight Garden",
    author: "Eleanor Whitmore"
  };

  const chapters = [
    { id: 0, title: 'Chapter 1: The Beginning', page: 1 },
    { id: 1, title: 'Chapter 2: The Journey', page: 45 },
    { id: 2, title: 'Chapter 3: The Discovery', page: 89 },
    { id: 3, title: 'Chapter 4: The Challenge', page: 134 },
    { id: 4, title: 'Chapter 5: The Truth', page: 178 },
    { id: 5, title: 'Chapter 6: The Resolution', page: 223 },
    { id: 6, title: 'Chapter 7: New Horizons', page: 267 },
    { id: 7, title: 'Epilogue', page: 310 },
  ];

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleChapterSelect = (chapterId: number) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      setCurrentPage(chapter.page);
      setCurrentChapter(chapterId);
    }
    setIsChapterMenuOpen(false);
  };

  const handlePageJump = (page: number) => {
    setCurrentPage(page);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.log('Fullscreen error:', err);
    }
  };

  const themeColors = {
    light: 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-gray-900',
    sepia: 'bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 text-amber-950',
    dark: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-gray-100'
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${themeColors[theme]} transition-colors duration-300 relative`}>
      <BookHeader
        bookInfo={bookInfo}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        theme={theme}
        onThemeChange={setTheme}
        pageMode={pageMode}
        onPageModeChange={setPageMode}
        currentPage={currentPage}
        totalPages={totalPages}
        backgroundMusic={backgroundMusic}
        onBackgroundMusicChange={setBackgroundMusic}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onPageJump={handlePageJump}
      />
      
      {/* Horizontal Progress Bar - Top */}
      <div className="w-full h-1 bg-gray-300/20 dark:bg-gray-700/20 relative">
        <div 
          className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-gray-400 transition-all duration-300"
          style={{ width: `${(currentPage / totalPages) * 100}%` }}
        />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <ChapterMenu
          chapters={chapters}
          currentChapter={currentChapter}
          isOpen={isChapterMenuOpen}
          onToggle={() => setIsChapterMenuOpen(!isChapterMenuOpen)}
          onChapterSelect={handleChapterSelect}
          theme={theme}
        />
        
        <BookContent
          fontSize={fontSize}
          pageMode={pageMode}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          theme={theme}
          isChapterMenuOpen={isChapterMenuOpen}
        />
      </div>
    </div>
  );
}