import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8081;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Mock user database
const users = new Map();
const sessions = new Map();

// Generate access token
function generateAccessToken() {
  return 'access_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Authentication endpoints
app.post('/register', (req, res) => {
  const { email, password, displayName } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  if (users.has(email)) {
    return res.status(409).json({ error: 'User already exists' });
  }
  
  const user = {
    id: Date.now().toString(),
    email,
    password, // Store password for login verification
    displayName: displayName || email.split('@')[0],
    createdAt: new Date().toISOString()
  };
  
  users.set(email, user);
  
  // Generate access token
  const accessToken = generateAccessToken();
  sessions.set(accessToken, { userId: user.id, email: user.email });
  
  res.status(201).json({
    message: 'User registered successfully',
    access_token: accessToken,
    user: { id: user.id, email: user.email, displayName: user.displayName }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate access token
  const accessToken = generateAccessToken();
  sessions.set(accessToken, { userId: user.id, email: user.email });
  
  res.json({
    message: 'Login successful',
    access_token: accessToken,
    user: { id: user.id, email: user.email, displayName: user.displayName }
  });
});

// Book status management
app.put('/api/books/:bookId/status', (req, res) => {
  const { bookId } = req.params;
  const { status } = req.body;
  
  // Mock book status update
  res.json({
    message: 'Book status updated successfully',
    bookId,
    status
  });
});

// Theme management endpoint
app.post('/api/theme', (req, res) => {
  const { theme } = req.body;
  
  res.json({
    message: 'Theme updated successfully',
    theme
  });
});

// Top books endpoint
app.get('/api/top-books', (req, res) => {
  const topBooks = [
    {
      id: 'hp1',
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      genre: "Fantasy",
      cover_url: "/assets/hp1.jpg",
      pdf_url: "/books/harry-potter-1-philosophers-stone.pdf"
    },
    {
      id: 'hp2',
      title: "Harry Potter and the Chamber of Secrets",
      author: "J.K. Rowling",
      genre: "Fantasy",
      cover_url: "/assets/hp2.jpg",
      pdf_url: "/books/harry-potter-2-chamber-of-secrets.pdf"
    }
  ];
  
  res.json({ books: topBooks });
});

// Books API endpoints
app.get('/api/books', (req, res) => {
  const books = [
    {
      id: 'hp1',
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      genre: "Fantasy",
      cover_url: "/assets/hp1.jpg",
      pdf_url: "/books/harry-potter-1-philosophers-stone.pdf"
    },
    {
      id: 'hp2',
      title: "Harry Potter and the Chamber of Secrets",
      author: "J.K. Rowling",
      genre: "Fantasy",
      cover_url: "/assets/hp2.jpg",
      pdf_url: "/books/harry-potter-2-chamber-of-secrets.pdf"
    }
  ];
  
  res.json({ books });
});

// Search books endpoint
app.get('/api/books/search', (req, res) => {
  const { query, title, author, genre } = req.query;
  const books = [
    {
      id: 'hp1',
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      genre: "Fantasy",
      cover_url: "/assets/hp1.jpg",
      pdf_url: "/books/harry-potter-1-philosophers-stone.pdf"
    }
  ];
  
  let filteredBooks = books;
  
  if (query) {
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.genre.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  if (title) {
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(title.toLowerCase())
    );
  }
  
  if (author) {
    filteredBooks = filteredBooks.filter(book => 
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }
  
  if (genre) {
    filteredBooks = filteredBooks.filter(book => 
      book.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }
  
  res.json({ books: filteredBooks });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
