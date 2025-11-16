export type MetadataOverride = {
  author?: string;
  genre?: string;
  genres?: string[];
  pages?: number;
};

const overrides: Record<string, MetadataOverride> = {
  "28": { author: "James Clear", genre: "Self-Help" },
  "26": { author: "Dan Brown", genre: "Thriller" },
  "44": { author: "Fyodor Dostoevsky", genre: "Classic" },
  "232": { author: "Mark Twain", genre: "Classic" },
};

const genreKeywords: Record<string, string[]> = {
  Fantasy: ['harry potter', 'hobbit', 'tolkien', 'wizard', 'magic'],
  Romance: ['love', 'girlfriend', 'boyfriend', 'romance', 'heart'],
  Mystery: ['mystery', 'detective', 'sherlock', 'crime', 'murder'],
  Thriller: ['thriller', 'jackal', 'origin', 'symbol', 'code'],
  Classic: ['dostoevsky', 'tolstoy', 'shakespeare', 'ulysses', 'gatsby', 'mockingbird', 'monte cristo'],
  SelfHelp: ['habits', 'secret', 'power of now', 'monk', 'psychology of money', 'think and grow rich'],
  Biography: ['biography', 'autobiography', 'memoirs', 'franklin', 'steve jobs', 'wings of fire'],
  Philosophy: ['gita', 'odyssey', 'iliad', 'prophet', 'prince', 'earnest'],
  Children: ['mudge', 'grandma', 'fairy', 'mermaid', 'caterpillar'],
  Science: ['physics', 'microbiology', 'black hole', 'time machine'],
  Business: ['investor', 'poor dad', 'zero to one', 'millionaire'],
};

function inferGenresFromTitle(title: string): string[] {
  const inferred = classifyGenres({ title });
  return inferred.length ? inferred : ['General'];
}

export const applyMetadata = <T extends { id: string; author: string; genre: string; pages?: number; title?: string }>(book: T): T & { genres?: string[] } => {
  const o = overrides[book.id];
  const inferred = classifyGenres({ title: (book as any).title ?? '', author: (book as any).author ?? '', description: (book as any).description ?? '', tags: (book as any).tags ?? [] });
  const primary = o?.genre ?? (book.genre === 'General' ? inferred[0] : book.genre);
  const limited = (o?.genres ?? inferred).slice(0, 5);
  if (limited.length === 0) limited.push('General');
  const desc = ensureDescription((book as any).title ?? '', (o?.author ?? book.author) || '', primary, limited);
  return {
    ...book,
    author: o?.author ?? book.author,
    genre: primary,
    genres: limited,
    genreDescriptions: Object.fromEntries(limited.map(g => [g, genreDescription(g as any)])),
    description: (book as any).description && (book as any).description.length > 120 ? (book as any).description : desc,
    pages: o?.pages ?? book.pages,
  } as T & { genres?: string[] };
};

function ensureDescription(title: string, author: string, primary: string, genres: string[]): string {
  const g = Array.from(new Set([primary, ...genres])).slice(0,5).join(', ');
  const base = `${title} is a compelling ${primary.toLowerCase()} title that blends themes across ${g}. Written by ${author || 'an acclaimed author'}, it invites readers into a richly realized world of ideas, characters, and emotions. Through careful pacing and vivid detail, the book provides accessible entry points for new readers while rewarding those who linger over its nuances.

Across its chapters, ${title} explores questions that resonate beyond the page—identity, choice, and the consequences of action—while maintaining a clear narrative thread. Its prose balances clarity with lyricism, making it equally suitable for focused study and casual reading. The structure encourages gradual immersion, and each section offers memorable moments that contribute to a satisfying whole.

Whether you are seeking an introduction to ${primary.toLowerCase()} or looking to deepen your appreciation of the genre, ${title} offers breadth without sacrificing depth. Readers who enjoy the interplay of character motivation and thematic development will find much to contemplate. With thoughtful pacing, authentic stakes, and a strong sense of place, ${title} remains engaging from beginning to end.`;
  // Clamp to ~180-220 words
  const words = base.split(/\s+/);
  if (words.length > 240) return words.slice(0, 240).join(' ') + '…';
  if (words.length < 150) return base + ' It is a concise yet immersive read that rewards attention and invites reflection.';
  return base;
}
import { classifyGenres, genreDescription } from './genreClassifier';

