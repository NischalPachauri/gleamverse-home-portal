import React, { useEffect, useState } from 'react';
import { getBookCover } from '../utils/bookCoverMapping';

const ERROR_IMG_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

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
  const coverCache = (window as any).__coverCache || ((window as any).__coverCache = new Map<string, Promise<void>>());
  const imageMetrics = (window as any).__imageMetrics || ((window as any).__imageMetrics = { success: 0, failure: 0 });

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    try {
      const coverSrc = getBookCover(bookTitle);
      if (!coverSrc) {
        setImgSrc('/BookCoversNew/default-book-cover.png');
        setIsLoading(false);
        return;
      }
      const ensureLoaded = () => new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = coverSrc;
        img.decoding = 'async' as any;
      });
      const cached = coverCache.get(coverSrc);
      const promise = cached || ensureLoaded();
      if (!cached) coverCache.set(coverSrc, promise);
      promise
        .then(() => {
          imageMetrics.success++;
          setImgSrc(coverSrc);
        })
        .catch(() => {
          setImgSrc('/BookCoversNew/default-book-cover.png');
          setHasError(true);
          imageMetrics.failure++;
          if (onError) onError();
        });
    } catch (error) {
      console.error(`Error fetching book cover for "${bookTitle}":`, error);
      setImgSrc('/BookCoversNew/default-book-cover.png');
      setHasError(true);
      imageMetrics.failure++;
      if (onError) onError();
    }
  }, [bookTitle, onError]);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    console.warn(`Image failed to load: ${imgSrc}. Using fallback image.`);
    const fallback = '/BookCoversNew/default-book-cover.png';
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
    setHasError(true);
    setIsLoading(false);
    imageMetrics.failure++;
    if (onError) onError();
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50">
          <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
      )}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={{...style, objectFit: 'cover'}}
          onLoad={handleLoad}
          onError={handleError}
          data-original-title={bookTitle}
          loading="lazy"
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
          className={`${className} opacity-40`}
          style={{...style, objectFit: 'cover'}}
          aria-hidden
        />
      )}
    </div>
  );
};

export default EnhancedImage;
