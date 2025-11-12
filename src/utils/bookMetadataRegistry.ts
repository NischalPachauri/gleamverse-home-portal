export type MetadataOverride = {
  author?: string;
  genre?: string;
  pages?: number;
};

const overrides: Record<string, MetadataOverride> = {
  "28": { author: "James Clear", genre: "Self-Help" },
  "26": { author: "Dan Brown", genre: "Thriller" },
  "44": { author: "Fyodor Dostoevsky", genre: "Classic" },
  "232": { author: "Mark Twain", genre: "Classic" },
};

export const applyMetadata = <T extends { id: string; author: string; genre: string; pages?: number }>(book: T): T => {
  const o = overrides[book.id];
  if (!o) return book;
  return {
    ...book,
    author: o.author ?? book.author,
    genre: o.genre ?? book.genre,
    pages: o.pages ?? book.pages,
  };
};

