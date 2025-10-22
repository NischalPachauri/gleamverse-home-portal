import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to clean and format book titles
function cleanTitle(filename) {
  // Remove .pdf extension
  let title = filename.replace('.pdf', '');
  
  // Handle specific known patterns
  if (title.includes('harry-potter-1')) return "Harry Potter and the Philosopher's Stone";
  if (title.includes('harry-potter-2')) return "Harry Potter and the Chamber of Secrets";
  if (title.includes('harry-potter-3')) return "Harry Potter and the Prisoner of Azkaban";
  if (title.includes('harry-potter-4')) return "Harry Potter and the Goblet of Fire";
  if (title.includes('harry-potter-5')) return "Harry Potter and the Order of the Phoenix";
  if (title.includes('harry-potter-6')) return "Harry Potter and the Half-Blood Prince";
  if (title.includes('harry-potter-7')) return "Harry Potter and the Deathly Hallows";
  if (title.includes('harry-potter-8')) return "Harry Potter and the Cursed Child";
  
  // Remove common prefixes and suffixes
  title = title.replace(/^[0-9]+\.\s*/, ''); // Remove leading numbers
  title = title.replace(/\s*by\s+[^-]+$/, ''); // Remove "by Author" at the end
  title = title.replace(/\s*-\s*[^-]+$/, ''); // Remove "- Author" at the end
  title = title.replace(/\s*\([^)]*\)$/, ''); // Remove trailing parentheses
  
  // Clean up common patterns
  title = title.replace(/\s+/g, ' ').trim();
  
  return title;
}

