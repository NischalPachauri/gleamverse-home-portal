import React, { useEffect, useState, useRef } from 'react';
import { getBookCover } from '../utils/bookCoverMapping';
declare global {
  interface Window {
    __coverCache?: Map<string, Promise<void>>;
    __imageMetrics?: { success: number; failure: number; records: { title: string; src: string | null; success: boolean; duration: number; ts: number }[] };
    __imgRetries?: Record<string, number>;
  }
}

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
  const coverCache = React.useMemo(() => window.__coverCache ?? (window.__coverCache = new Map<string, Promise<void>>()), []);
  const imageMetrics = React.useMemo(() => {
    const m = window.__imageMetrics ?? (window.__imageMetrics = { success: 0, failure: 0, records: [] })
    if (!Array.isArray(m.records)) m.records = []
    return m
  }, []);
  const startRef = useRef<number>(performance.now());

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    try {
      const coverSrc = getBookCover(bookTitle) || '/BookCoversNew/default-book-cover.png';
      setImgSrc(coverSrc);
      if (coverSrc && !coverCache.get(coverSrc)) {
        const preload = new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = coverSrc;
          img.decoding = 'async';
        });
        preload.catch(() => {});
        coverCache.set(coverSrc, preload);
      }
    } catch (error) {
      console.debug(`Cover mapping failed for "${bookTitle}"`, error);
      setImgSrc('/BookCoversNew/default-book-cover.png');
      setHasError(true);
      imageMetrics.failure++;
      if (onError) onError();
    }
  }, [bookTitle, onError, coverCache, imageMetrics]);

  const handleLoad = () => {
    setIsLoading(false);
    const duration = performance.now() - (startRef.current || performance.now());
    imageMetrics.success++;
    if (Array.isArray(imageMetrics.records)) imageMetrics.records.push({
      title: bookTitle,
      src: imgSrc,
      success: true,
      duration,
      ts: Date.now()
    });
    if (onLoad) onLoad();
  };

  const handleError = () => {
    const fallback = '/placeholder.svg';
    const maxRetries = 2;
    const retries = window.__imgRetries?.[imgSrc || ''] ?? 0;
    if (imgSrc && retries < maxRetries) {
      window.__imgRetries = { ...(window.__imgRetries || {}), [imgSrc]: retries + 1 };
      setTimeout(() => {
        setIsLoading(true);
        setHasError(false);
        setImgSrc(imgSrc);
      }, 300 * Math.pow(2, retries));
    } else if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
    setHasError(true);
    setIsLoading(false);
    const duration = performance.now() - (startRef.current || performance.now());
    imageMetrics.failure++;
    if (Array.isArray(imageMetrics.records)) imageMetrics.records.push({
      title: bookTitle,
      src: imgSrc,
      success: false,
      duration,
      ts: Date.now()
    });
    if (onError) onError();
  };

  return (
    <div className="relative w-full h-full">
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          className={className}
          style={{...style, objectFit: 'cover'}}
          onLoad={handleLoad}
          onError={handleError}
          data-original-title={bookTitle}
          loading="lazy"
          fetchPriority="high"
          {...rest}
        />
      )}
      {!imgSrc && (
        <img
          src={'/BookCoversNew/default-book-cover.png'}
          alt={alt}
          width={width}
          height={height}
          className={className}
          style={{...style, objectFit: 'cover'}}
          aria-hidden
        />
      )}
    </div>
  );
};

export default EnhancedImage;
