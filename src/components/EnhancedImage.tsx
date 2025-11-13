import React, { useEffect, useState, useCallback } from 'react';
import { getBookCover } from '../utils/bookCoverMapping';

const ERROR_IMG_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

// Global cache for book covers to ensure consistency
const globalCoverCache = new Map<string, { src: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface EnhancedImageProps {
  bookTitle: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

const EnhancedImage: React.FC<EnhancedImageProps> = ({
  bookTitle,
  alt,
  width,
  height,
  className = '',
  style,
  onLoad,
  onError,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const coverCache = (window as typeof window & { __coverCache?: Map<string, Promise<void>> }).__coverCache || ((window as any).__coverCache = new Map<string, Promise<void>>());
  const imageMetrics = (window as typeof window & { __imageMetrics?: { success: number; failure: number } }).__imageMetrics || ((window as any).__imageMetrics = { success: 0, failure: 0 });

  const loadCover = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Check global cache first
      const cacheKey = bookTitle.toLowerCase().trim();
      const cached = globalCoverCache.get(cacheKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setImgSrc(cached.src);
        imageMetrics.success++;
        setIsLoading(false);
        if (onLoad) onLoad();
        return;
      }
      
      const coverSrc = getBookCover(bookTitle);
      if (!coverSrc) {
        const fallbackSrc = '/BookCoversNew/default-book-cover.png';
        setImgSrc(fallbackSrc);
        globalCoverCache.set(cacheKey, { src: fallbackSrc, timestamp: now });
        setIsLoading(false);
        if (onLoad) onLoad();
        return;
      }
      
      // Enhanced loading with retry mechanism
      const loadWithRetry = async (src: string, retries = 2): Promise<void> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          
          img.onload = () => {
            imageMetrics.success++;
            globalCoverCache.set(cacheKey, { src, timestamp: now });
            setImgSrc(src);
            setIsLoading(false);
            if (onLoad) onLoad();
            resolve();
          };
          
          img.onerror = () => {
            if (retries > 0) {
              setTimeout(() => {
                loadWithRetry(src, retries - 1).then(resolve).catch(reject);
              }, 500);
            } else {
              reject(new Error('Image failed to load after retries'));
            }
          };
          
          img.src = src;
          img.decoding = 'async' as any;
          img.fetchpriority = 'high';
          img.loading = 'eager';
        });
      };
      
      await loadWithRetry(coverSrc);
      
    } catch (error) {
      console.warn(`Failed to load cover for "${bookTitle}":`, error);
      setImgSrc(ERROR_IMG_SRC);
      setHasError(true);
      imageMetrics.failure++;
      setIsLoading(false);
      if (onError) onError();
    }
  }, [bookTitle, onLoad, onError]);

  useEffect(() => {
    loadCover();
  }, [loadCover]);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    console.warn(`Image failed to load: ${imgSrc}. Using fallback image.`);
    setImgSrc(ERROR_IMG_SRC);
    setHasError(true);
    setIsLoading(false);
    imageMetrics.failure++;
    if (onError) onError();
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800/30 to-slate-900/50 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-all duration-500 ease-in-out transform hover:scale-105`}
          style={{...style, objectFit: 'cover'}}
          onLoad={handleLoad}
          onError={handleError}
          data-original-title={bookTitle}
          loading="eager"
          fetchpriority="high"
          {...rest}
        />
      )}
      {!imgSrc && (
        <img
          src={"/BookCoversNew/default-book-cover.png"}
          alt={alt}
          width={width}
          height={height}
          className={`${className} opacity-40 transition-opacity duration-300`}
          style={{...style, objectFit: 'cover'}}
          aria-hidden
        />
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-900/20 rounded-lg">
          <div className="text-center p-4">
            <div className="text-red-400 text-lg mb-1">⚠️</div>
            <div className="text-xs text-red-300">Cover unavailable</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedImage;