// Function to extract author from filename
function extractAuthor(filename) {
  const title = filename.replace('.pdf', '');
  
  // Handle specific known authors
  if (title.includes('chetan-bhagat') || title.includes('Chetan Bhagat')) return 'Chetan Bhagat';
  if (title.includes('durjoy-datta') || title.includes('Durjoy Datta') || title.includes('Durjoy Dutta')) return 'Durjoy Datta';
  if (title.includes('preeti-shenoy') || title.includes('Preeti Shenoy')) return 'Preeti Shenoy';
  if (title.includes('ravinder-singh') || title.includes('Ravinder Singh')) return 'Ravinder Singh';
  if (title.includes('sudeep-nagarkar') || title.includes('Sudeep Nagarkar')) return 'Sudeep Nagarkar';
  if (title.includes('nikita-singh') || title.includes('Nikita Singh')) return 'Nikita Singh';
  if (title.includes('madhuri-banerjee') || title.includes('Madhuri Banerjee')) return 'Madhuri Banerjee';
  if (title.includes('sudha-murty') || title.includes('Sudha Murty') || title.includes('Sudha Murthy')) return 'Sudha Murty';
  if (title.includes('amish-tripathi') || title.includes('Amish Tripathi')) return 'Amish Tripathi';
  if (title.includes('vikram-chandra') || title.includes('Vikram Chandra')) return 'Vikram Chandra';
  if (title.includes('paulo-coelho') || title.includes('Paulo Coelho')) return 'Paulo Coelho';
  if (title.includes('dan-brown') || title.includes('Dan Brown')) return 'Dan Brown';
  if (title.includes('j-k-rowling') || title.includes('J.K. Rowling')) return 'J.K. Rowling';
  if (title.includes('rick-riordan') || title.includes('Rick Riordan')) return 'Rick Riordan';
  if (title.includes('rudyard-kipling') || title.includes('Rudyard Kipling')) return 'Rudyard Kipling';
  if (title.includes('fyodor-dostoyevsky') || title.includes('Fyodor Dostoyevsky')) return 'Fyodor Dostoyevsky';
  if (title.includes('alexandre-dumas') || title.includes('Alexandre Dumas')) return 'Alexandre Dumas';
  if (title.includes('mary-shelley') || title.includes('Mary Shelley')) return 'Mary Shelley';
  if (title.includes('daphne-du-maurier') || title.includes('Daphne du Maurier')) return 'Daphne du Maurier';
  if (title.includes('gillian-flynn') || title.includes('Gillian Flynn')) return 'Gillian Flynn';
  if (title.includes('alex-michaelides') || title.includes('Alex Michaelides')) return 'Alex Michaelides';
  if (title.includes('dennis-lehane') || title.includes('Dennis Lehane')) return 'Dennis Lehane';
  if (title.includes('rhonda-byrne') || title.includes('Rhonda Byrne')) return 'Rhonda Byrne';
  if (title.includes('chitra-banerjee') || title.includes('Chitra Banerjee Divakaruni')) return 'Chitra Banerjee Divakaruni';
  if (title.includes('j-sai-deepak') || title.includes('J Sai Deepak')) return 'J Sai Deepak';
  if (title.includes('john-boyne') || title.includes('John Boyne')) return 'John Boyne';
  if (title.includes('arthur-hailey') || title.includes('Arthur Hailey')) return 'Arthur Hailey';
  if (title.includes('gabriel-garcia-marquez') || title.includes('Gabriel García Márquez')) return 'Gabriel García Márquez';
  if (title.includes('apj-abdul-kalam') || title.includes('APJ Abdul Kalam')) return 'APJ Abdul Kalam';
  if (title.includes('nelson-mandela') || title.includes('Nelson Mandela')) return 'Nelson Mandela';
  if (title.includes('albert-einstein') || title.includes('Albert Einstein')) return 'Albert Einstein';
  if (title.includes('steve-jobs') || title.includes('Steve Jobs')) return 'Steve Jobs';
  if (title.includes('narendra-modi') || title.includes('Narendra Modi')) return 'Narendra Modi';
  if (title.includes('mother-teresa') || title.includes('Mother Teresa')) return 'Mother Teresa';
  if (title.includes('kevin-missal') || title.includes('Kevin Missal')) return 'Kevin Missal';
  if (title.includes('vladimir-nabokov') || title.includes('Vladimir Nabokov')) return 'Vladimir Nabokov';
  if (title.includes('ruskin-bond') || title.includes('Ruskin Bond')) return 'Ruskin Bond';
  if (title.includes('william-shakespeare') || title.includes('William Shakespeare')) return 'William Shakespeare';
  if (title.includes('ajay-pandey') || title.includes('Ajay Pandey')) return 'Ajay Pandey';
  if (title.includes('smita-kaushik') || title.includes('Smita Kaushik')) return 'Smita Kaushik';
  if (title.includes('bhinder-shravya') || title.includes('Bhinder Shravya')) return 'Bhinder Shravya';
  if (title.includes('nishant-jain') || title.includes('Nishant Jain')) return 'Nishant Jain';
  if (title.includes('anupam-kher') || title.includes('Anupam Kher')) return 'Anupam Kher';
  if (title.includes('gary-soto') || title.includes('Gary Soto')) return 'Gary Soto';
  if (title.includes('adam-nevill') || title.includes('Adam Nevill')) return 'Adam Nevill';
  if (title.includes('kathleen-hanson') || title.includes('Kathleen Hanson')) return 'Kathleen Hanson';
  if (title.includes('frederick-forsyth') || title.includes('Frederick Forsyth')) return 'Frederick Forsyth';
  if (title.includes('carmine-gallo') || title.includes('Carmine Gallo')) return 'Carmine Gallo';
  if (title.includes('j-d-salinger') || title.includes('J.D. Salinger')) return 'J.D. Salinger';
  if (title.includes('anurag-garg') || title.includes('Anurag Garg')) return 'Anurag Garg';
  if (title.includes('p-m-nair') || title.includes('P M Nair')) return 'P M Nair';
  if (title.includes('priyadarshi-prakash') || title.includes('Priyadarshi Prakash')) return 'Priyadarshi Prakash';
  if (title.includes('veda-vyasa') || title.includes('Veda Vyasa')) return 'Veda Vyasa';
  if (title.includes('michael-jordan') || title.includes('Michael Jordan')) return 'Michael Jordan';
  if (title.includes('napoleon') || title.includes('Napoleon')) return 'Napoleon Bonaparte';
  if (title.includes('charlie-chaplin') || title.includes('Charlie Chaplin')) return 'Charlie Chaplin';
  if (title.includes('swami-vivekananda') || title.includes('Swami Vivekananda')) return 'Swami Vivekananda';
  if (title.includes('vyasa') || title.includes('Vyasa')) return 'Vyasa';
  
  // Look for "by" pattern
  const byMatch = title.match(/\s+by\s+(.+)$/i);
  if (byMatch) {
    return byMatch[1].trim();
  }
  
  // Look for "-" pattern
  const dashMatch = title.match(/\s*-\s*(.+)$/);
  if (dashMatch) {
    return dashMatch[1].trim();
  }
  
  // Look for parentheses pattern
  const parenMatch = title.match(/\s*\(([^)]+)\)$/);
  if (parenMatch) {
    return parenMatch[1].trim();
  }
  
  return 'Unknown Author';
}

