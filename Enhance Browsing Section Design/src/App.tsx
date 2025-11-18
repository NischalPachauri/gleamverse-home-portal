import BrowseCategories from './components/BrowseCategories';
import ContinueReading from './components/ContinueReading';

export default function App() {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative">
        {/* Top gradient glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        <BrowseCategories />
        
        {/* Divider with gradient */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
        </div>
        
        <ContinueReading />
      </div>
    </div>
  );
}
