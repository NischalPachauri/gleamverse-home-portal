import { Book, Home, Library, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Search, Star, Bookmark, Grid3X3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export const Footer = () => {
  const { ref: footerRef, isVisible } = useScrollReveal({ threshold: 0.1 });
  
  return (
    <footer ref={footerRef} className="border-t border-border bg-gradient-to-br from-card via-card to-primary/5 mt-24">
      <div className={`container mx-auto px-4 py-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About Us */}
          <div className={`space-y-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Book className="w-6 h-6" />
              About Us
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              GleamVerse is a digital library offering free access to thousands of books across all genres. Our mission is to make knowledge accessible to everyone.
            </p>
            <div className="flex gap-3 pt-4">
              <a href="#" className="p-2 rounded-full bg-primary/10 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary/10 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/nischalpachauri/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary/10 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/nischal-pachauri-881851326/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary/10 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`space-y-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-2xl font-bold text-primary mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 group">
                  <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Home
                </Link>
              </li>
              <li>
                <a href="#categories" onClick={(e) => { e.preventDefault(); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 group">
                  <Library className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Categories
                </a>
              </li>
              <li>
                <a href="#browse" onClick={(e) => { e.preventDefault(); document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 group">
                  <Grid3X3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Browse Collection
                </a>
              </li>
              <li>
                <a href="#trending-books" onClick={(e) => { e.preventDefault(); document.getElementById('trending-books')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 group">
                  <Star className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Top Books
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  const searchInput = document.querySelector('input[placeholder*="Search"]');
                  if (searchInput) {
                    searchInput.scrollIntoView({ behavior: 'smooth' });
                    searchInput.focus();
                  }
                }} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 group">
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Search Bar
                </a>
              </li>
              <li>
                <a href="#library" onClick={(e) => { e.preventDefault(); document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 group">
                  <Library className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Your Library
                </a>
              </li>
              <li>
                <Link to="/bookmarks" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 group">
                  <Bookmark className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Bookmarks
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className={`space-y-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-2xl font-bold text-primary mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground group">
                <Mail className="w-5 h-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                <span>nischalpachauriofficial@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground group">
                <Phone className="w-5 h-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                <span>9354374659</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground group">
                <MapPin className="w-5 h-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                <span>Ajay Kumar Garg Engineering College</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2025 GleamVerse. All rights reserved.
          </p>
          <p className="text-primary font-semibold mt-2">Where Learning Never Stops</p>
        </div>
      </div>
    </footer>
  );
};
