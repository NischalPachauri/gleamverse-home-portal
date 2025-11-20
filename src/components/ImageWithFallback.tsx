import React, { useEffect, useState } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  priority?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = ERROR_IMG_SRC,
  width,
  height,
  className = '',
  style,
  onLoad,
  onError,
  priority = false,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const imageMetrics = window.__imageMetrics || (window.__imageMetrics = { success: 0, failure: 0, records: [] });
  const coverCache = window.__coverCache || (window.__coverCache = new Map<string, Promise<void>>());
  const coverLoaded: Set<string> = window.__coverLoaded || (window.__coverLoaded = new Set<string>());

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(!coverLoaded.has(src));
    setHasError(false);
    if (src) {
      const ensureLoaded = () => new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => { coverLoaded.add(src); resolve(); };
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = src;
        img.decoding = 'async';
      });
      if (!coverCache.get(src)) {
        coverCache.set(src, ensureLoaded());
      }
    }
  }, [src]);

  const handleError = () => {
    const maxRetries = 2;
    const retryCount = window.__imgRetries?.[imgSrc] ?? 0;
    if (imgSrc !== fallbackSrc) {
      if (retryCount < maxRetries) {
        window.__imgRetries = { ...(window.__imgRetries || {}), [imgSrc]: retryCount + 1 };
        setTimeout(() => {
          setIsLoading(true);
          setHasError(false);
          setImgSrc(imgSrc);
        }, 300 * Math.pow(2, retryCount));
        return;
      } else {
        console.warn(`Image failed to load: ${imgSrc}. Using fallback image.`);
        setImgSrc(fallbackSrc);
        setHasError(true);
        imageMetrics.failure++;
        if (onError) onError();
      }
    } else {
      // If even the fallback fails, use inline SVG as final fallback
        console.error(`Critical: Both image and fallback failed to load: ${src}`);
      setIsLoading(false);
    }
    coverLoaded.add(fallbackSrc);
    setIsLoading(false);
  };

  const handleLoad = () => {
    coverLoaded.add(imgSrc);
    setIsLoading(false);
    imageMetrics.success++;
    if (onLoad) onLoad();
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && !priority && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50">
          <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{...style, objectFit: 'cover'}}
        onError={handleError}
        onLoad={handleLoad}
        data-original-url={hasError ? src : undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        // use lower-case attribute to avoid TS/DOM prop issues
        {...(priority ? { fetchpriority: 'high' } : {})}
        {...rest}
      />
    </div>
  );
}

export default ImageWithFallback;
declare global {
  interface Window {
    __imageMetrics?: { success: number; failure: number; records: { title: string; src: string; success: boolean; duration: number; ts: number; }[] };
    __coverCache?: Map<string, Promise<void>>;
    __coverLoaded?: Set<string>;
    __imgRetries?: Record<string, number>;
  }
}
