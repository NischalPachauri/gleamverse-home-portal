import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get list of actual PDF files
const booksDir = path.join(__dirname, 'public/books');
const pdfFiles = fs.readdirSync(booksDir).filter(file => file.endsWith('.pdf'));

console.log(`Found ${pdfFiles.length} PDF files in public/books`);

// Create a comprehensive books array with only existing PDFs
const existingBooks = [];

// Sample of books that should exist based on the PDF files we found
const bookData = [
  { title: "2 States The story of my Marriage", author: "Chetan Bhagat", genre: "Romance", year: 2009, pages: 269, rating: 4.2, tags: ["romance", "comedy", "indian", "marriage"] },
  { title: "A Little Life", author: "Hanya Yanagihara", genre: "Fiction", year: 2015, pages: 720, rating: 4.3, tags: ["fiction", "trauma", "friendship", "contemporary"] },
  { title: "A Second Chance", author: "Chetan Bhagat", genre: "Romance", year: 2014, pages: 300, rating: 3.9, tags: ["romance", "second chance", "love", "relationships"] },
  { title: "A Warrior's Life", author: "Paulo Coelho", genre: "Biography", year: 2009, pages: 464, rating: 4.1, tags: ["biography", "paulo coelho", "writer", "inspirational"] },
  { title: "Accidental Love", author: "Nicholas Sparks", genre: "Romance", year: 2000, pages: 224, rating: 4.0, tags: ["romance", "accidental", "love", "destiny"] },
  { title: "Advantage Love", author: "Novoneel Chakraborty", genre: "Romance", year: 2013, pages: 256, rating: 3.8, tags: ["romance", "contemporary", "indian", "relationships"] },
  { title: "Akbar And Birbal", author: "Anant Pai", genre: "Children", year: 1980, pages: 96, rating: 4.2, tags: ["children", "akbar birbal", "stories", "indian"] },
  { title: "Albert Einstein", author: "Walter Isaacson", genre: "Biography", year: 2007, pages: 675, rating: 4.4, tags: ["biography", "einstein", "science", "physics"] },
  { title: "Angels & Demons", author: "Dan Brown", genre: "Thriller", year: 2000, pages: 616, rating: 3.9, tags: ["thriller", "conspiracy", "vatican", "science"] },
  { title: "Atomic Habits", author: "James Clear", genre: "Self-Help", year: 2018, pages: 320, rating: 4.6, tags: ["habits", "productivity", "self-improvement", "psychology"] },
  { title: "Bared to You", author: "Sylvia Day", genre: "Romance", year: 2012, pages: 334, rating: 4.0, tags: ["romance", "erotic", "relationships", "contemporary"] },
  { title: "CORONAVIRUS", author: "Various", genre: "Science", year: 2020, pages: 200, rating: 3.5, tags: ["coronavirus", "pandemic", "science", "health"] },
  { title: "Charitraheen", author: "Sharatchandra Chattopadhyay", genre: "Classic", year: 1917, pages: 240, rating: 4.0, tags: ["classic", "bengali", "society", "morality"] },
  { title: "Chikitsa Sutra", author: "Ayurveda Texts", genre: "Health", year: 500, pages: 300, rating: 4.1, tags: ["ayurveda", "health", "ancient", "medicine"] },
  { title: "Dan Brown Origin", author: "Dan Brown", genre: "Thriller", year: 2017, pages: 480, rating: 3.8, tags: ["thriller", "origin", "dan brown", "science"] },
  { title: "Ego is the Enemy", author: "Ryan Holiday", genre: "Self-Help", year: 2016, pages: 256, rating: 4.3, tags: ["ego", "philosophy", "stoicism", "self-improvement"] },
  { title: "Eleven Minutes", author: "Paulo Coelho", genre: "Fiction", year: 2003, pages: 273, rating: 3.9, tags: ["fiction", "love", "sex", "self-discovery"] },
  { title: "Elmer's Friends", author: "David McKee", genre: "Children", year: 1989, pages: 32, rating: 4.0, tags: ["children", "elmer", "friends", "colors"] },
  { title: "Feeling Good", author: "David D. Burns", genre: "Self-Help", year: 1980, pages: 736, rating: 4.4, tags: ["depression", "cbt", "therapy", "mental health"] },
  { title: "Franny and Zooey", author: "J.D. Salinger", genre: "Classic", year: 1961, pages: 201, rating: 3.8, tags: ["classic", "family", "spirituality", "coming of age"] },
  { title: "Genius Foods", author: "Max Lugavere", genre: "Health", year: 2018, pages: 400, rating: 4.2, tags: ["nutrition", "brain health", "food", "wellness"] },
  { title: "Give and Take", author: "Adam Grant", genre: "Business", year: 2013, pages: 320, rating: 4.3, tags: ["business", "success", "giving", "psychology"] },
  { title: "Gone Girl", author: "Gillian Flynn", genre: "Thriller", year: 2012, pages: 432, rating: 4.0, tags: ["thriller", "marriage", "mystery", "psychological"] },
  { title: "Gunahon Ka Devta", author: "Dharamvir Bharati", genre: "Classic", year: 1949, pages: 224, rating: 4.3, tags: ["hindi literature", "love", "classic", "indian"] },
  { title: "HOLD MY HAND", author: "Durjoy Datta", genre: "Romance", year: 2015, pages: 280, rating: 3.7, tags: ["romance", "contemporary", "relationships", "emotional"] },
  { title: "Half Girlfriend", author: "Chetan Bhagat", genre: "Romance", year: 2014, pages: 280, rating: 3.5, tags: ["romance", "contemporary", "indian", "relationships"] },
  { title: "Hast Rekha", author: "Pandit Vishnu Sharma", genre: "Occult", year: 1950, pages: 150, rating: 3.5, tags: ["palmistry", "astrology", "occult", "hindi"] },
  { title: "House of Cards", author: "Sudha Murty", genre: "Fiction", year: 2014, pages: 200, rating: 4.0, tags: ["fiction", "indian", "society", "relationships"] },
  { title: "Inferno", author: "Dan Brown", genre: "Thriller", year: 2013, pages: 462, rating: 3.7, tags: ["thriller", "dante", "florence", "mystery"] },
  { title: "Katie In Love", author: "Bella Andre", genre: "Romance", year: 2011, pages: 320, rating: 3.9, tags: ["romance", "contemporary", "love", "relationships"] },
  { title: "Mahabharat", author: "Ved Vyasa", genre: "Epic", year: -400, pages: 100000, rating: 4.8, tags: ["epic", "hindu", "mythology", "ancient"] },
  { title: "Marry Poppins", author: "P.L. Travers", genre: "Children", year: 1934, pages: 192, rating: 4.1, tags: ["children", "magic", "nanny", "fantasy"] },
  { title: "Oliver Twist", author: "Charles Dickens", genre: "Classic", year: 1838, pages: 608, rating: 4.0, tags: ["classic", "orphan", "london", "social commentary"] },
  { title: "One Indian Girl", author: "Chetan Bhagat", genre: "Romance", year: 2016, pages: 280, rating: 3.4, tags: ["romance", "feminism", "indian", "contemporary"] },
  { title: "Rebecca", author: "Daphne du Maurier", genre: "Gothic", year: 1938, pages: 448, rating: 4.2, tags: ["gothic", "mystery", "cornwall", "psychological"] },
  { title: "Revolution 2020", author: "Chetan Bhagat", genre: "Fiction", year: 2011, pages: 296, rating: 3.8, tags: ["fiction", "india", "corruption", "love triangle"] },
  { title: "Robinson Crusoe", author: "Daniel Defoe", genre: "Adventure", year: 1719, pages: 320, rating: 3.8, tags: ["adventure", "survival", "island", "colonialism"] },
  { title: "Ruk Jaana Nahin", author: "Divya Prakash Dubey", genre: "Romance", year: 2017, pages: 224, rating: 3.6, tags: ["romance", "hindi", "contemporary", "relationships"] },
  { title: "SHORT STORIES", author: "Various Authors", genre: "Anthology", year: 2020, pages: 300, rating: 3.8, tags: ["short stories", "anthology", "fiction", "various authors"] },
  { title: "Sacred Games", author: "Vikram Chandra", genre: "Thriller", year: 2006, pages: 928, rating: 4.1, tags: ["thriller", "mumbai", "crime", "police"] },
  { title: "Saket", author: "Maithili Sharan Gupt", genre: "Epic", year: 1932, pages: 200, rating: 4.3, tags: ["hindi poetry", "epic", "ramayana", "classic"] },
  { title: "Short-Stories", author: "Various", genre: "Anthology", year: 2019, pages: 250, rating: 3.7, tags: ["short stories", "fiction", "anthology", "various"] },
  { title: "Shutter Island", author: "Dennis Lehane", genre: "Thriller", year: 2003, pages: 369, rating: 4.1, tags: ["thriller", "psychological", "island", "mystery"] },
  { title: "Someone Like You", author: "Sarah Dessen", genre: "Young Adult", year: 1998, pages: 281, rating: 4.0, tags: ["young adult", "romance", "friendship", "coming of age"] },
  { title: "Steal the Show", author: "Michael Port", genre: "Business", year: 2015, pages: 288, rating: 4.2, tags: ["public speaking", "performance", "business", "communication"] },
  { title: "Story Craft", author: "John Gardner", genre: "Writing", year: 1984, pages: 248, rating: 4.3, tags: ["writing", "craft", "fiction", "literary theory"] },
  { title: "Super Immunity", author: "Joel Fuhrman", genre: "Health", year: 2011, pages: 320, rating: 4.0, tags: ["health", "immunity", "nutrition", "wellness"] },
  { title: "Sweet Nothings", author: "Megan McCafferty", genre: "Romance", year: 2002, pages: 304, rating: 3.8, tags: ["romance", "contemporary", "relationships", "humor"] },
  { title: "THE ONE YOU CANNOT HAVE", author: "Preeti Shenoy", genre: "Romance", year: 2013, pages: 280, rating: 3.9, tags: ["romance", "love", "relationships", "contemporary"] },
  { title: "THE ONE YOU CANNOT HAVE", author: "Preeti Shenoy", genre: "Romance", year: 2013, pages: 280, rating: 3.9, tags: ["romance", "love", "relationships", "contemporary"] },
  { title: "Ten Years Later", author: "Hoda Kotb", genre: "Biography", year: 2013, pages: 320, rating: 4.1, tags: ["biography", "inspiration", "survivors", "life stories"] },
  { title: "The 5AM Club", author: "Robin Sharma", genre: "Self-Help", year: 2018, pages: 336, rating: 3.8, tags: ["productivity", "morning routine", "success", "habits"] },
  { title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", year: 1988, pages: 208, rating: 3.9, tags: ["fiction", "philosophy", "journey", "wisdom"] },
  { title: "The Da Vinci Code", author: "Dan Brown", genre: "Thriller", year: 2003, pages: 489, rating: 3.9, tags: ["thriller", "mystery", "conspiracy", "art"] },
  { title: "The Fox", author: "Frederick Forsyth", genre: "Thriller", year: 2018, pages: 320, rating: 3.9, tags: ["thriller", "espionage", "fox", "adventure"] },
  { title: "The Jungle Book", author: "Rudyard Kipling", genre: "Children", year: 1894, pages: 277, rating: 4.0, tags: ["children", "jungle", "animals", "adventure"] },
  { title: "The Kalam Effect", author: "P.M. Nair", genre: "Biography", year: 2008, pages: 280, rating: 4.2, tags: ["biography", "kalam", "president", "india"] },
  { title: "The Little Mermaid", author: "Hans Christian Andersen", genre: "Children", year: 1837, pages: 64, rating: 4.1, tags: ["children", "mermaid", "fairy tale", "classic"] },
  { title: "The Lost Symbol", author: "Dan Brown", genre: "Thriller", year: 2009, pages: 509, rating: 3.6, tags: ["thriller", "mystery", "washington", "symbols"] },
  { title: "The Man Who Saved India", author: "Hindol Sengupta", genre: "Biography", year: 2018, pages: 432, rating: 4.3, tags: ["biography", "sardar patel", "india", "history"] },
  { title: "The Mother I Never Knew", author: "Sudha Murty", genre: "Fiction", year: 2014, pages: 184, rating: 4.0, tags: ["fiction", "family", "relationships", "indian"] },
  { title: "The Palace of Illusions", author: "Chitra Banerjee Divakaruni", genre: "Mythology", year: 2008, pages: 360, rating: 4.2, tags: ["mythology", "mahabharata", "draupadi", "feminine perspective"] },
  { title: "The Pilgrimage", author: "Paulo Coelho", genre: "Fiction", year: 1987, pages: 288, rating: 3.8, tags: ["fiction", "pilgrimage", "spirituality", "journey"] },
  { title: "The Promise", author: "Nikita Singh", genre: "Romance", year: 2016, pages: 256, rating: 3.6, tags: ["romance", "contemporary", "love", "commitment"] },
  { title: "The Ritual", author: "Adam Nevill", genre: "Horror", year: 2011, pages: 418, rating: 3.9, tags: ["horror", "ritual", "forest", "supernatural"] },
  { title: "The Road Less Traveled", author: "M. Scott Peck", genre: "Self-Help", year: 1978, pages: 315, rating: 4.2, tags: ["psychology", "spirituality", "growth", "therapy"] },
  { title: "The Secret", author: "Rhonda Byrne", genre: "Self-Help", year: 2006, pages: 198, rating: 3.7, tags: ["law of attraction", "manifestation", "self-help", "positive thinking"] },
  { title: "The Secret Wish List", author: "Preeti Shenoy", genre: "Romance", year: 2012, pages: 280, rating: 3.8, tags: ["romance", "wish list", "dreams", "self-discovery"] },
  { title: "The Secret Wishlist", author: "Preeti Shenoy", genre: "Romance", year: 2012, pages: 280, rating: 3.8, tags: ["romance", "wish list", "dreams", "self-discovery"] },
  { title: "The Three Body Problem", author: "Cixin Liu", genre: "Science Fiction", year: 2008, pages: 400, rating: 4.0, tags: ["science fiction", "china", "physics", "alien civilization"] },
  { title: "The Three Musketeers", author: "Alexandre Dumas", genre: "Adventure", year: 1844, pages: 786, rating: 4.1, tags: ["adventure", "france", "musketeers", "classic"] },
  { title: "The Wheel of Time", author: "Robert Jordan", genre: "Fantasy", year: 1990, pages: 814, rating: 4.2, tags: ["fantasy", "epic", "magic", "series"] },
  { title: "The Worlds Best Boyfriend", author: "Durjoy Datta", genre: "Romance", year: 2015, pages: 280, rating: 3.6, tags: ["romance", "contemporary", "relationships", "college"] },
  { title: "The Zoya Factor", author: "Anuja Chauhan", genre: "Romance", year: 2008, pages: 528, rating: 3.9, tags: ["romance", "cricket", "indian", "contemporary"] },
  { title: "Think Like A Monk", author: "Jay Shetty", genre: "Self-Help", year: 2020, pages: 352, rating: 4.2, tags: ["monk mindset", "purpose", "meditation", "self-discovery"] },
  { title: "Three Ghost Stories", author: "Charles Dickens", genre: "Horror", year: 1860, pages: 150, rating: 3.7, tags: ["ghost stories", "classic", "horror", "victorian"] },
  { title: "Three Mistakes of My Life", author: "Chetan Bhagat", genre: "Fiction", year: 2008, pages: 258, rating: 3.7, tags: ["fiction", "india", "cricket", "business"] },
  { title: "Till The Last Breath", author: "Durjoy Datta", genre: "Romance", year: 2012, pages: 280, rating: 3.8, tags: ["romance", "medical", "love", "tragedy"] },
  { title: "Universal Magick", author: "Donald Tyson", genre: "Occult", year: 2008, pages: 384, rating: 3.5, tags: ["magick", "occult", "spirituality", "rituals"] },
  { title: "Veronika Decides to Die", author: "Paulo Coelho", genre: "Fiction", year: 1998, pages: 210, rating: 3.8, tags: ["fiction", "suicide", "mental health", "life"] },
  { title: "Very Hungry Caterpillar", author: "Eric Carle", genre: "Children", year: 1969, pages: 22, rating: 4.4, tags: ["children", "caterpillar", "counting", "classic"] },
  { title: "Vicomte de Bragelonne", author: "Alexandre Dumas", genre: "Adventure", year: 1847, pages: 800, rating: 3.9, tags: ["adventure", "france", "musketeers", "historical"] },
  { title: "Vladimir Nabokov Lolita", author: "Vladimir Nabokov", genre: "Classic", year: 1955, pages: 336, rating: 3.8, tags: ["classic", "controversial", "literature", "psychological"] },
  { title: "What is Death", author: "Various", genre: "Philosophy", year: 2020, pages: 200, rating: 3.6, tags: ["death", "philosophy", "life", "spirituality"] },
  { title: "When Dimple Met Rishi", author: "Sandhya Menon", genre: "Young Adult", year: 2017, pages: 380, rating: 3.7, tags: ["young adult", "romance", "indian american", "arranged marriage"] },
  { title: "When Only Love Remains", author: "Durjoy Datta", genre: "Romance", year: 2014, pages: 280, rating: 3.7, tags: ["romance", "love", "music", "emotional"] },
  { title: "Wilde Oscar Short Stories", author: "Oscar Wilde", genre: "Classic", year: 1891, pages: 200, rating: 4.2, tags: ["short stories", "classic", "wilde", "witty"] },
  { title: "Wings Of Fire", author: "A.P.J. Abdul Kalam", genre: "Biography", year: 1999, pages: 180, rating: 4.5, tags: ["biography", "kalam", "india", "inspiration"] },
  { title: "Winning Habits", author: "Dick Lyles", genre: "Self-Help", year: 2000, pages: 224, rating: 3.9, tags: ["habits", "success", "motivation", "personal development"] },
  { title: "Wonder", author: "R.J. Palacio", genre: "Children", year: 2012, pages: 316, rating: 4.4, tags: ["children", "kindness", "acceptance", "school"] },
  { title: "World s Best Boyfriend", author: "Durjoy Datta", genre: "Romance", year: 2015, pages: 280, rating: 3.6, tags: ["romance", "contemporary", "relationships", "college"] },
  { title: "You Are the Best Wife", author: "Ajay K. Pandey", genre: "Romance", year: 2015, pages: 248, rating: 4.1, tags: ["romance", "love story", "death", "celebration"] },
  { title: "You Were My Crush", author: "Durjoy Datta", genre: "Romance", year: 2014, pages: 256, rating: 3.6, tags: ["romance", "college", "friendship", "love"] },
  { title: "Zero to One", author: "Peter Thiel", genre: "Business", year: 2014, pages: 195, rating: 4.3, tags: ["startups", "innovation", "future", "entrepreneurship"] }
];

// Create books array with only existing PDFs
let bookId = 1;
pdfFiles.forEach((pdfFile, index) => {
  const pdfTitle = pdfFile.replace('.pdf', '');
  
  // Find matching book data or create default
  let bookInfo = bookData.find(book => 
    pdfTitle.toLowerCase().includes(book.title.toLowerCase().split(' ')[0]) ||
    book.title.toLowerCase().includes(pdfTitle.toLowerCase().split(' ')[0])
  );
  
  if (!bookInfo) {
    bookInfo = {
      title: pdfTitle,
      author: "Unknown Author",
      genre: "General",
      year: 2020,
      pages: 200,
      rating: 3.5,
      tags: ["general"]
    };
  }
  
  existingBooks.push({
    id: bookId.toString(),
    title: bookInfo.title,
    author: bookInfo.author,
    genre: bookInfo.genre,
    description: `A ${bookInfo.genre.toLowerCase()} book titled "${bookInfo.title}" by ${bookInfo.author}.`,
    pdfPath: `/books/${pdfFile}`,
    publishYear: bookInfo.year,
    pages: bookInfo.pages,
    rating: bookInfo.rating,
    language: "English",
    tags: bookInfo.tags
  });
  
  bookId++;
});

console.log(`Created ${existingBooks.length} books from existing PDFs`);

// Generate the new books.ts content
const booksTsContent = `// Book data based on available PDFs in public/books
export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverImage?: string;
  pdfPath: string;
  publishYear?: number;
  pages?: number;
  rating?: number;
  language?: string;
  tags?: string[];
}

export const books: Book[] = [
${existingBooks.map(book => `  {
    id: "${book.id}",
    title: "${book.title.replace(/"/g, '\\"')}",
    author: "${book.author.replace(/"/g, '\\"')}",
    genre: "${book.genre}",
    description: "${book.description.replace(/"/g, '\\"')}",
    pdfPath: "${book.pdfPath}",
    publishYear: ${book.publishYear},
    pages: ${book.pages},
    rating: ${book.rating},
    language: "${book.language}",
    tags: [${book.tags.map(tag => `"${tag}"`).join(', ')}]
  }`).join(',\n')}
];

// Helper functions
export const getBookById = (id: string): Book | undefined => {
  return books.find(book => book.id === id);
};

export const getBooksByGenre = (genre: string): Book[] => {
  return books.filter(book => 
    book.genre.toLowerCase() === genre.toLowerCase()
  );
};

export const searchBooks = (query: string): Book[] => {
  const lowercaseQuery = query.toLowerCase();
  return books.filter(book => 
    book.title.toLowerCase().includes(lowercaseQuery) ||
    book.author.toLowerCase().includes(lowercaseQuery) ||
    book.genre.toLowerCase().includes(lowercaseQuery) ||
    book.description.toLowerCase().includes(lowercaseQuery) ||
    (book.tags && book.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
  );
};

export const getBooksByAuthor = (author: string): Book[] => {
  return books.filter(book => 
    book.author.toLowerCase().includes(author.toLowerCase())
  );
};

export const getBooksByLanguage = (language: string): Book[] => {
  return books.filter(book => 
    book.language && book.language.toLowerCase() === language.toLowerCase()
  );
};

export const getBooksByYearRange = (startYear: number, endYear: number): Book[] => {
  return books.filter(book => 
    book.publishYear && book.publishYear >= startYear && book.publishYear <= endYear
  );
};

export const getBooksByRating = (minRating: number): Book[] => {
  return books.filter(book => 
    book.rating && book.rating >= minRating
  );
};

export const getBooksByTag = (tag: string): Book[] => {
  return books.filter(book => 
    book.tags && book.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
};

export const getAllGenres = (): string[] => {
  const genres = books.map(book => book.genre);
  return [...new Set(genres)].sort();
};

export const getAllAuthors = (): string[] => {
  const authors = books.map(book => book.author);
  return [...new Set(authors)].sort();
};

export const getAllLanguages = (): string[] => {
  const languages = books.map(book => book.language).filter(Boolean);
  return [...new Set(languages)].sort();
};

export const getAllTags = (): string[] => {
  const allTags = books.flatMap(book => book.tags || []);
  return [...new Set(allTags)].sort();
};
`;

// Write the new books.ts file
const booksTsPath = path.join(__dirname, 'src/data/books.ts');
fs.writeFileSync(booksTsPath, booksTsContent);

console.log(`✅ Updated books.ts with ${existingBooks.length} books that have existing PDF files`);
console.log('\nFirst 10 books created:');
existingBooks.slice(0, 10).forEach(book => {
  console.log(`${book.id}. ${book.title} by ${book.author}`);
});