import React, { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { BookOpen, Heart, Settings, Award, Target, Calendar, MapPin, Mail, Phone, DollarSign, User, Moon, Sun, LogOut, Plus, Clock, CheckCircle2, BookPlus, Trash, MoreHorizontal, Flame } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useReadingHistory } from "../hooks/useReadingHistory";
import { useBookmarks } from "../hooks/useBookmarks";
import { useReadingStreak } from "../hooks/useReadingStreak";
import { useReadingGoals } from "../hooks/useReadingGoals";
import { useTheme } from "../contexts/ThemeContext";
import { books, Book } from "../data/books";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useFavorites } from "../hooks/useFavorites";
import { PaymentModal } from "./PaymentModal";
import { cn } from "../lib/utils";

interface UserData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joinedDate: string;
  avatar?: string;
}

interface ReadingHistoryItem {
  id: string;
  book_id: string;
  last_read_page: number;
  last_read_at: string;
  created_at: string;
}

interface ReadingGoal {
  id: string;
  title: string;
  target_books: number;
  completed_books: number;
  book_ids: string[];
  deadline?: string;
  description?: string;
  created_at: string;
}

export function ProfileWindow() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const readingHistoryData = useReadingHistory();
  const bookmarksData = useBookmarks();
  const streakData = useReadingStreak();
  const goalsData = useReadingGoals();
  const favoritesData = useFavorites();
  
  // Safely extract values with defaults
  const readingHistory = (readingHistoryData?.history || []) as ReadingHistoryItem[];
  const bookmarks = bookmarksData?.bookmarks || [];
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const lastReadDate = streakData?.lastReadDate;
  const goals = (goalsData?.goals || []) as ReadingGoal[];
  const createGoal = goalsData?.createGoal || ((goal: any) => {});
  const deleteGoal = goalsData?.deleteGoal || ((id: string) => {});
  const favoriteBookIds = favoritesData?.favoriteBooks || [];
  const toggleFavorite = favoritesData?.toggleFavorite || ((id: string) => {});
  
  const [activeTab, setActiveTab] = useState("overview");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSavingField, setIsSavingField] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState(5);
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [showBookSelectionModal, setShowBookSelectionModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<ReadingGoal | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  // Use currentStreak for display
  const streak = currentStreak;
  
  // State for user data that can be edited
  const [userData, setUserData] = useState<UserData>({
    name: user?.user_metadata?.full_name || "Reader",
    email: user?.email || "user@example.com",
    phone: user?.user_metadata?.phone || "",
    address: user?.user_metadata?.address || "",
    joinedDate: user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Jan 1, 2023",
    avatar: user?.user_metadata?.avatar_url,
  });
  
  useEffect(() => {
    // Get favorite books data
    const favBooks = favoriteBookIds
      .map(id => books.find(book => book.id === id))
      .filter((book): book is Book => book !== undefined);
    setFavoriteBooks(favBooks);
  }, [favoriteBookIds]);
  
  const handleSaveField = (field: string): void => {
    setIsSavingField(true);
    
    // Validate fields
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editValue)) {
        setEmailError('Please enter a valid email address');
        setIsSavingField(false);
        return;
      }
    }
    
    if (field === 'phone') {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (editValue && !phoneRegex.test(editValue)) {
        setPhoneError('Please enter a valid phone number');
        setIsSavingField(false);
        return;
      }
    }
    
    // Simulate API call
    setTimeout(() => {
      // Update the user data state with the new value
      setUserData(prev => ({
        ...prev,
        [field]: editValue
      }));
      
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
      setEditingField(null);
      setIsSavingField(false);
      setEmailError('');
      setPhoneError('');
      setAddressError('');
    }, 1000);
  };
  
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setIsUploadingPhoto(true);
    
    // Convert to base64 for preview (in a real app, you'd upload to a server)
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        setUserData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
        setIsUploadingPhoto(false);
        toast.success('Profile photo updated successfully');
      }, 1000);
    };
    reader.readAsDataURL(file);
  };
  
  const handleCreateGoal = () => {
    if (!newGoalTitle.trim()) {
      toast.error("Please enter a goal title");
      return;
    }
    
    const newGoal: ReadingGoal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      target_books: newGoalTarget,
      completed_books: 0,
      book_ids: [],
      deadline: newGoalDeadline || undefined,
      description: newGoalDescription || undefined,
      created_at: new Date().toISOString(),
    };
    
    createGoal(newGoal);
    toast.success("Reading goal created successfully!");
    setShowGoalModal(false);
    
    // Reset form
    setNewGoalTitle("");
    setNewGoalTarget(5);
    setNewGoalDeadline("");
    setNewGoalDescription("");
  };
  
  const handleAddBooksToGoal = (goal: ReadingGoal): void => {
    setSelectedGoal(goal);
    setShowBookSelectionModal(true);
  };
  
  const handleDeleteGoal = (goalId: string): void => {
    deleteGoal(goalId);
    toast.success("Goal deleted successfully");
  };
  
  const handleUpgradeClick = () => {
    setShowPaymentModal(true);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <Card className={`border ${theme === 'dark' ? 'border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90' : 'border-blue-300/30 shadow-lg shadow-blue-500/5 bg-white/90'} backdrop-blur`}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className={`w-24 h-24 rounded-full overflow-hidden border-2 ${theme === 'dark' ? 'border-blue-500' : 'border-blue-400'}`}>
                      {userData.avatar ? (
                        <img
                          src={userData.avatar}
                          alt={userData.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${userData.avatar ? 'hidden' : ''} ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <User className={`h-12 w-12 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                    </div>
                    
                    {/* Upload overlay */}
                    <label 
                      htmlFor="photo-upload" 
                      className={`absolute inset-0 rounded-full cursor-pointer transition-opacity ${
                        isUploadingPhoto ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-slate-100/80'} flex items-center justify-center`}
                    >
                      {isUploadingPhoto ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      ) : (
                        <div className="text-center">
                          <User className={`h-6 w-6 mx-auto mb-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                          <p className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Upload</p>
                        </div>
                      )}
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto}
                    />
                    
                    <Badge className={`absolute -bottom-1 -right-1 ${theme === 'dark' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}>
                      <Flame className="h-3 w-3 mr-1" />
                      {streak} days
                    </Badge>
                  </div>
                  
                  <h2 className={`mt-4 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{userData.name}</h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Member since {userData.joinedDate}</p>
                  
                  <div className="mt-6 w-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Free Plan</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={`text-xs h-7 px-2 ${theme === 'dark' 
                          ? 'border-purple-800/50 text-purple-400 hover:bg-purple-950/50' 
                          : 'border-purple-400/50 text-purple-600 hover:bg-purple-100/50'}`}
                        onClick={handleUpgradeClick}
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Upgrade
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={70} 
                        className={`h-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} 
                      />
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>70%</span>
                    </div>
                  </div>
                  
                  <Separator className={`my-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  
                  <div className="grid grid-cols-3 w-full gap-2 text-center">
                    <div>
                      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{readingHistory.length}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Read</p>
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{bookmarks.length}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Bookmarks</p>
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{favoriteBookIds.length}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Favorites</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className={`mt-6 w-full ${theme === 'dark' 
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-950/30' 
                      : 'text-red-600 hover:text-red-500 hover:bg-red-100/50'}`}
                    onClick={() => {
                      signOut();
                      toast.success("Logged out successfully");
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <Tabs 
              defaultValue="overview" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className={`w-full ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              <TabsList className={`grid grid-cols-3 mb-8 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-200/50'}`}>
                <TabsTrigger value="overview" className="data-[state=active]:shadow-none">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="goals" className="data-[state=active]:shadow-none">
                  <Target className="h-4 w-4 mr-2" />
                  Reading Goals
                </TabsTrigger>
                <TabsTrigger value="account" className="data-[state=active]:shadow-none">
                  <Settings className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className={`border ${theme === 'dark' ? 'border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90' : 'border-blue-300/30 shadow-lg shadow-blue-500/5 bg-white/90'} backdrop-blur`}>
                  <CardHeader>
                    <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Reading Activity</CardTitle>
                    <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Your recent reading history and statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {/* Reading Streak */}
                      <div className={`p-4 rounded-lg border ${theme === 'dark' 
                        ? 'border-purple-800/30 bg-gradient-to-r from-purple-950/50 to-blue-950/50' 
                        : 'border-purple-300/30 bg-gradient-to-r from-purple-100/50 to-blue-100/50'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Flame className={`h-5 w-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                            <h3 className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Current Reading Streak</h3>
                          </div>
                          <Badge variant="outline" className={theme === 'dark' ? 'border-purple-500/30 text-purple-400' : 'border-purple-500/30 text-purple-600'}>
                            {streak} days
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={streak > 0 ? (streak % 7) * (100/7) : 0} 
                            className={`h-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} 
                          />
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {streak > 0 ? `${7 - (streak % 7)} days to next milestone` : 'Start reading to build your streak!'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Recent Activity */}
                      <div>
                        <h3 className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recent Activity</h3>
                        
                        {readingHistory.length > 0 ? (
                          <div className="space-y-4">
                            {readingHistory.slice(0, 5).map((item, index) => {
                              const book = books.find(b => b.id === item.book_id);
                              if (!book) return null;
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`flex items-start gap-4 p-3 rounded-lg ${theme === 'dark' 
                                    ? 'bg-slate-800/50 hover:bg-slate-800/80' 
                                    : 'bg-slate-100/50 hover:bg-slate-100/80'} transition-colors`}
                                >
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' 
                                    ? 'bg-blue-900/30 text-blue-400' 
                                    : 'bg-blue-100 text-blue-600'}`}>
                                    <BookOpen className="h-5 w-5" />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                                      Reading <span className="font-medium">{book.title}</span>
                                    </p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                      Page {item.last_read_page} • {formatDistanceToNow(new Date(item.last_read_at), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className={`p-8 text-center rounded-lg border ${theme === 'dark' 
                            ? 'border-slate-800 bg-slate-800/20' 
                            : 'border-slate-200 bg-slate-100/20'}`}>
                            <BookOpen className={`h-10 w-10 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No reading activity yet</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              Start reading books to track your activity
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Reading Stats */}
                      <div>
                        <h3 className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Reading Statistics</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className={`p-4 rounded-lg border ${theme === 'dark' 
                            ? 'border-blue-900/30 bg-slate-800/30' 
                            : 'border-blue-300/30 bg-slate-100/30'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Books Read</p>
                            </div>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {readingHistory.length}
                            </p>
                          </div>
                          
                          <div className={`p-4 rounded-lg border ${theme === 'dark' 
                            ? 'border-purple-800/30 bg-slate-800/30' 
                            : 'border-purple-300/30 bg-slate-100/30'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className={`h-5 w-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Reading Time</p>
                            </div>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {Math.floor(readingHistory.length * 1.5)}h
                            </p>
                          </div>
                          
                          <div className={`p-4 rounded-lg border ${theme === 'dark' 
                            ? 'border-pink-800/30 bg-slate-800/30' 
                            : 'border-pink-300/30 bg-slate-100/30'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Award className={`h-5 w-5 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`} />
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Achievements</p>
                            </div>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {Math.min(5, Math.floor(readingHistory.length / 2))}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Favorites Section */}
                <Card className={`border ${theme === 'dark' ? 'border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90' : 'border-blue-300/30 shadow-lg shadow-blue-500/5 bg-white/90'} backdrop-blur`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Favorite Books</CardTitle>
                        <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Books you've marked as favorites</CardDescription>
                      </div>
                      <Badge variant="outline" className={theme === 'dark' ? 'border-red-500/30 text-red-400' : 'border-red-500/30 text-red-600'}>
                        <Heart className="h-3 w-3 mr-1 fill-current" />
                        {favoriteBookIds.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {favoriteBooks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favoriteBooks.slice(0, 6).map((book) => (
                          <div 
                            key={book.id} 
                            className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' 
                              ? 'bg-slate-800/50 hover:bg-slate-800/80' 
                              : 'bg-slate-100/50 hover:bg-slate-100/80'} transition-colors`}
                          >
                            <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {book.title}
                              </p>
                              <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {book.author}
                              </p>
                            </div>
                            
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className={`h-8 w-8 ${theme === 'dark' 
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-950/30' 
                                : 'text-red-600 hover:text-red-500 hover:bg-red-100/50'}`}
                              onClick={() => toggleFavorite(book.id)}
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`p-8 text-center rounded-lg border ${theme === 'dark' 
                        ? 'border-slate-800 bg-slate-800/20' 
                        : 'border-slate-200 bg-slate-100/20'}`}>
                        <Heart className={`h-10 w-10 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No favorite books yet</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Mark books as favorites to see them here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Reading Goals Tab */}
              <TabsContent value="goals" className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Reading Goals</h2>
                  <Button 
                    onClick={() => setShowGoalModal(true)}
                    className={`${theme === 'dark' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'} text-white`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Goal
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {goals.length > 0 ? (
                    goals.map((goal) => (
                      <Card 
                        key={goal.id} 
                        className={`border ${theme === 'dark' ? 'border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90' : 'border-blue-300/30 shadow-lg shadow-blue-500/5 bg-white/90'} backdrop-blur`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{goal.title}</CardTitle>
                              <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                {goal.deadline ? `Target: ${new Date(goal.deadline).toLocaleDateString()}` : 'No deadline set'}
                              </CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-slate-900'}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent 
                                align="end" 
                                className={theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
                              >
                                <DropdownMenuItem 
                                  className={theme === 'dark' ? 'text-white hover:bg-slate-800' : 'text-slate-900 hover:bg-slate-100'}
                                  onClick={() => handleAddBooksToGoal(goal)}
                                >
                                  <BookPlus className="h-4 w-4 mr-2" />
                                  Add Books
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} />
                                <DropdownMenuItem 
                                  className={theme === 'dark' ? 'text-red-400 hover:bg-red-950/30 hover:text-red-300' : 'text-red-600 hover:bg-red-100/50 hover:text-red-500'}
                                  onClick={() => handleDeleteGoal(goal.id)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete Goal
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Progress: {goal.completed_books} of {goal.target_books} books
                                </span>
                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                  {Math.round((goal.completed_books / goal.target_books) * 100)}%
                                </span>
                              </div>
                              <Progress 
                                value={(goal.completed_books / goal.target_books) * 100} 
                                className={`h-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} 
                              />
                            </div>
                            
                            {goal.description && (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {goal.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={theme === 'dark' ? 'border-blue-500/30 text-blue-400' : 'border-blue-500/30 text-blue-600'}>
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(goal.created_at).toLocaleDateString()}
                              </Badge>
                              
                              {goal.completed_books === goal.target_books && (
                                <Badge className={theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'}>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className={`border ${theme === 'dark' ? 'border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90' : 'border-blue-300/30 shadow-lg shadow-blue-500/5 bg-white/90'} backdrop-blur`}>
                      <CardContent className="p-8 text-center">
                        <Target className={`h-12 w-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>No Reading Goals Yet</h3>
                        <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Set reading goals to track your progress and stay motivated
                        </p>
                        <Button 
                          onClick={() => setShowGoalModal(true)}
                          className={`${theme === 'dark' 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                            : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'} text-white`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Goal
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              {/* Account Settings Tab */}
              <TabsContent value="account" className="space-y-4">
                <Card className={`border ${theme === 'dark' ? 'border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90' : 'border-blue-300/30 shadow-lg shadow-blue-500/5 bg-white/90'} backdrop-blur`}>
                  <CardHeader>
                    <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Account Information</CardTitle>
                    <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Manage your personal details and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Email Field */}
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg border ${theme === 'dark' 
                          ? 'border-blue-900/30 bg-slate-800/30' 
                          : 'border-blue-300/30 bg-slate-100/30'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Mail className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Email Address</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className={theme === 'dark' ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-950/50' : 'text-blue-600 hover:text-blue-500 hover:bg-blue-100/50'}
                              onClick={() => {
                                if (editingField === 'email') {
                                  setEditingField(null);
                                  setEmailError('');
                                } else {
                                  setEditingField('email');
                                  setEditValue(userData.email);
                                }
                              }}
                            >
                              {editingField === 'email' ? 'Cancel' : 'Edit'}
                            </Button>
                          </div>
                          {editingField === 'email' ? (
                            <div className="space-y-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className={`${theme === 'dark' ? 'bg-slate-800 text-white border-blue-900/50' : 'bg-white text-slate-900 border-blue-300/50'}`}
                                placeholder="Enter email address"
                              />
                              {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
                              <div className="flex justify-end gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingField(null);
                                    setEmailError('');
                                  }}
                                  disabled={isSavingField}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleSaveField('email')}
                                  disabled={isSavingField}
                                >
                                  {isSavingField ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                      Saving...
                                    </>
                                  ) : (
                                    'Save'
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{userData.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg border ${theme === 'dark' 
                          ? 'border-purple-900/30 bg-slate-800/30' 
                          : 'border-purple-300/30 bg-slate-100/30'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Phone className={`h-5 w-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Phone Number</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className={theme === 'dark' ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/50' : 'text-purple-600 hover:text-purple-500 hover:bg-purple-100/50'}
                              onClick={() => {
                                if (editingField === 'phone') {
                                  setEditingField(null);
                                  setPhoneError('');
                                } else {
                                  setEditingField('phone');
                                  setEditValue(userData.phone || '');
                                }
                              }}
                            >
                              {editingField === 'phone' ? 'Cancel' : 'Edit'}
                            </Button>
                          </div>
                          {editingField === 'phone' ? (
                            <div className="space-y-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className={`${theme === 'dark' ? 'bg-slate-800 text-white border-purple-900/50' : 'bg-white text-slate-900 border-purple-300/50'}`}
                                placeholder="Enter phone number"
                              />
                              {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
                              <div className="flex justify-end gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingField(null);
                                    setPhoneError('');
                                  }}
                                  disabled={isSavingField}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleSaveField('phone')}
                                  disabled={isSavingField}
                                >
                                  {isSavingField ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                      Saving...
                                    </>
                                  ) : (
                                    'Save'
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                              {userData.phone || 'Not provided'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Address Field */}
                      <div className="md:col-span-2">
                        <div className={`p-4 rounded-lg border ${theme === 'dark' 
                          ? 'border-green-900/30 bg-slate-800/30' 
                          : 'border-green-300/30 bg-slate-100/30'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin className={`h-5 w-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Address</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className={theme === 'dark' ? 'text-green-400 hover:text-green-300 hover:bg-green-950/50' : 'text-green-600 hover:text-green-500 hover:bg-green-100/50'}
                              onClick={() => {
                                if (editingField === 'address') {
                                  setEditingField(null);
                                  setAddressError('');
                                } else {
                                  setEditingField('address');
                                  setEditValue(userData.address || '');
                                }
                              }}
                            >
                              {editingField === 'address' ? 'Cancel' : 'Edit'}
                            </Button>
                          </div>
                          {editingField === 'address' ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className={`${theme === 'dark' ? 'bg-slate-800 text-white border-green-900/50' : 'bg-white text-slate-900 border-green-300/50'}`}
                                placeholder="Enter your address"
                                rows={3}
                              />
                              {addressError && <p className="text-red-500 text-xs">{addressError}</p>}
                              <div className="flex justify-end gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingField(null);
                                    setAddressError('');
                                  }}
                                  disabled={isSavingField}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleSaveField('address')}
                                  disabled={isSavingField}
                                >
                                  {isSavingField ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                      Saving...
                                    </>
                                  ) : (
                                    'Save'
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                              {userData.address || 'Not provided'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Theme Toggle Section */}
                    <Separator className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} />
                    
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Preferences</h3>
                      <div className={`p-4 rounded-lg border ${theme === 'dark' 
                        ? 'border-slate-800 bg-slate-800/30' 
                        : 'border-slate-200 bg-slate-100/30'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {theme === 'dark' ? (
                              <Moon className="h-5 w-5 text-blue-400" />
                            ) : (
                              <Sun className="h-5 w-5 text-yellow-600" />
                            )}
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                Theme
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Currently using {theme === 'dark' ? 'dark' : 'light'} mode
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleTheme}
                            className={theme === 'dark' 
                              ? 'border-slate-700 hover:bg-slate-800' 
                              : 'border-slate-300 hover:bg-slate-100'}
                          >
                            {theme === 'dark' ? (
                              <>
                                <Sun className="h-4 w-4 mr-2" />
                                Light Mode
                              </>
                            ) : (
                              <>
                                <Moon className="h-4 w-4 mr-2" />
                                Dark Mode
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Reading Goals Modal */}
      <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
        <DialogContent className={`sm:max-w-[500px] ${theme === 'dark' ? 'bg-slate-900 text-white border-blue-900/30' : 'bg-white text-slate-900 border-blue-300/30'}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className={`h-5 w-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              Create Reading Goal
            </DialogTitle>
            <DialogDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Set a new reading goal to track your progress
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-title" className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Goal Title</Label>
              <Input 
                id="goal-title" 
                placeholder="E.g., Summer Reading Challenge" 
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal-target" className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Target Books</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="goal-target" 
                  type="number" 
                  min="1"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 1)}
                  className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}
                />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>books</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal-deadline" className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                Deadline (Optional)
              </Label>
              <Input 
                id="goal-deadline" 
                type="date" 
                value={newGoalDeadline}
                onChange={(e) => setNewGoalDeadline(e.target.value)}
                className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal-description" className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                Description (Optional)
              </Label>
              <Textarea 
                id="goal-description" 
                placeholder="Add details about your reading goal..."
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowGoalModal(false)}
              className={theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGoal}
              className={`${theme === 'dark' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'} text-white`}
            >
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Book Selection Modal */}
      <Dialog open={showBookSelectionModal} onOpenChange={setShowBookSelectionModal}>
        <DialogContent className={`sm:max-w-[600px] ${theme === 'dark' ? 'bg-slate-900 text-white border-blue-900/30' : 'bg-white text-slate-900 border-blue-300/30'}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookPlus className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              Add Books to Goal
            </DialogTitle>
            <DialogDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {selectedGoal && `Select books to add to "${selectedGoal.title}"`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Select Books</Label>
              <div className={`p-4 rounded-lg border max-h-[300px] overflow-y-auto ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-100/50'}`}>
                {books.slice(0, 10).map((book) => (
                  <div 
                    key={book.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg mb-2 ${theme === 'dark' 
                      ? 'hover:bg-slate-700/50' 
                      : 'hover:bg-slate-200/50'}`}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id={`book-${book.id}`}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <label htmlFor={`book-${book.id}`} className="flex-1 min-w-0 cursor-pointer">
                      <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {book.title}
                      </p>
                      <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {book.author}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBookSelectionModal(false)}
              className={theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}
            >
              Cancel
            </Button>
            <Button 
              className={`${theme === 'dark' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white`}
            >
              Add Selected Books
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        amount={999} 
        purpose="Premium Subscription"
      />
    </div>
  );
}