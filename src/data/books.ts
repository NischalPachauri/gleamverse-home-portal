export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  pdfPath: string;
  year: number;
  pages: string;
  genre: string;
  genres: string[]; // Multiple genres per book
}

// Import all books from the generated file
import { allBooks } from './all-books';

// Lightweight normalization utilities copied from generation script (simplified)
const determineGenre = (title: string, author: string) => {
  const t = title.toLowerCase();
  const a = author.toLowerCase();
  if (t.includes('harry potter')) return 'Fantasy';
  if (a.includes('chetan bhagat')) return 'Fiction';
  if (a.includes('durjoy datta') || a.includes('durjoy dutta')) return 'Romance';
  if (a.includes('preeti shenoy')) return 'Non-Fiction';
  if (
    t.includes('biography') ||
    t.includes('autobiography') ||
    a.includes('kalam') ||
    a.includes('mandela') ||
    a.includes('einstein') ||
    a.includes('steve jobs') ||
    a.includes('narendra modi') ||
    a.includes('mother teresa') ||
    t.includes('wings of fire')
  ) return 'Biography';
  if (t.includes('bhagavad') || t.includes('gita') || t.includes('alchemist') || t.includes('secret')) return 'Philosophy';
  if (t.includes('jungle book') || t.includes('grandma') || t.includes('percy jackson') || t.includes('boy in striped')) return "Children's";
  if (
    t.includes('gone girl') || t.includes('silent patient') || t.includes('shutter island') || t.includes('da vinci') ||
    t.includes('angels') && t.includes('demons') || t.includes('girl in room') || a.includes('dan brown') ||
    a.includes('gillian flynn') || a.includes('alex michaelides') || a.includes('dennis lehane')
  ) return 'Mystery';
  if (
    t.includes('love') || t.includes('girlfriend') || t.includes('crush') || t.includes('2 states') ||
    a.includes('ravinder singh') || a.includes('nikita singh') || a.includes('madhuri banerjee')
  ) return 'Romance';
  if (
    t.includes('crime and punishment') || t.includes('count of monte cristo') || t.includes('three musketeers') ||
    t.includes('frankenstein') || t.includes('rebecca') || t.includes('one hundred years')
  ) return 'Fiction';
  if (
    t.includes('sacred games') || t.includes('palace of illusions') || t.includes('scion of ikshvaku') || t.includes('india that is bharat') ||
    a.includes('vikram chandra') || a.includes('chitra banerjee') || a.includes('amish tripathi') || a.includes('j sai deepak')
  ) return 'Fiction';
  if (
    t.includes('life is what you make') || t.includes('happens for a reason') || t.includes('healing') || t.includes('therapeutic')
  ) return 'Non-Fiction';
  return 'Fiction';
};

const determineMultipleGenres = (title: string, author: string): string[] => {
  const t = title.toLowerCase();
  const a = author.toLowerCase();
  const genres = new Set<string>();
  
  // Harry Potter - Fantasy + Children's + Adventure
  if (t.includes('harry potter')) {
    genres.add('Fantasy');
    genres.add("Children's");
    genres.add('Adventure');
  }
  
  // Love/Romance books can also be Fiction
  if (t.includes('love') || t.includes('girlfriend') || t.includes('crush') || t.includes('romance') || 
      a.includes('ravinder singh') || a.includes('nikita singh') || a.includes('durjoy')) {
    genres.add('Romance');
    genres.add('Fiction');
  }
  
  // Chetan Bhagat - Fiction + Romance
  if (a.includes('chetan bhagat')) {
    genres.add('Fiction');
    if (t.includes('2 states') || t.includes('girlfriend')) {
      genres.add('Romance');
    }
  }
  
  // Biography can also be Non-Fiction
  if (t.includes('biography') || t.includes('autobiography') || t.includes('life story') || 
      t.includes('wings of fire') || a.includes('kalam')) {
    genres.add('Biography');
    genres.add('Non-Fiction');
  }
  
  // Mystery/Thriller books
  if (t.includes('mystery') || t.includes('thriller') || t.includes('crime') || t.includes('murder') ||
      t.includes('detective') || a.includes('dan brown') || a.includes('agatha christie')) {
    genres.add('Mystery');
    genres.add('Thriller');
    genres.add('Fiction');
  }
  
  // Children's books can also be Fantasy/Adventure
  if (t.includes('percy jackson') || t.includes('jungle book') || t.includes('fairy')) {
    genres.add("Children's");
    genres.add('Adventure');
    if (t.includes('percy') || t.includes('magic')) {
      genres.add('Fantasy');
    }
  }
  
  // Philosophy/Self-Help
  if (t.includes('gita') || t.includes('philosophy') || t.includes('alchemist') || 
      t.includes('secret') || t.includes('mind') || t.includes('think')) {
    genres.add('Philosophy');
    genres.add('Non-Fiction');
  }
  
  // Business/Educational
  if (t.includes('business') || t.includes('marketing') || t.includes('management') || 
      t.includes('economics') || t.includes('finance')) {
    genres.add('Business');
    genres.add('Educational');
    genres.add('Non-Fiction');
  }
  
  // Science/Technology
  if (t.includes('science') || t.includes('physics') || t.includes('chemistry') || 
      t.includes('biology') || t.includes('computer') || t.includes('programming')) {
    genres.add('Science');
    genres.add('Educational');
    genres.add('Non-Fiction');
  }
  
  // History
  if (t.includes('history') || t.includes('historical') || t.includes('ancient') || 
      t.includes('medieval') || t.includes('war')) {
    genres.add('History');
    genres.add('Non-Fiction');
  }
  
  // If no genres were added, use the single genre determination
  if (genres.size === 0) {
    genres.add(determineGenre(title, author));
  }
  
  return Array.from(genres);
};

