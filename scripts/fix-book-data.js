import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to clean and format book titles properly
function cleanTitle(filename) {
  let title = filename.replace('.pdf', '');
  
  // Handle specific known books with correct titles
  const knownBooks = {
    'harry-potter-1-philosophers-stone': "Harry Potter and the Philosopher's Stone",
    'harry-potter-2-chamber-of-secrets': "Harry Potter and the Chamber of Secrets", 
    'harry-potter-3-prisoner-of-azkaban': "Harry Potter and the Prisoner of Azkaban",
    'harry-potter-4-goblet-of-fire': "Harry Potter and the Goblet of Fire",
    'harry-potter-5-order-of-phoenix': "Harry Potter and the Order of the Phoenix",
    'harry-potter-6-half-blood-prince': "Harry Potter and the Half-Blood Prince",
    'harry-potter-7-deathly-hallows': "Harry Potter and the Deathly Hallows",
    'harry-potter-8-cursed-child': "Harry Potter and the Cursed Child",
    '2-states-the-story-of-my-marriage-by-chetan-bhagat': "2 States: The Story of My Marriage",
    'Half Girlfriend by Chetan Bhagat': "Half Girlfriend",
    'revolution-2020-by-chetan-bhagat': "Revolution 2020",
    'One-Indian-Girl': "One Indian Girl",
    'Of-Course-I-Love-You': "Of Course I Love You",
    'Durjoy Datta - Till The Last Breath': "Till The Last Breath",
    'Durjoy Datta - World s Best Boyfriend': "World's Best Boyfriend",
    'Someone-Like-You': "Someone Like You",
    'Wings of Fire_ An Autobiography of APJ Abdul Kalam': "Wings of Fire: An Autobiography",
    'Long_Walk_to_Freedom_The_Autobiography_of_Nelson_Mandela_by_Nels': "Long Walk to Freedom",
    'Albert Einstein': "Albert Einstein: A Biography",
    'Presentation Secrets Of Steve Jobs': "Steve Jobs: Presentation Secrets",
    'Narendra Modi A Political Biography': "Narendra Modi: A Political Biography",
    'Mother Teresa - A Biography': "Mother Teresa: A Biography",
    'Crime and Punishment -  Fyodor Dostoyevsky': "Crime and Punishment",
    'The Count Of MonteCristo': "The Count of Monte Cristo",
    'The Three Musketeers': "The Three Musketeers",
    'Frankenstein_NT': "Frankenstein",
    'Rebecca': "Rebecca",
    'The DaVinci Code by Dan Brown': "The Da Vinci Code",
    'Angels  Demons': "Angels & Demons",
    'Inferno-by-BrownDan': "Inferno",
    'Gone Girl': "Gone Girl",
    'The Silent Patient by Alex Michaelides': "The Silent Patient",
    'Shutter Island': "Shutter Island",
    'The Alchemist by Paulo Coelho': "The Alchemist",
    'Bhagavad-Gita (Hindi))': "Bhagavad Gita",
    'The-Secret-by-Rhonda-Byrne': "The Secret",
    'eleven_minutes': "Eleven Minutes",
    'Sacred Games_ A Novel': "Sacred Games",
    'The Palace of Illusions': "The Palace of Illusions",
    'Scion of Ikshvaku (Ram Chandra - Amish Tripathi': "Scion of Ikshvaku",
    'India that is Bharat by J Sai Deepak': "India That Is Bharat",
    'Percy Jackson and The Lightning Thief': "Percy Jackson and The Lightning Thief",
    'The_Jungle_Book_NT': "The Jungle Book",
    'Grandma s_Bag_of_Stories_By_Sudha_Murty': "Grandma's Bag of Stories",
    'The Boy in The Striped Pajamas - D. Boyne': "The Boy in The Striped Pajamas",
    'Life_Is_What_You_Make_It_by_Preeti_Shenoy': "Life Is What You Make It",
    'It Happens for a Reason - Preeti Shenoy': "It Happens for a Reason",
    'five-point-someone-chetan-bhagat_ebook': "Five Point Someone",
    'Chetan Bhagat- One Night @ The Call Center': "One Night @ The Call Center",
    'Three mistakes of my life- Chetan Bhagat': "The 3 Mistakes of My Life",
    'The Girl in Room 105 by Chetan Bhagat': "The Girl in Room 105",
    'I Too Had A Love Story-pdf-Ravinder Singh': "I Too Had A Love Story",
    'Hotel by Arthur Hailey': "Hotel",
    'one-hundred-years-of-solitude': "One Hundred Years of Solitude"
  };
  
  // Check if we have a known book
  for (const [key, value] of Object.entries(knownBooks)) {
    if (title.includes(key) || title === key) {
      return value;
    }
  }
  
  // Clean up common patterns
  title = title.replace(/^[0-9]+\.\s*/, ''); // Remove leading numbers
  title = title.replace(/\s*by\s+[^-]+$/, ''); // Remove "by Author" at the end
  title = title.replace(/\s*-\s*[^-]+$/, ''); // Remove "- Author" at the end
  title = title.replace(/\s*\([^)]*\)$/, ''); // Remove trailing parentheses
  title = title.replace(/\s*\(Hindi\)$/, ''); // Remove (Hindi) suffix
  title = title.replace(/\s*\(eng\)$/, ''); // Remove (eng) suffix
  title = title.replace(/\s*\(NT\)$/, ''); // Remove (NT) suffix
  
  // Clean up common patterns
  title = title.replace(/\s+/g, ' ').trim();
  
  return title;
}

