import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { BookOpen, Heart, Settings, Award, Target, Calendar, MapPin, Mail, Phone, DollarSign, User, Moon, Sun, LogOut, Plus, Clock, CheckCircle2, BookPlus, Trash, MoreHorizontal, Flame, ChevronLeft, HelpCircle, FileText } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useUserHistory } from "../hooks/useUserHistory";
import { useBookmarks } from "../hooks/useBookmarks";
import { useReadingStreak } from "../hooks/useReadingStreak";
import { useReadingGoals } from "../hooks/useReadingGoals";
import { useTheme } from "../contexts/ThemeContext";
import { books, Book } from "../data/books";
import { ImageWithFallback } from "./ImageWithFallback";
import { getBookCover } from "../utils/bookCoverMapping";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useFavorites } from "../hooks/useFavorites";
import { PaymentModal } from "./PaymentModal";
import { cn } from "../lib/utils";
import supabase from "../integrations/supabase/client";
import { ProfileSidebar } from "./profile/ProfileSidebar";
import { ReadingGoalsSection } from "./profile/ReadingGoalsSection";
import { UserData, ReadingHistoryItem, ReadingGoal } from "../types/profile";
import { ReadingHistorySection } from "./profile/ReadingHistorySection";
import { FavoritesSection } from "./profile/FavoritesSection";

