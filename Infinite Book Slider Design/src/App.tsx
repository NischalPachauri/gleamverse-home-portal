import { BookCarousel } from "./components/BookCarousel";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-white mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent animate-pulse text-5xl">
            📚 Dive Into Your Next Adventure
          </h1>
        </div>
        <BookCarousel />
      </div>
    </div>
  );
}