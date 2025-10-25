import exampleImage from 'figma:asset/cb3c75528541c02032ee12c8725bf93d049a5251.png';

export default function App() {
  // Diverse collection of trending books
  const trendingBooks = [
    {
      id: 1,
      title: "World's Best Boyfriend",
      author: "by Durjoy Datta",
      bgColor: "bg-gradient-to-br from-pink-500 to-rose-600"
    },
    {
      id: 2,
      title: "Harry Potter and the Deathly Hallows",
      author: "by J.K. Rowling",
      bgColor: "bg-gradient-to-br from-purple-500 to-violet-600"
    },
    {
      id: 3,
      title: "The Alchemist",
      author: "by Paulo Coelho",
      bgColor: "bg-gradient-to-br from-amber-500 to-orange-600"
    },
    {
      id: 4,
      title: "1984",
      author: "by George Orwell",
      bgColor: "bg-gradient-to-br from-slate-600 to-gray-700"
    },
    {
      id: 5,
      title: "To Kill a Mockingbird",
      author: "by Harper Lee",
      bgColor: "bg-gradient-to-br from-emerald-500 to-teal-600"
    },
    {
      id: 6,
      title: "The Great Gatsby",
      author: "by F. Scott Fitzgerald",
      bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500"
    },
    {
      id: 7,
      title: "Pride and Prejudice",
      author: "by Jane Austen",
      bgColor: "bg-gradient-to-br from-rose-400 to-pink-500"
    },
    {
      id: 8,
      title: "The Catcher in the Rye",
      author: "by J.D. Salinger",
      bgColor: "bg-gradient-to-br from-blue-500 to-indigo-600"
    },
    {
      id: 9,
      title: "Brave New World",
      author: "by Aldous Huxley",
      bgColor: "bg-gradient-to-br from-cyan-500 to-blue-600"
    },
    {
      id: 10,
      title: "The Hobbit",
      author: "by J.R.R. Tolkien",
      bgColor: "bg-gradient-to-br from-green-600 to-emerald-700"
    },
    {
      id: 11,
      title: "Fahrenheit 451",
      author: "by Ray Bradbury",
      bgColor: "bg-gradient-to-br from-red-500 to-orange-600"
    },
    {
      id: 12,
      title: "Lord of the Flies",
      author: "by William Golding",
      bgColor: "bg-gradient-to-br from-lime-500 to-green-600"
    },
    {
      id: 13,
      title: "The Book Thief",
      author: "by Markus Zusak",
      bgColor: "bg-gradient-to-br from-stone-500 to-neutral-600"
    },
    {
      id: 14,
      title: "Moby Dick",
      author: "by Herman Melville",
      bgColor: "bg-gradient-to-br from-sky-600 to-blue-700"
    },
    {
      id: 15,
      title: "Jane Eyre",
      author: "by Charlotte Brontë",
      bgColor: "bg-gradient-to-br from-violet-500 to-purple-600"
    },
    {
      id: 16,
      title: "Wuthering Heights",
      author: "by Emily Brontë",
      bgColor: "bg-gradient-to-br from-fuchsia-500 to-pink-600"
    },
  ];

  // Duplicate books for seamless infinite scroll
  const duplicatedBooks = [...trendingBooks, ...trendingBooks];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:bg-gradient-to-b dark:from-[#1a2b4a] dark:via-[#1e3a5f] dark:to-[#1a2b4a] relative overflow-hidden">
      {/* Decorative patterns for light theme */}
      <div className="absolute inset-0 opacity-30 dark:opacity-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-1/4 w-36 h-36 bg-cyan-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/3 w-44 h-44 bg-blue-300/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-14 relative z-10">
        {/* Trending Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-cyan-600 dark:text-cyan-400">
            🔥 Hot Reads Right Now
          </h2>
          
          {/* Infinite Scroll Container */}
          <div className="relative overflow-hidden">
            {/* Scrolling Books */}
            <div className="flex gap-5 animate-scroll">
              {duplicatedBooks.map((book, index) => (
                <div
                  key={`${book.id}-${index}`}
                  className="flex-shrink-0 w-[150px] group cursor-pointer"
                >
                  <div className={`${book.bgColor} rounded-lg p-5 h-[204px] flex flex-col justify-between shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/20`}>
                    <div className="flex flex-col gap-2">
                      <div className="text-white/90 text-xs uppercase tracking-wider opacity-80">
                        Now Reading
                      </div>
                      <div className="h-16 flex items-center">
                        <h3 className="text-white line-clamp-3">
                          {book.title}
                        </h3>
                      </div>
                    </div>
                    <div className="text-white/70 text-sm">
                      {book.author}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Browse Collection Section */}
        <div className="border-t border-cyan-500/20 dark:border-cyan-500/30 pt-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-4xl text-gray-900 dark:text-white">
              Explore Our Collection
            </h2>
            <p className="text-gray-500 dark:text-cyan-300/60">
              Showing <span className="text-cyan-600 dark:text-cyan-400">16</span> of <span className="text-cyan-600 dark:text-cyan-400">273</span> books
            </p>
          </div>
          
          {/* Placeholder for book grid */}
          <div className="text-center text-gray-400 dark:text-cyan-300/40 py-12">
            Your book collection grid goes here
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-scroll {
          animation: scroll 7.5s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