const cleanTitle = (raw: string, pdfPath?: string) => {
  let t = raw
    .replace(/_/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  // Fix Durjoy Datta/Dutta books - extract actual title from PDF path
  if ((t.toLowerCase() === 'durjoy datta' || t.toLowerCase() === 'durjoy dutta' || 
       t.toLowerCase().includes('durjoy datt') && t.split(' ').length <= 3) && pdfPath) {
    // Extract book title from path like "/books/Durjoy Datta - Of Course I Love You.pdf"
    const match = pdfPath.match(/Durjoy (?:Datta|Dutta) - ([^.]+)\.pdf/i);
    if (match) {
      t = match[1].trim();
    }
  }
  
  // Fix other author-as-title issues
  if (pdfPath && (t === raw || t.split(' ').length <= 2)) {
    // Try to extract title after dash from PDF path for any book
    const dashMatch = pdfPath.match(/[^\/]+ - ([^.]+)\.pdf/i);
    if (dashMatch && dashMatch[1].length > 3) {
      const extracted = dashMatch[1].trim();
      if (extracted.toLowerCase() !== t.toLowerCase()) {
        t = extracted;
      }
    }
  }
  
  // Fix other mis-titled books with author name as title
  const titleFixMap: Record<string, string> = {
    'Hold my Hand Penguin Metro Rea Durjoy': 'Hold My Hand',
    'If It s Not Forever Durjoy Datta': "If It's Not Forever",
    'She Broke Up  I Didn t  I Just Durjoy': "She Broke Up, I Didn't",
    'Someone Like You Durjoy  Datta i': 'Someone Like You',
    'The Boy with a Broken Heart   Durjoy Datta': 'The Boy with a Broken Heart',
    'Till the Last Breath Durjoy Datt': 'Till the Last Breath',
    '12Th Fail': '12th Fail',
    'Accidental Love   Gary Soto': 'Accidental Love',
    'Adam Nevill   The Ritual': 'The Ritual',
    'Now That You re Rich': "Now That You're Rich",
    'Oh Yes I m Single': "Oh Yes, I'm Single",
    'World s Best Boyfriend': "World's Best Boyfriend",
    'You Were My Crush Hindi': 'You Were My Crush (Hindi)',
    'HOLD MY HAND': 'Hold My Hand',
    'Our IMPossible Love': 'Our Impossible Love',
    'Tell The Last Breath': 'Till The Last Breath'
  };
  
  for (const [key, value] of Object.entries(titleFixMap)) {
    if (t.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Fix common capitalization issues (keep existing proper nouns mostly intact)
  // Only title-case if it looks all-caps or all-lower with non-HP
  const looksWeird = (/^[A-Z\s@:_'-]+$/.test(t) || /^[a-z\s@:_'-]+$/.test(t)) && !t.toLowerCase().includes('harry potter');
  if (looksWeird) {
    t = t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }
  
  // Normalize known artifacts
  t = t.replace(/\bAnd\b/g, 'and').replace(/\bOf\b/g, 'of');
  
  // More specific quick fixes
  t = t.replace(/^love@facebook$/i, 'Love@Facebook');
  t = t.replace(/^dan brown $/i, 'Origin');
  t = t.replace(/^can love happentwice ebook full$/i, 'Can Love Happen Twice?');
  t = t.replace(/308704\.?Saket/i, 'Saket');
  
  return t;
};

// Generate unique IDs for duplicate entries
let idCounter: Record<string, number> = {};

export const books: Book[] = allBooks.map((b) => {
  const title = cleanTitle(b.title, b.pdfPath);
  const genre = determineGenre(title, b.author);
  const genres = determineMultipleGenres(title, b.author);
  
  // Fix duplicate IDs by appending counter
  let id = b.id;
  if (idCounter[id]) {
    id = `${b.id}-${idCounter[id]}`;
    idCounter[b.id]++;
  } else {
    idCounter[b.id] = 1;
  }
  
  return { ...b, id, title, genre, genres };
});