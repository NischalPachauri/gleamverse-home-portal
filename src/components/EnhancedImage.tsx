import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchBookCover = () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const coverSrc = getBookCover(bookTitle);
        setImgSrc(coverSrc);
      } catch (error) {
        console.error(`Error fetching book cover for "${bookTitle}":`, error);
        setImgSrc(ERROR_IMG_SRC);
        setHasError(true);
        if (onError) onError();
      }
    };

    fetchBookCover();
  }, [bookTitle, onError]);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    console.warn(`Image failed to load: ${imgSrc}. Using fallback image.`);
    setImgSrc(ERROR_IMG_SRC);
    setHasError(true);
    setIsLoading(false);
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
          {...rest}
        />
      )}
    </div>
  );
};

export default EnhancedImage;
