import { BookCarousel } from "./BookCarousel";

export function TrendingBooks() {
  return (
    <div className="w-full overflow-hidden mb-8 pt-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-600 dark:from-purple-400 dark:via-fuchsia-400 dark:to-pink-400 bg-clip-text text-transparent">
          📚 Dive into your Next Adventure
        </h2>
      </div>
      <BookCarousel />
    </div>
  );
}