// Function to determine genre based on title and author
function determineGenre(title, author) {
  const titleLower = title.toLowerCase();
  const authorLower = author.toLowerCase();
  
  // Harry Potter series
  if (titleLower.includes('harry potter')) return 'Fantasy';
  
  // Chetan Bhagat books
  if (authorLower.includes('chetan bhagat')) return 'Fiction';
  
  // Durjoy Datta books
  if (authorLower.includes('durjoy datta') || authorLower.includes('durjoy dutta')) return 'Romance';
  
  // Preeti Shenoy books
  if (authorLower.includes('preeti shenoy')) return 'Non-Fiction';
  
  // Biography patterns
  if (titleLower.includes('biography') || 
      titleLower.includes('autobiography') ||
      authorLower.includes('kalam') ||
      authorLower.includes('mandela') ||
      authorLower.includes('einstein') ||
      authorLower.includes('steve jobs') ||
      authorLower.includes('narendra modi') ||
      authorLower.includes('mother teresa') ||
      authorLower.includes('michael jordan') ||
      authorLower.includes('napoleon') ||
      authorLower.includes('charlie chaplin') ||
      authorLower.includes('swami vivekananda') ||
      authorLower.includes('william shakespeare') ||
      titleLower.includes('wings of fire')) return 'Biography';
  
  // Philosophy/Spiritual
  if (titleLower.includes('bhagavad') ||
      titleLower.includes('gita') ||
      titleLower.includes('alchemist') ||
      titleLower.includes('secret') ||
      titleLower.includes('ramcharitmanas') ||
      titleLower.includes('mahabharat')) return 'Philosophy';
  
  // Children's books
  if (titleLower.includes('jungle book') ||
      titleLower.includes('grandma') ||
      titleLower.includes('percy jackson') ||
      titleLower.includes('boy in striped')) return 'Children\'s';
  
  // Mystery/Thriller
  if (titleLower.includes('gone girl') ||
      titleLower.includes('silent patient') ||
      titleLower.includes('shutter island') ||
      titleLower.includes('da vinci') ||
      titleLower.includes('angels demons') ||
      titleLower.includes('girl in room') ||
      authorLower.includes('dan brown') ||
      authorLower.includes('gillian flynn') ||
      authorLower.includes('alex michaelides') ||
      authorLower.includes('dennis lehane')) return 'Mystery';
  
  // Romance
  if (titleLower.includes('love') ||
      titleLower.includes('girlfriend') ||
      titleLower.includes('crush') ||
      titleLower.includes('half girlfriend') ||
      titleLower.includes('2 states') ||
      titleLower.includes('revolution 2020') ||
      titleLower.includes('one indian girl') ||
      authorLower.includes('ravinder singh') ||
      authorLower.includes('nikita singh') ||
      authorLower.includes('madhuri banerjee')) return 'Romance';
  
  // Classic Literature
  if (titleLower.includes('crime and punishment') ||
      titleLower.includes('count of monte cristo') ||
      titleLower.includes('three musketeers') ||
      titleLower.includes('frankenstein') ||
      titleLower.includes('rebecca') ||
      titleLower.includes('one hundred years') ||
      authorLower.includes('fyodor dostoyevsky') ||
      authorLower.includes('alexandre dumas') ||
      authorLower.includes('mary shelley') ||
      authorLower.includes('daphne du maurier') ||
      authorLower.includes('gabriel garcía márquez')) return 'Fiction';
  
  // Indian Literature
  if (titleLower.includes('sacred games') ||
      titleLower.includes('palace of illusions') ||
      titleLower.includes('scion of ikshvaku') ||
      titleLower.includes('india that is bharat') ||
      authorLower.includes('vikram chandra') ||
      authorLower.includes('chitra banerjee') ||
      authorLower.includes('amish tripathi') ||
      authorLower.includes('j sai deepak')) return 'Fiction';
  
  // Self-help/Wellness
  if (titleLower.includes('life is what you make') ||
      titleLower.includes('happens for a reason') ||
      titleLower.includes('healing') ||
      titleLower.includes('therapeutic')) return 'Non-Fiction';
  
  // Medical/Health
  if (titleLower.includes('ayurveda') ||
      titleLower.includes('yoga') ||
      titleLower.includes('healing') ||
      titleLower.includes('therapeutic')) return 'Non-Fiction';
  
  return 'Fiction'; // Default fallback
}

