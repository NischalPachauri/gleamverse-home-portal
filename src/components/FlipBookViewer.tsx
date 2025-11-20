import React, { useEffect, useRef, useState } from 'react';
import $ from 'jquery';
import * as THREE from 'three';
import { pdfjs } from 'react-pdf';

// Polyfill for pdfjs LinkTarget which might be missing in newer versions
if (!(pdfjs as any).LinkTarget) {
    (pdfjs as any).LinkTarget = {
        NONE: 0,
        SELF: 1,
        BLANK: 2,
        PARENT: 3,
        TOP: 4,
    };
}

// Ensure jQuery, THREE, and pdfjsLib are available globally
if (typeof window !== 'undefined') {
    (window as any).jQuery = $;
    (window as any).$ = $;
    (window as any).THREE = THREE;
    (window as any).pdfjsLib = pdfjs;
    pdfjs.GlobalWorkerOptions.workerSrc = '/lib/pdf.worker.min.js';
}

interface FlipBookViewerProps {
    pdfPath: string;
    startPage?: number;
    onPageChange?: (page: number) => void;
    theme?: 'light' | 'dark';
    onLoadError?: (error: Error) => void;
    onLoadSuccess?: () => void;
}

export const FlipBookViewer: React.FC<FlipBookViewerProps> = ({
    pdfPath,
    startPage = 1,
    onPageChange,
    theme = 'light',
    onLoadError,
    onLoadSuccess,
}) => {
    const bookRef = useRef<HTMLDivElement>(null);
    const [instance, setInstance] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPageNum, setCurrentPageNum] = useState<number>(startPage);
    const [totalPagesNum, setTotalPagesNum] = useState<number>(0);

    useEffect(() => {
        const loadScript = (src: string) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        };

        const loadStyle = (href: string) => {
            if (document.querySelector(`link[href="${href}"]`)) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        };

        const initBook = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load CSS
                loadStyle('/lib/flipbook.style.css');

                // Step 1: Load main flipbook library
                console.log('FlipBookViewer: Loading flipbook.min.js');
                await loadScript('/lib/flipbook.min.js');

                // Step 2: Load PdfService polyfill
                console.log('FlipBookViewer: Loading flipbook.pdfservice.min.js');
                await loadScript('/lib/flipbook.pdfservice.min.js');

                // Step 3: Load Book3 polyfill
                console.log('FlipBookViewer: Loading flipbook.book3.min.js');
                await loadScript('/lib/flipbook.book3.min.js');

                // Step 4: Configure PDF.js worker
                if (pdfjs.version) {
                    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
                    console.log(`FlipBookViewer: Setting worker to ${pdfjs.GlobalWorkerOptions.workerSrc}`);
                } else {
                    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
                    console.log('FlipBookViewer: PDFJS version not found, using fallback worker');
                }

                // Step 5: Verify FLIPBOOK and required modules exist
                if (!(window as any).FLIPBOOK) {
                    throw new Error('FLIPBOOK library not loaded');
                }

                console.log('FlipBookViewer: FLIPBOOK.PdfService exists:', !!(window as any).FLIPBOOK.PdfService);
                console.log('FlipBookViewer: FLIPBOOK.Book3 exists:', !!(window as any).FLIPBOOK.Book3);

                // Step 6: Load PDF to get page count
                console.log(`FlipBookViewer: Loading PDF to get page count: ${pdfPath}`);
                const loadingTask = pdfjs.getDocument(pdfPath);
                const pdf = await loadingTask.promise;
                const pageCount = pdf.numPages;
                console.log(`FlipBookViewer: PDF has ${pageCount} pages`);
                setTotalPagesNum(pageCount);

                // Step 7: Initialize FLIPBOOK.Main
                if (bookRef.current && (window as any).FLIPBOOK) {
                    console.log("FlipBookViewer: Initializing FLIPBOOK.Main");

                    const book = new (window as any).FLIPBOOK.Main({
                        pdfUrl: pdfPath,
                        startPage: startPage,
                        viewMode: '2d',
                        skin: theme,
                        lightBox: false,
                        singlePageMode: false,
                        assets: {
                            preloader: '/lib/images/preloader.jpg',
                            overlay: '/lib/images/overlay.png',
                            flipMp3: '/lib/images/turnPage.mp3',
                            spinner: '/lib/images/spinner.gif'
                        },
                        onPageChange: (page: number) => {
                            setCurrentPageNum(page);
                            if (onPageChange) onPageChange(page);
                        },
                        container: bookRef.current
                    }, bookRef.current);

                    setInstance(book);
                    setLoading(false);
                    if (onLoadSuccess) onLoadSuccess();
                } else {
                    throw new Error('Flipbook library not available');
                }
            } catch (e: any) {
                setLoading(false);
                const msg = e?.message || 'Failed to initialize PDF viewer';
                setError(msg);
                console.error('FlipBookViewer: Initialization error:', e);
                if (onLoadError) onLoadError(e instanceof Error ? e : new Error(msg));
                if (bookRef.current) {
                    $(bookRef.current).empty();
                }
            }
        };

        initBook();

        return () => {
            if (bookRef.current) {
                $(bookRef.current).empty();
            }
        };
    }, [pdfPath, theme]);

    const handleNextPage = () => {
        if (currentPageNum < totalPagesNum) {
            const nextPage = currentPageNum + 1;
            setCurrentPageNum(nextPage);
            if (instance && instance.goToPage) {
                instance.goToPage(nextPage);
            }
            if (onPageChange) onPageChange(nextPage);
        }
    };

    const handlePrevPage = () => {
        if (currentPageNum > 1) {
            const prevPage = currentPageNum - 1;
            setCurrentPageNum(prevPage);
            if (instance && instance.goToPage) {
                instance.goToPage(prevPage);
            }
            if (onPageChange) onPageChange(prevPage);
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {loading && !error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.9)', zIndex: 10 }}>
                    <span>Loading PDF…</span>
                </div>
            )}
            {error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red', gap: 12, flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.9)', zIndex: 10 }}>
                    <span>{error}</span>
                    <a href={pdfPath} download style={{ textDecoration: 'underline' }}>Download PDF</a>
                </div>
            )}

            {/* Navigation Controls */}
            {!loading && !error && totalPagesNum > 0 && (
                <>
                    {/* Previous Page Button */}
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPageNum <= 1}
                        style={{
                            position: 'absolute',
                            left: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 20,
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            border: '2px solid rgba(0,0,0,0.2)',
                            backgroundColor: 'white',
                            cursor: currentPageNum <= 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPageNum <= 1 ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (currentPageNum > 1) {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                        }}
                        aria-label="Previous page"
                    >
                        ‹
                    </button>

                    {/* Next Page Button */}
                    <button
                        onClick={handleNextPage}
                        disabled={currentPageNum >= totalPagesNum}
                        style={{
                            position: 'absolute',
                            right: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 20,
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            border: '2px solid rgba(0,0,0,0.2)',
                            backgroundColor: 'white',
                            cursor: currentPageNum >= totalPagesNum ? 'not-allowed' : 'pointer',
                            opacity: currentPageNum >= totalPagesNum ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (currentPageNum < totalPagesNum) {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                        }}
                        aria-label="Next page"
                    >
                        ›
                    </button>

                    {/* Page Counter */}
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 20,
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        Page {currentPageNum} of {totalPagesNum}
                    </div>
                </>
            )}

            <div
                ref={bookRef}
                style={{ width: '100%', height: '100%', position: 'relative' }}
                className="flipbook-container"
            />
        </div>
    );
};
