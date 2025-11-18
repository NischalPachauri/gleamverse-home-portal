import { BookOpen, Users, BookMarked, Globe, Briefcase, GraduationCap, Rocket, Heart, Sparkles, Brain, Coffee, TrendingUp, Newspaper, Music, Film } from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
}

const categories: Category[] = [
  { id: 'fiction', name: 'Fiction', icon: <BookOpen className="w-5 h-5" />, gradient: 'from-blue-500 via-indigo-500 to-purple-500' },
  { id: 'non-fiction', name: 'Non-Fiction', icon: <Globe className="w-5 h-5" />, gradient: 'from-emerald-500 via-green-500 to-teal-500' },
  { id: 'self-help', name: 'Self-Help', icon: <Brain className="w-5 h-5" />, gradient: 'from-amber-500 via-orange-500 to-yellow-500' },
  { id: 'business', name: 'Business', icon: <Briefcase className="w-5 h-5" />, gradient: 'from-slate-500 via-gray-500 to-zinc-500' },
  { id: 'biography', name: 'Biography', icon: <Users className="w-5 h-5" />, gradient: 'from-teal-500 via-cyan-500 to-blue-500' },
  { id: 'romance', name: 'Romance', icon: <Heart className="w-5 h-5" />, gradient: 'from-rose-500 via-pink-500 to-red-400' },
  { id: 'fantasy', name: 'Fantasy', icon: <Sparkles className="w-5 h-5" />, gradient: 'from-fuchsia-500 via-purple-500 to-pink-500' },
  { id: 'science', name: 'Science', icon: <Rocket className="w-5 h-5" />, gradient: 'from-cyan-500 via-blue-500 to-indigo-500' },
  { id: 'philosophy', name: 'Philosophy', icon: <BookMarked className="w-5 h-5" />, gradient: 'from-violet-500 via-purple-500 to-indigo-500' },
  { id: 'education', name: 'Education', icon: <GraduationCap className="w-5 h-5" />, gradient: 'from-green-500 via-emerald-500 to-teal-500' },
  { id: 'productivity', name: 'Productivity', icon: <TrendingUp className="w-5 h-5" />, gradient: 'from-orange-500 via-amber-500 to-yellow-500' },
  { id: 'health', name: 'Health', icon: <Coffee className="w-5 h-5" />, gradient: 'from-lime-500 via-green-500 to-emerald-500' },
  { id: 'arts', name: 'Arts & Culture', icon: <Film className="w-5 h-5" />, gradient: 'from-pink-500 via-rose-500 to-orange-500' },
  { id: 'history', name: 'History', icon: <Newspaper className="w-5 h-5" />, gradient: 'from-amber-500 via-yellow-500 to-orange-500' },
  { id: 'music', name: 'Music', icon: <Music className="w-5 h-5" />, gradient: 'from-purple-500 via-violet-500 to-fuchsia-500' },
];

export default function BrowseCategories() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section ref={ref} className="w-full py-16 px-4 relative overflow-hidden">
      {/* Background gradient decorations with parallax */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" 
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="relative inline-block text-4xl mb-3">
            <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Explore by Category
            </span>
            <div className="h-1 mt-3 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-full" />
          </h2>
          <p className="mt-6 text-slate-600 max-w-2xl mx-auto text-lg">
            Discover your next favorite book from our carefully curated collection across diverse genres
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.05,
                ease: "easeOut"
              }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm border border-slate-200/80 p-6 transition-all duration-300 hover:border-transparent hover:shadow-2xl hover:shadow-purple-500/20"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Icon with gradient background */}
              <div className={`relative mb-4 mx-auto w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} p-2.5 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                <div className="text-white flex items-center justify-center">
                  {category.icon}
                </div>
              </div>

              {/* Category name */}
              <div className="relative text-center">
                <p className="text-slate-700 group-hover:text-slate-900 transition-colors duration-300 line-clamp-1">
                  {category.name}
                </p>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}