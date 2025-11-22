import { useEffect, useRef } from "react";
import { CarouselBookCard } from "./CarouselBookCard";
import { books } from "@/data/books";

export function BookCarousel() {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter for Harry Potter books only and duplicate for infinite loop
    const displayBooks = books.filter(book =>
        book.title.toLowerCase().includes('harry potter')
    ).slice(0, 16);

    // Triple the array for seamless infinite scroll
    const infiniteBooks = [...displayBooks, ...displayBooks, ...displayBooks];

    const isPaused = useRef(false);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let animationId: number;
        let scrollPosition = 0;
        const scrollSpeed = 0.5; // pixels per frame

        const animate = () => {
            if (!isPaused.current) {
                scrollPosition += scrollSpeed;

                // Reset position when we've scrolled through one set
                const singleSetWidth = scrollContainer.scrollWidth / 3;
                if (scrollPosition >= singleSetWidth) {
                    scrollPosition = 0;
                }

                scrollContainer.scrollLeft = scrollPosition;
            }
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, []);

    return (
        <div className="relative w-full mx-auto py-8 px-16">
            <div
                ref={scrollRef}
                className="overflow-hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseEnter={() => { isPaused.current = true; }}
                onMouseLeave={() => { isPaused.current = false; }}
            >
                <div className="flex gap-6 h-[420px] items-center" style={{ width: 'max-content' }}>
                    {infiniteBooks.map((book, index) => (
                        <div
                            key={`${book.id}-${index}`}
                            className="flex-shrink-0"
                            style={{ width: '280px' }}
                        >
                            <CarouselBookCard book={book} />
                        </div>
                    ))}
                </div>
            </div>

            <style>
                {`
                    .overflow-hidden::-webkit-scrollbar {
                        display: none;
                    }
                `}
            </style>
        </div>
    );
}