// Function to generate better descriptions
function generateDescription(title, author, genre) {
  const titleLower = title.toLowerCase();
  const authorLower = author.toLowerCase();
  
  // Specific descriptions for well-known books
  if (titleLower.includes('harry potter')) {
    if (titleLower.includes('philosopher')) return "The first adventure begins as Harry discovers he's a wizard and enters the magical world of Hogwarts School of Witchcraft and Wizardry.";
    if (titleLower.includes('chamber')) return "Harry's second year at Hogwarts is filled with mystery as the Chamber of Secrets is opened and students are being petrified.";
    if (titleLower.includes('prisoner')) return "Harry learns about his past and faces the escaped prisoner Sirius Black while discovering new magical abilities.";
    if (titleLower.includes('goblet')) return "Harry competes in the dangerous Triwizard Tournament and witnesses the return of Lord Voldemort.";
    if (titleLower.includes('order')) return "Harry forms Dumbledore's Army and fights against the Ministry's denial of Voldemort's return.";
    if (titleLower.includes('half-blood')) return "Harry learns about Voldemort's past through Dumbledore's memories and discovers the Half-Blood Prince's secrets.";
    if (titleLower.includes('deathly')) return "The epic conclusion as Harry, Ron, and Hermione hunt for Horcruxes and face the final battle against Voldemort.";
    if (titleLower.includes('cursed')) return "The next generation story follows Harry's son Albus as he struggles with his family legacy at Hogwarts.";
  }
  
  if (titleLower.includes('wings of fire')) return "The inspiring autobiography of India's Missile Man and former President.";
  if (titleLower.includes('long walk to freedom')) return "The autobiography of one of the greatest moral and political leaders of our time.";
  if (titleLower.includes('alchemist')) return "A magical tale about following your dreams and listening to your heart.";
  if (titleLower.includes('bhagavad gita')) return "Ancient Hindu scripture on philosophy, spirituality, and the path to enlightenment.";
  if (titleLower.includes('secret')) return "Discover the law of attraction and how to use it to achieve your goals.";
  if (titleLower.includes('gone girl')) return "A psychological thriller about a marriage gone terribly wrong.";
  if (titleLower.includes('silent patient')) return "A woman shoots her husband and then never speaks again. A psychotherapist becomes obsessed with uncovering the truth.";
  if (titleLower.includes('da vinci code')) return "A gripping thriller about secret societies, ancient mysteries, and religious conspiracies.";
  if (titleLower.includes('crime and punishment')) return "A psychological thriller about guilt, redemption, and the human condition.";
  if (titleLower.includes('count of monte cristo')) return "An epic tale of wrongful imprisonment, escape, and revenge.";
  if (titleLower.includes('three musketeers')) return "A swashbuckling adventure of friendship, honor, and loyalty.";
  if (titleLower.includes('frankenstein')) return "The classic tale of a scientist who creates a living being with disastrous consequences.";
  if (titleLower.includes('rebecca')) return "A haunting tale of jealousy, mystery, and obsession.";
  if (titleLower.includes('jungle book')) return "The classic tale of Mowgli, a boy raised by wolves in the Indian jungle.";
  if (titleLower.includes('percy jackson')) return "A young boy discovers he's the son of a Greek god and must prevent a war among the gods.";
  if (titleLower.includes('grandma')) return "A collection of wonderful stories told by a grandmother to her grandchildren.";
  if (titleLower.includes('boy in striped')) return "A powerful story of friendship during the Holocaust.";
  if (titleLower.includes('sacred games')) return "An epic crime thriller set in the underworld of Mumbai.";
  if (titleLower.includes('palace of illusions')) return "The Mahabharata retold from Draupadi's perspective.";
  if (titleLower.includes('scion of ikshvaku')) return "The story of Lord Ram, reimagined in this epic tale.";
  if (titleLower.includes('india that is bharat')) return "An examination of India's civilizational identity and colonial influences.";
  if (titleLower.includes('life is what you make')) return "An inspiring story about mental health, resilience, and finding happiness.";
  if (titleLower.includes('happens for a reason')) return "A touching story about difficult choices and finding your path.";
  if (titleLower.includes('half girlfriend')) return "A beautiful tale of love between a rural boy and an urban girl, exploring the complexities of relationships.";
  if (titleLower.includes('2 states')) return "A love story about a couple from two different Indian states who want to get married.";
  if (titleLower.includes('revolution 2020')) return "A story of love, corruption, and ambition set in the Indian education system.";
  if (titleLower.includes('one indian girl')) return "The story of an independent, financially secure Indian girl and her journey to find love.";
  if (titleLower.includes('five point someone')) return "The story of three friends and their struggles in India's top engineering college.";
  if (titleLower.includes('call center')) return "Six people working at a call center experience a life-changing night.";
  if (titleLower.includes('3 mistakes')) return "A story of friendship, dreams, and the mistakes that change everything.";
  if (titleLower.includes('girl in room 105')) return "A thrilling mystery about love, obsession, and murder.";
  if (titleLower.includes('i too had a love story')) return "A heart-wrenching true love story that will leave you in tears.";
  if (titleLower.includes('hotel')) return "A gripping drama set in a luxury hotel over five eventful days.";
  if (titleLower.includes('one hundred years')) return "A magical realist masterpiece chronicling the Buendía family.";
  
  // Generic descriptions based on genre
  if (genre === 'Romance') return `A beautiful love story by ${author} that explores the complexities of relationships and human emotions.`;
  if (genre === 'Mystery') return `A gripping thriller by ${author} that will keep you on the edge of your seat with its twists and turns.`;
  if (genre === 'Fantasy') return `An enchanting fantasy tale by ${author} that transports you to magical worlds and extraordinary adventures.`;
  if (genre === 'Biography') return `An inspiring biography that chronicles the remarkable life and achievements of a notable figure.`;
  if (genre === 'Philosophy') return `A thought-provoking work by ${author} that explores deep questions about life, spirituality, and human existence.`;
  if (genre === 'Children\'s') return `A delightful story by ${author} that will captivate young readers and adults alike.`;
  if (genre === 'Non-Fiction') return `An insightful work by ${author} that provides valuable knowledge and practical wisdom.`;
  
  return `A captivating ${genre.toLowerCase()} book by ${author} that offers an engaging reading experience.`;
}

