# Book Library - Browse & Continue Reading Sections

A beautiful, modern dark-themed book browsing interface with smooth animations and interactive features.

## Features

✨ **Browse by Category**
- 15+ book categories with unique gradient colors
- Smooth scroll-triggered animations
- Hover effects with scale, rotation, and shine animations
- Fully responsive grid layout (2-5 columns)

📚 **Continue Reading**
- Interactive book cards with real cover images
- Remove books with a cross button (appears on hover)
- Smooth animations and transitions
- Empty state handling
- Responsive grid layout (1-5 columns)

🎨 **Design Features**
- Dark theme optimized with gradient accents
- Glassmorphism effects with backdrop blur
- Custom gradient scrollbar
- Smooth scroll behavior
- Multiple gradient color schemes (purple, indigo, pink, teal, etc.)
- Beautiful hover states and micro-interactions

## Tech Stack

- **React** 18+ with TypeScript
- **Tailwind CSS** 4.0 for styling
- **Motion (Framer Motion)** for animations
- **Lucide React** for icons
- **Unsplash** for book cover images

## Installation

### Prerequisites
- Node.js 16+ and npm/yarn/pnpm

### Setup

1. **Install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. **Required packages:**
```bash
npm install motion lucide-react
```

3. **File Structure:**
```
├── App.tsx                          # Main application
├── components/
│   ├── BrowseCategories.tsx         # Category browsing section
│   ├── ContinueReading.tsx          # Continue reading section
│   └── figma/
│       └── ImageWithFallback.tsx    # Image component (pre-existing)
├── styles/
│   └── globals.css                  # Global styles & scrollbar
└── README.md                        # This file
```

4. **Run the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Usage

### Import Components

```tsx
import BrowseCategories from './components/BrowseCategories';
import ContinueReading from './components/ContinueReading';

export default function App() {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <BrowseCategories />
      <ContinueReading />
    </div>
  );
}
```

### Customization

#### Adding New Categories

Edit `BrowseCategories.tsx`:

```tsx
const categories: Category[] = [
  { 
    id: 'your-category', 
    name: 'Your Category', 
    icon: <YourIcon className="w-5 h-5" />, 
    gradient: 'from-color1 via-color2 to-color3' 
  },
  // ... more categories
];
```

#### Adding New Books

Edit `ContinueReading.tsx`:

```tsx
const initialBooks: Book[] = [
  {
    id: 'unique-id',
    title: 'Your Book Title',
    author: 'Author Name',
    coverImage: 'https://your-image-url.com/cover.jpg',
    gradient: 'from-color1 via-color2 to-color3'
  },
  // ... more books
];
```

#### Changing Gradient Colors

Available gradient classes (Tailwind):
- `from-purple-500 via-violet-500 to-indigo-500`
- `from-blue-500 via-cyan-500 to-teal-500`
- `from-rose-500 via-pink-500 to-fuchsia-500`
- `from-orange-500 via-amber-500 to-yellow-500`
- And many more...

## Features in Detail

### Cross Button (Remove Books)
- Appears on hover over book cards
- Red gradient background with hover effect
- Removes book from the list with smooth animation
- Shows empty state when all books are removed

### Scroll Animations
- Elements fade in and slide up when scrolled into view
- Uses `useInView` hook from Motion
- Animations trigger once (not on every scroll)
- Staggered delays for cascading effect

### Responsive Design
- **Mobile:** 1-2 columns
- **Tablet:** 2-3 columns
- **Desktop:** 4-5 columns
- Smooth transitions between breakpoints

### Accessibility
- Keyboard navigation support
- Focus visible states
- Semantic HTML
- ARIA labels where needed

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Performance Tips

1. **Images:** Book covers are lazy-loaded
2. **Animations:** Hardware-accelerated with GPU
3. **Scroll:** Smooth scrolling with CSS
4. **State:** React state management for book removal

## Customization Options

### Disable Animations
Remove or modify `initial`, `animate`, and `transition` props from Motion components.

### Change Theme
Modify gradient colors in `globals.css` and component files.

### Adjust Timing
Change `delay` values in `transition` props:
```tsx
transition={{ duration: 0.5, delay: 0.1 }}
```

## Troubleshooting

**Issue:** Images not loading
- Check image URLs are accessible
- Verify `ImageWithFallback` component exists
- Check network connection

**Issue:** Animations not smooth
- Ensure GPU acceleration is enabled in browser
- Check system performance
- Reduce number of animated elements

**Issue:** Scrollbar not styled
- Verify `globals.css` is imported
- Check browser compatibility (webkit only for custom scrollbar)
- Clear browser cache

## License

Free to use for personal and commercial projects.

## Credits

- Book cover images from [Unsplash](https://unsplash.com)
- Icons from [Lucide](https://lucide.dev)
- Animations powered by [Motion](https://motion.dev)

---

Made with ❤️ for book lovers
