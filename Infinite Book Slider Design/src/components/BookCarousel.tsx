import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookCard } from "./BookCard";

export interface Book {
  id: number;
  title: string;
  description: string;
  genres: string[];
  coverImage: string;
  status: string;
}

const books: Book[] = [
  {
    id: 1,
    title: "The Midnight Library",
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived...",
    genres: ["Fiction", "Fantasy", "Philosophy"],
    coverImage: "https://images.unsplash.com/photo-1758796629109-4f38e9374f45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBmaWN0aW9ufGVufDF8fHx8MTc2MzcwMTYwNHww&ixlib=rb-4.1.0&q=80&w=1080",
    status: "Releasing"
  },
  {
    id: 2,
    title: "Shadow of the Wind",
    description: "A haunting tale set in post-war Barcelona where a young boy discovers a mysterious book that will change his life forever...",
    genres: ["Mystery", "Historical", "Drama"],
    coverImage: "https://images.unsplash.com/photo-1711185892188-13f35959d3ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwYm9vayUyMGNvdmVyfGVufDF8fHx8MTc2MzYyMTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    status: "Releasing"
  },
  {
    id: 3,
    title: "The Silent Patient",
    description: "Alicia Berenson's life is seemingly perfect. One day she shoots her husband and then never speaks another word. A criminal psychotherapist becomes obsessed with uncovering her motive...",
    genres: ["Thriller", "Mystery", "Psychological"],
    coverImage: "https://images.unsplash.com/photo-1604435062356-a880b007922c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwYm9vayUyMGNvdmVyfGVufDF8fHx8MTc2MzY4MjIwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    status: "Releasing"
  },
  {
    id: 4,
    title: "Project Hail Mary",
    description: "A lone astronaut must save the earth from disaster in this stunning science-fiction thriller from the author of The Martian...",
    genres: ["Sci-Fi", "Adventure", "Thriller"],
    coverImage: "https://images.unsplash.com/photo-1698954634383-eba274a1b1c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwZmljdGlvbiUyMGJvb2t8ZW58MXx8fHwxNzYzNjMxMjc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    status: "Releasing"
  },
  {
    id: 5,
    title: "The Seven Husbands of Evelyn Hugo",
    description: "Aging Hollywood icon Evelyn Hugo finally agrees to tell her story. But when she chooses unknown magazine reporter Monique Grant for the job, no one is more astounded than Monique herself...",
    genres: ["Romance", "Historical", "Drama"],
    coverImage: "https://images.unsplash.com/photo-1711185901354-73cb6b666c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbmNlJTIwbm92ZWwlMjBjb3ZlcnxlbnwxfHx8fDE3NjM2OTk5Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    status: "Releasing"
  },
  {
    id: 6,
    title: "Gone Girl",
    description: "On a warm summer morning, Nick Dunne returns home to find that his wife Amy has vanished. The police immediately suspect Nick in her disappearance...",
    genres: ["Thriller", "Mystery", "Crime"],
    coverImage: "https://images.unsplash.com/photo-1696947833843-9707b58254fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJpbGxlciUyMGJvb2slMjBjb3ZlcnxlbnwxfHx8fDE3NjM3MzMxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    status: "Releasing"
  }
];

export function BookCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  
  // Number of books to show at once
  const booksPerView = 3;
  
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % books.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(timer);
  }, []);

  // Get visible books with wrapping
  const getVisibleBooks = () => {
    const visible: Book[] = [];
    for (let i = 0; i < booksPerView; i++) {
      const index = (currentIndex + i) % books.length;
      visible.push(books[index]);
    }
    return visible;
  };

  const visibleBooks = getVisibleBooks();

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0
    })
  };

  return (
    <div className="relative overflow-visible px-16">
      <div className="flex gap-6 relative">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {visibleBooks.map((book) => (
            <motion.div
              key={`${book.id}-${currentIndex}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="flex-1 min-w-0"
            >
              <BookCard book={book} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Navigation arrows */}
      <button
        onClick={() => {
          setDirection(-1);
          setCurrentIndex((prev) => (prev - 1 + books.length) % books.length);
        }}
        className="absolute -left-6 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white p-4 rounded-full shadow-2xl shadow-purple-500/50 transition-all hover:scale-110 z-10 border-2 border-purple-400/50"
        aria-label="Previous book"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      
      <button
        onClick={() => {
          setDirection(1);
          setCurrentIndex((prev) => (prev + 1) % books.length);
        }}
        className="absolute -right-6 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white p-4 rounded-full shadow-2xl shadow-purple-500/50 transition-all hover:scale-110 z-10 border-2 border-purple-400/50"
        aria-label="Next book"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}