// Function to generate book ID from title
function generateId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

// Function to estimate pages (placeholder)
function estimatePages() {
  return Math.floor(Math.random() * 500) + 100; // Random between 100-600
}

// Function to estimate year (placeholder)
function estimateYear() {
  return Math.floor(Math.random() * 30) + 1990; // Random between 1990-2020
}

// Main function to process all PDF files
function generateBookData() {
  const booksDir = path.join(__dirname, '..', 'public', 'books');
  const files = fs.readdirSync(booksDir);
  
  const books = [];
  let idCounter = 1;
  
  files.forEach((filename, index) => {
    if (filename.endsWith('.pdf')) {
      const title = cleanTitle(filename);
      const author = extractAuthor(filename);
      const genre = determineGenre(title, author);
      const id = generateId(title);
      
      const book = {
        id: id,
        title: title,
        author: author,
        description: generateDescription(title, author, genre),
        coverImage: 'placeholder',
        pdfPath: `/books/${filename}`,
        year: estimateYear(),
        pages: estimatePages().toString(),
        genre: genre
      };
      
      books.push(book);
    }
  });
  
  return books;
}

// Generate the book data
const allBooks = generateBookData();

// Write to a new file
const outputPath = path.join(__dirname, '..', 'src', 'data', 'all-books.ts');
const outputContent = `export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  pdfPath: string;
  year: number;
  pages: string;
  genre: string;
}

export const allBooks: Book[] = ${JSON.stringify(allBooks, null, 2)};
`;

fs.writeFileSync(outputPath, outputContent);

console.log(`Generated ${allBooks.length} books`);
console.log('Sample books:');
allBooks.slice(0, 5).forEach(book => {
  console.log(`- ${book.title} by ${book.author} (${book.genre})`);
});