export function ProfileWindow() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const readingHistoryData = useUserHistory();
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
  const createGoal = goalsData?.createGoal || ((goal: { title: string; target_books: number; deadline?: string; description?: string }) => { });
  const deleteGoal = goalsData?.deleteGoal || ((id: string) => { });
  const fetchGoals = goalsData?.refreshGoals || (() => { });
  const favoriteBookIds = favoritesData?.favoriteBooks || [];
  const toggleFavorite = favoritesData?.toggleFavorite || ((id: string) => { });

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
    favoriteBookIds: favoriteBookIds,
  });

  useEffect(() => {
    // Get favorite books data
    const favBooks = favoriteBookIds
      .map(id => books.find(book => book.id === id))
      .filter((book): book is Book => book !== undefined);
    setFavoriteBooks(favBooks);
  }, [favoriteBookIds]);

  const handleSaveField = async (field: string): Promise<void> => {
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

    try {
      // Update user metadata in Supabase
      const updates = {};

      if (field === 'email') {
        // Email requires special handling through auth.updateUser
        const { error } = await supabase.auth.updateUser({ email: editValue });
        if (error) throw error;
      } else {
        // For other fields, update user_metadata
        const metadata = user?.user_metadata ? { ...user.user_metadata } : {};

        // Map field names to metadata keys
        const metadataKey = field === 'name' ? 'full_name' : field;
        metadata[metadataKey] = editValue;

        const { error } = await supabase.auth.updateUser({
          data: metadata
        });

        if (error) throw error;
      }

      // Update the local state
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
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update ${field}. Please try again.`);
      setIsSavingField(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      // Convert to base64 for preview and storage
      const reader = new FileReader();

      // Create a promise to handle the FileReader
      const readFileAsDataURL = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Get the base64 data
      const base64Image = await readFileAsDataURL;

      // Update user metadata with the new avatar
      const metadata = user?.user_metadata ? { ...user.user_metadata } : {};
      metadata.avatar_url = base64Image;

      const { error } = await supabase.auth.updateUser({
        data: metadata
      });

      if (error) throw error;

      // Update local state
      setUserData(prev => ({
        ...prev,
        avatar: base64Image
      }));

      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error updating profile photo:', error);
      toast.error('Failed to update profile photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  const [goalTitleError, setGoalTitleError] = useState("");
  const [goalTargetError, setGoalTargetError] = useState("");

  const validateGoalForm = () => {
    let isValid = true;

    // Reset errors
    setGoalTitleError("");
    setGoalTargetError("");

    // Validate title
    if (!newGoalTitle.trim()) {
      setGoalTitleError("Goal title is required");
      isValid = false;
    } else if (newGoalTitle.length > 50) {
      setGoalTitleError("Goal title must be less than 50 characters");
      isValid = false;
    }

    // Validate target
    if (newGoalTarget <= 0) {
      setGoalTargetError("Target must be greater than 0");
      isValid = false;
    } else if (newGoalTarget > 1000) {
      setGoalTargetError("Target must be less than 1000");
      isValid = false;
    }

    return isValid;
  };

  const handleCreateGoal = async () => {
    // Validate form
    if (!validateGoalForm()) {
      return;
    }

    setIsCreatingGoal(true);

    const newGoalData = {
      title: newGoalTitle,
      target_books: newGoalTarget,
      book_ids: [],
      deadline: newGoalDeadline || undefined,
      description: newGoalDescription || undefined,
    };

    try {
      await createGoal(newGoalData);

      // Force refresh the goals list immediately and after a delay to ensure UI updates
      fetchGoals();

      // Schedule another refresh to ensure database sync completes
      setTimeout(() => {
        fetchGoals();
      }, 1000);

      toast.success("Reading goal created successfully!");
      setShowGoalModal(false);

      // Reset form
      setNewGoalTitle("");
      setNewGoalTarget(5);
      setNewGoalDeadline("");
      setNewGoalDescription("");
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create reading goal");
    } finally {
      setIsCreatingGoal(false);
    }
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
      {(bookmarksData?.loading || readingHistoryData?.loading) && (
        <div className="mb-4 p-3 rounded border bg-muted text-muted-foreground text-sm">
          Loading your profile data...
        </div>
      )}
      {bookmarksData?.operationState?.status === 'error' && (
        <div className="mb-4 p-3 rounded border border-destructive bg-destructive/10 text-destructive text-sm">
          Failed to load bookmarks: {bookmarksData?.operationState?.error || 'Unknown error'}
        </div>
      )}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          className={`${theme === 'dark' ? 'text-white hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-100'}`}
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6">
          <ProfileSidebar
            theme={theme}
            userData={userData}
            streak={streak}
            readingHistory={readingHistory}
            bookmarksCount={bookmarks.length}
            favoritesCount={favoriteBookIds.length}
            isUploadingPhoto={isUploadingPhoto}
            handlePhotoUpload={handlePhotoUpload}
            handleUpgradeClick={handleUpgradeClick}
            signOut={signOut}
          />

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
                            value={streak > 0 ? (streak % 7) * (100 / 7) : 0}
                            className={`h-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}
                          />
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {streak > 0 ? `${7 - (streak % 7)} days to next milestone` : 'Start reading to build your streak!'}
                          </span>
                        </div>
                      </div>

                      <ReadingHistorySection
                        theme={theme}
                        readingHistory={readingHistory}
                        books={books}
                      />

                      {/* Reading Stats */}
                      <div>
                        <h3 className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Overview</h3>

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

                      <FavoritesSection
                        theme={theme}
                        userData={userData}
                        books={books}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-6">
                <ReadingGoalsSection
                  theme={theme}
                  goals={goals}
                  setShowGoalModal={setShowGoalModal}
                  handleAddBooksToGoal={handleAddBooksToGoal}
                  handleDeleteGoal={handleDeleteGoal}
                />
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

                    {/* Help/Support Section */}
                    <Separator className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} />

                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Help & Support</h3>
                      <div className={`p-4 rounded-lg border ${theme === 'dark'
                        ? 'border-slate-800 bg-slate-800/30'
                        : 'border-slate-200 bg-slate-100/30'}`}>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <HelpCircle className={`h-5 w-5 mt-0.5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                Need Help?
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Our support team is available 24/7 to assist you with any questions or issues.
                              </p>
                              <Button
                                variant="link"
                                size="sm"
                                className={`px-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                                onClick={() => window.location.href = '/help#contact'}
                              >
                                Contact Support
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <FileText className={`h-5 w-5 mt-0.5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                Documentation
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Browse our comprehensive guides and tutorials to get the most out of GleamVerse.
                              </p>
                              <Button
                                variant="link"
                                size="sm"
                                className={`px-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                                onClick={() => window.location.href = '/help#documentation'}
                              >
                                View Documentation
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div >

      {/* Reading Goals Modal */}
      < Dialog open={showGoalModal} onOpenChange={setShowGoalModal} >
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
                onChange={(e) => {
                  setNewGoalTitle(e.target.value);
                  if (goalTitleError) setGoalTitleError("");
                }}
                className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} ${goalTitleError ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
              />
              {goalTitleError && (
                <p className="text-red-500 text-sm mt-1">{goalTitleError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-target" className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Target Books</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="goal-target"
                  type="number"
                  min="1"
                  value={newGoalTarget}
                  onChange={(e) => {
                    setNewGoalTarget(parseInt(e.target.value) || 1);
                    if (goalTargetError) setGoalTargetError("");
                  }}
                  className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} ${goalTargetError ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>books</span>
              </div>
              {goalTargetError && (
                <p className="text-red-500 text-sm mt-1">{goalTargetError}</p>
              )}
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
              disabled={isCreatingGoal}
              className={`${theme === 'dark'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'} text-white`}
            >
              {isCreatingGoal ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : 'Create Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >


      {/* Book Selection Modal */}
      < Dialog open={showBookSelectionModal} onOpenChange={setShowBookSelectionModal} >
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
      </Dialog >

      {/* Donation Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={500}
        purpose="Donation to GleamVerse"
      />
    </div >
  );
}
