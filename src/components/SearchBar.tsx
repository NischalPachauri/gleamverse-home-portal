import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { SearchModal } from './SearchModal';

export function SearchBar() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className={`relative flex items-center rounded-full transition-all duration-200 ${
          isFocused 
            ? isDark 
              ? 'bg-slate-700 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/50' 
              : 'bg-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/50'
            : isDark 
              ? 'bg-slate-800/80 hover:bg-slate-700/90' 
              : 'bg-white/90 hover:bg-white shadow-md'
        }`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={openModal}
        role="button"
        aria-label="Open search"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            openModal();
          }
        }}
      >
        <Search className={`h-5 w-5 ml-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        <div 
          className={`px-4 py-3 cursor-pointer ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          Search books...
        </div>
      </div>

      <SearchModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}