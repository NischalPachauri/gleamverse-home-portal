import { ArrowLeft, BookMarked, BookOpen, Clock, Pause, CheckCircle2 } from 'lucide-react';
import { Button } from './components/ui/button';

export default function App() {
  const stats = [
    {
      icon: BookOpen,
      count: 0,
      label: 'Planning to read',
      color: 'from-blue-500/30 to-blue-600/20',
      iconColor: 'text-blue-300',
      borderColor: 'border-blue-400/40',
      glowColor: 'shadow-blue-500/20'
    },
    {
      icon: BookMarked,
      count: 0,
      label: 'Reading',
      color: 'from-violet-500/30 to-purple-600/20',
      iconColor: 'text-violet-300',
      borderColor: 'border-violet-400/40',
      glowColor: 'shadow-violet-500/20'
    },
    {
      icon: Clock,
      count: 0,
      label: 'On hold',
      color: 'from-orange-500/30 to-amber-600/20',
      iconColor: 'text-orange-300',
      borderColor: 'border-orange-400/40',
      glowColor: 'shadow-orange-500/20'
    },
    {
      icon: CheckCircle2,
      count: 0,
      label: 'Completed',
      color: 'from-teal-500/30 to-emerald-600/20',
      iconColor: 'text-teal-300',
      borderColor: 'border-teal-400/40',
      glowColor: 'shadow-teal-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Aligned to left */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
          <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Library</span>
          </button>
        </div>

        {/* Title Section - Larger */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-violet-500/30 to-purple-600/20 border border-violet-400/40 rounded-xl backdrop-blur-sm shadow-lg shadow-violet-500/20">
              <BookMarked className="w-9 h-9 text-violet-300" />
            </div>
            <div>
              <h1 className="text-4xl bg-gradient-to-r from-white via-violet-200 to-blue-200 bg-clip-text text-transparent mb-1">
                Your Bookmarks
              </h1>
              <p className="text-slate-300">Track and organize your reading journey</p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Smaller boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-br ${stat.color} backdrop-blur-sm border ${stat.borderColor} rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-xl ${stat.glowColor}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300`} />
              
              <div className="relative flex items-center gap-3">
                <div className={`p-2 bg-slate-900/60 rounded-lg ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl mb-0.5 text-white">{stat.count}</div>
                  <div className="text-slate-300 text-xs">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-8">
            {/* Animated rings */}
            <div className="absolute inset-0 bg-violet-500/20 rounded-full animate-ping" />
            <div className="absolute inset-0 bg-violet-500/10 rounded-full animate-pulse" />
            
            {/* Icon container */}
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 shadow-2xl shadow-violet-500/20">
              <div className="bg-gradient-to-br from-violet-500/40 to-blue-500/30 rounded-2xl p-6">
                <BookMarked className="w-16 h-16 text-violet-200" />
              </div>
            </div>
          </div>

          <h2 className="mb-3 text-white">
            No bookmarks yet
          </h2>
          <p className="text-slate-300 mb-8 text-center max-w-md">
            Start adding books to your reading lists
          </p>

          <Button 
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-8 py-6 rounded-xl shadow-lg shadow-violet-500/40 hover:shadow-violet-500/60 transition-all duration-300 border-0"
          >
            Browse Books
          </Button>
        </div>
      </div>
    </div>
  );
}