// Function to extract author from filename properly
function extractAuthor(filename) {
  const title = filename.replace('.pdf', '');
  
  // Handle Harry Potter books specifically
  if (title.includes('harry-potter')) {
    return 'J.K. Rowling';
  }
  
  // Handle specific known authors
  const authorMappings = {
    'chetan-bhagat': 'Chetan Bhagat',
    'Chetan Bhagat': 'Chetan Bhagat',
    'durjoy-datta': 'Durjoy Datta',
    'Durjoy Datta': 'Durjoy Datta',
    'Durjoy Dutta': 'Durjoy Datta',
    'preeti-shenoy': 'Preeti Shenoy',
    'Preeti Shenoy': 'Preeti Shenoy',
    'ravinder-singh': 'Ravinder Singh',
    'Ravinder Singh': 'Ravinder Singh',
    'sudeep-nagarkar': 'Sudeep Nagarkar',
    'Sudeep Nagarkar': 'Sudeep Nagarkar',
    'nikita-singh': 'Nikita Singh',
    'Nikita Singh': 'Nikita Singh',
    'madhuri-banerjee': 'Madhuri Banerjee',
    'Madhuri Banerjee': 'Madhuri Banerjee',
    'sudha-murty': 'Sudha Murty',
    'Sudha Murty': 'Sudha Murty',
    'Sudha Murthy': 'Sudha Murty',
    'amish-tripathi': 'Amish Tripathi',
    'Amish Tripathi': 'Amish Tripathi',
    'vikram-chandra': 'Vikram Chandra',
    'Vikram Chandra': 'Vikram Chandra',
    'paulo-coelho': 'Paulo Coelho',
    'Paulo Coelho': 'Paulo Coelho',
    'dan-brown': 'Dan Brown',
    'Dan Brown': 'Dan Brown',
    'j-k-rowling': 'J.K. Rowling',
    'J.K. Rowling': 'J.K. Rowling',
    'rick-riordan': 'Rick Riordan',
    'Rick Riordan': 'Rick Riordan',
    'rudyard-kipling': 'Rudyard Kipling',
    'Rudyard Kipling': 'Rudyard Kipling',
    'fyodor-dostoyevsky': 'Fyodor Dostoyevsky',
    'Fyodor Dostoyevsky': 'Fyodor Dostoyevsky',
    'alexandre-dumas': 'Alexandre Dumas',
    'Alexandre Dumas': 'Alexandre Dumas',
    'mary-shelley': 'Mary Shelley',
    'Mary Shelley': 'Mary Shelley',
    'daphne-du-maurier': 'Daphne du Maurier',
    'Daphne du Maurier': 'Daphne du Maurier',
    'gillian-flynn': 'Gillian Flynn',
    'Gillian Flynn': 'Gillian Flynn',
    'alex-michaelides': 'Alex Michaelides',
    'Alex Michaelides': 'Alex Michaelides',
    'dennis-lehane': 'Dennis Lehane',
    'Dennis Lehane': 'Dennis Lehane',
    'rhonda-byrne': 'Rhonda Byrne',
    'Rhonda Byrne': 'Rhonda Byrne',
    'chitra-banerjee': 'Chitra Banerjee Divakaruni',
    'Chitra Banerjee Divakaruni': 'Chitra Banerjee Divakaruni',
    'j-sai-deepak': 'J Sai Deepak',
    'J Sai Deepak': 'J Sai Deepak',
    'john-boyne': 'John Boyne',
    'John Boyne': 'John Boyne',
    'arthur-hailey': 'Arthur Hailey',
    'Arthur Hailey': 'Arthur Hailey',
    'gabriel-garcia-marquez': 'Gabriel García Márquez',
    'Gabriel García Márquez': 'Gabriel García Márquez',
    'apj-abdul-kalam': 'APJ Abdul Kalam',
    'APJ Abdul Kalam': 'APJ Abdul Kalam',
    'nelson-mandela': 'Nelson Mandela',
    'Nelson Mandela': 'Nelson Mandela',
    'albert-einstein': 'Albert Einstein',
    'Albert Einstein': 'Albert Einstein',
    'steve-jobs': 'Steve Jobs',
    'Steve Jobs': 'Steve Jobs',
    'narendra-modi': 'Narendra Modi',
    'Narendra Modi': 'Narendra Modi',
    'mother-teresa': 'Mother Teresa',
    'Mother Teresa': 'Mother Teresa'
  };
  
  // Check for known authors
  for (const [key, value] of Object.entries(authorMappings)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
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
      titleLower.includes('wings of fire')) return 'Biography';
  
  // Philosophy/Spiritual
  if (titleLower.includes('bhagavad') ||
      titleLower.includes('gita') ||
      titleLower.includes('alchemist') ||
      titleLower.includes('secret')) return 'Philosophy';
  
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
  
  return 'Fiction'; // Default fallback
}

// Function to generate better descriptions
function generateDescription(title, author, genre) {
  const titleLower = title.toLowerCase();
  
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
  let harryPotterBooks = [];
  let otherBooks = [];
  
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
      
      // Separate Harry Potter books
      if (title.toLowerCase().includes('harry potter')) {
        harryPotterBooks.push(book);
      } else {
        otherBooks.push(book);
      }
    }
  });
  
  // Sort Harry Potter books by title to get correct order
  harryPotterBooks.sort((a, b) => {
    const aNum = a.title.match(/Harry Potter and the (\d+)/);
    const bNum = b.title.match(/Harry Potter and the (\d+)/);
    if (aNum && bNum) {
      return parseInt(aNum[1]) - parseInt(bNum[1]);
    }
    return a.title.localeCompare(b.title);
  });
  
  // Combine with Harry Potter books first
  return [...harryPotterBooks, ...otherBooks];
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
console.log('Harry Potter books:');
allBooks.filter(book => book.title.toLowerCase().includes('harry potter')).forEach(book => {
  console.log(`- ${book.title} by ${book.author}`);
});
