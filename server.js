import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Serve source files in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use('/src', express.static(path.join(__dirname, 'src')));
  console.log('Development mode: Serving source files from', path.join(__dirname, 'src'));
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Mock user database
const users = new Map();
const sessions = new Map();

// Generate access token
function generateAccessToken() {
  return 'access_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Authentication endpoints
app.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (users.has(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword, // Store hashed password
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
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', message: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

// Book status management
app.put('/api/books/:bookId/status', (req, res) => {
  try {
    const { bookId } = req.params;
    const { status } = req.body;
    
    if (!bookId || !status) {
      return res.status(400).json({ error: 'Book ID and status are required' });
    }
    
    // Mock book status update
    res.json({
      message: 'Book status updated successfully',
      bookId,
      status
    });
  } catch (err) {
    console.error('Book status update error:', err);
    res.status(500).json({ error: 'Failed to update book status', message: err.message });
  }
});

// Theme management endpoint
app.post('/api/theme', (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!theme) {
      return res.status(400).json({ error: 'Theme value is required' });
    }
    
    res.json({
      message: 'Theme updated successfully',
      theme
    });
  } catch (err) {
    console.error('Theme update error:', err);
    res.status(500).json({ error: 'Failed to update theme', message: err.message });
  }
});

// Top books endpoint
app.get('/api/top-books', (req, res) => {
  try {
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
  } catch (err) {
    console.error('Top books fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch top books', message: err.message });
  }
});

// Books API endpoints
app.get('/api/books', (req, res) => {
  try {
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
  } catch (err) {
    console.error('Books fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch books', message: err.message });
  }
});

// Search books endpoint
app.get('/api/books/search', (req, res) => {
  try {
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
  } catch (err) {
    console.error('Book search error:', err);
    res.status(500).json({ error: 'Failed to search books', message: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ error: 'Health check failed', message: err.message });
  }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } catch (err) {
    console.error('Error serving React app:', err);
    res.status(500).send('Error loading application');
  }
});

// Install bcryptjs if not already installed
try {
  require.resolve('bcryptjs');
} catch (err) {
  console.error('bcryptjs is not installed. Please run: npm install bcryptjs');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
