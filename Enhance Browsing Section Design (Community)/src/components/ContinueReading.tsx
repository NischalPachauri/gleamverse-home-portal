import { BookOpen, X } from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useRef } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  gradient: string;
}

const initialBooks: Book[] = [
  {
    id: '1',
    title: '2 States: The Story of My Marriage',
    author: 'Chetan Bhagat',
    coverImage: 'https://images.unsplash.com/photo-1711185900590-b118146e3988?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBmYW50YXN5fGVufDF8fHx8MTc2MzIwNDY2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500'
  },
  {
    id: '2',
    title: '50 Stories in Easy English',
    author: 'Various Authors',
    coverImage: 'https://images.unsplash.com/photo-1730451311261-f3be1366a6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjByb21hbmNlfGVufDF8fHx8MTc2MzI1OTM1MXww&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500'
  },
  {
    id: '3',
    title: 'A Day in the Life',
    author: 'Robert Greenfield',
    coverImage: 'https://images.unsplash.com/photo-1758796629109-4f38e9374f45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBmaWN0aW9ufGVufDF8fHx8MTc2MzI1ODYyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-purple-500 via-violet-500 to-indigo-500'
  },
  {
    id: '4',
    title: 'Harry Potter and the Goblet of Fire',
    author: 'J.K. Rowling',
    coverImage: 'https://images.unsplash.com/photo-1604435062356-a880b007922c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBteXN0ZXJ5fGVufDF8fHx8MTc2MzI0NTA5NXww&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500'
  },
  {
    id: '5',
    title: 'Harry Potter: Complete Collection',
    author: 'J.K. Rowling',
    coverImage: 'https://images.unsplash.com/photo-1696947833843-9707b58254fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjB0aHJpbGxlcnxlbnwxfHx8fDE3NjMyNDYzMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-red-500 via-orange-500 to-amber-500'
  },
];

export default function ContinueReading() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const handleRemoveBook = (bookId: string) => {
    setBooks(books.filter(book => book.id !== bookId));
  };

  return (
    <section ref={ref} className="w-full py-16 px-4 relative overflow-hidden">
      {/* Background gradient decorations with parallax */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute top-1/2 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" 
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2.5 shadow-lg">
              <BookOpen className="w-full h-full text-white" />
            </div>
            <h2 className="relative text-4xl">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Continue Your Journey
              </span>
            </h2>
          </div>
          <p className="text-slate-600 text-lg mt-6">
            Pick up where you left off and complete your reading goals
          </p>
        </motion.div>

        {/* Books Grid */}
        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                layout
                className="group"
              >
                <div className="relative rounded-2xl bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm border border-slate-200/80 p-4 transition-all duration-300 hover:border-transparent hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden h-full">
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${book.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Book Cover */}
                  <div className="relative mb-4 rounded-xl overflow-hidden aspect-[3/4] bg-slate-100">
                    <ImageWithFallback
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Remove Button on Book Cover */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveBook(book.id)}
                      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-red-500/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-xl hover:bg-red-600 hover:shadow-red-500/50"
                      aria-label="Remove book"
                    >
                      <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </motion.button>
                  </div>

                  {/* Book Info */}
                  <div className="relative space-y-2">
                    <h3 className="text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-slate-600">
                      {book.author}
                    </p>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm border border-slate-200/80 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-slate-600 text-xl mb-2">No books in your reading list</h3>
            <p className="text-slate-500">Start exploring to add new books to continue reading</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}