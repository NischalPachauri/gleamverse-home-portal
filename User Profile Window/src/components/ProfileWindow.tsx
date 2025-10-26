import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { BookOpen, Heart, Settings, Award, TrendingUp, Calendar, MapPin, Mail, Phone, HeartHandshake, DollarSign, Star, BookMarked, User } from "lucide-react";
import { useState } from "react";

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  readDate?: string;
}

export function ProfileWindow() {
  const [donationAmount, setDonationAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  const userData = {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@email.com",
    phone: "+1 (555) 123-4567",
    joinedDate: "January 2023",
    address: "145 Library Lane, Booktown",
    avatar: "https://images.unsplash.com/photo-1656205529884-ce561e55f85f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwcGVyc29uJTIwcmVhZGluZ3xlbnwxfHx8fDE3NjE0MTk4NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
  };

  const readingHistory: Book[] = [
    {
      id: "1",
      title: "Atomic Habits",
      author: "James Clear",
      cover: "https://images.unsplash.com/photo-1661936901394-a993c79303c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBmaWN0aW9ufGVufDF8fHx8MTc2MTM5MTI5OHww&ixlib=rb-4.1.0&q=80&w=1080",
      readDate: "Sep 2025"
    },
    {
      id: "2",
      title: "The Psychology of Money",
      author: "Morgan Housel",
      cover: "https://images.unsplash.com/photo-1604435062356-a880b007922c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBteXN0ZXJ5fGVufDF8fHx8MTc2MTM3MjM3OXww&ixlib=rb-4.1.0&q=80&w=1080",
      readDate: "Aug 2025"
    },
    {
      id: "3",
      title: "Educated",
      author: "Tara Westover",
      cover: "https://images.unsplash.com/photo-1725869973689-425c74f79a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBzY2llbmNlfGVufDF8fHx8MTc2MTM3MjM4MHww&ixlib=rb-4.1.0&q=80&w=1080",
      readDate: "Aug 2025"
    },
    {
      id: "4",
      title: "The Midnight Library",
      author: "Matt Haig",
      cover: "https://images.unsplash.com/photo-1661936901394-a993c79303c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBmaWN0aW9ufGVufDF8fHx8MTc2MTM5MTI5OHww&ixlib=rb-4.1.0&q=80&w=1080",
      readDate: "Jul 2025"
    },
    {
      id: "5",
      title: "The Silent Patient",
      author: "Alex Michaelides",
      cover: "https://images.unsplash.com/photo-1604435062356-a880b007922c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBteXN0ZXJ5fGVufDF8fHx8MTc2MTM3MjM3OXww&ixlib=rb-4.1.0&q=80&w=1080",
      readDate: "Jun 2025"
    },
    {
      id: "6",
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      cover: "https://images.unsplash.com/photo-1725869973689-425c74f79a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBzY2llbmNlfGVufDF8fHx8MTc2MTM3MjM4MHww&ixlib=rb-4.1.0&q=80&w=1080",
      readDate: "May 2025"
    }
  ];

  const favoriteBooks: Book[] = [
    {
      id: "7",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      cover: "https://images.unsplash.com/photo-1661936901394-a993c79303c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBmaWN0aW9ufGVufDF8fHx8MTc2MTM5MTI5OHww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: "8",
      title: "1984",
      author: "George Orwell",
      cover: "https://images.unsplash.com/photo-1604435062356-a880b007922c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBteXN0ZXJ5fGVufDF8fHx8MTc2MTM3MjM3OXww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: "9",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      cover: "https://images.unsplash.com/photo-1725869973689-425c74f79a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBzY2llbmNlfGVufDF8fHx8MTc2MTM3MjM4MHww&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  const stats = {
    booksRead: 47,
    currentStreak: 12,
    totalDays: 287,
    yearlyGoal: 52,
    yearlyProgress: 90,
    totalDonations: 150
  };

  const donationHistory = [
    { id: "1", amount: 50, date: "Sep 15, 2025", purpose: "General Support" },
    { id: "2", amount: 75, date: "Jun 20, 2025", purpose: "New Books Fund" },
    { id: "3", amount: 25, date: "Mar 10, 2025", purpose: "Children's Section" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card className="shadow-xl border border-blue-900/30 bg-slate-900/90 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24 border-4 border-blue-500/30 shadow-lg shadow-blue-500/20">
                      <AvatarImage src={userData.avatar} alt={userData.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600">SM</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-2 border-slate-900"></div>
                  </div>
                  
                  <h2 className="mb-1 text-white">{userData.name}</h2>
                  <Badge variant="secondary" className="mb-4 bg-blue-900/50 text-blue-200 border-blue-700/50">
                    <User className="h-3 w-3 mr-1" />
                    Member
                  </Badge>

                  <Separator className="my-4 bg-slate-800" />

                  {/* Quick Stats */}
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-purple-950/50 border border-purple-800/30">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-gray-300">Books Read</span>
                      </div>
                      <span className="text-white">{stats.booksRead}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-950/50 border border-blue-800/30">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-gray-300">Day Streak</span>
                      </div>
                      <span className="text-white">{stats.currentStreak}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-pink-950/50 border border-pink-800/30">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-400" />
                        <span className="text-sm text-gray-300">Favorites</span>
                      </div>
                      <span className="text-white">{favoriteBooks.length}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/50 border border-emerald-800/30">
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-gray-300">Donated</span>
                      </div>
                      <span className="text-white">${stats.totalDonations}</span>
                    </div>
                  </div>

                  <Separator className="my-4 bg-slate-800" />

                  <div className="w-full text-left space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {userData.joinedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{userData.email}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-500/20">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="space-y-6">
            {/* Achievement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-purple-900/30 shadow-lg shadow-purple-500/10 bg-gradient-to-br from-purple-600 to-purple-800 text-white overflow-hidden">
                <CardContent className="p-6 relative">
                  <Award className="absolute right-4 top-4 h-12 w-12 opacity-20" />
                  <div className="relative">
                    <p className="text-purple-200 text-sm mb-1">Books This Year</p>
                    <p className="text-3xl mb-2">{stats.booksRead}</p>
                    <Progress value={stats.yearlyProgress} className="h-2 bg-purple-900/50" />
                    <p className="text-xs text-purple-200 mt-2">{stats.yearlyProgress}% of {stats.yearlyGoal} goal</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-blue-900/30 shadow-lg shadow-blue-500/10 bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
                <CardContent className="p-6 relative">
                  <TrendingUp className="absolute right-4 top-4 h-12 w-12 opacity-20" />
                  <div className="relative">
                    <p className="text-blue-200 text-sm mb-1">Reading Streak</p>
                    <p className="text-3xl mb-2">{stats.currentStreak} days</p>
                    <p className="text-xs text-blue-200">{stats.totalDays} total reading days</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-pink-900/30 shadow-lg shadow-pink-500/10 bg-gradient-to-br from-pink-600 to-purple-700 text-white overflow-hidden">
                <CardContent className="p-6 relative">
                  <Star className="absolute right-4 top-4 h-12 w-12 opacity-20" />
                  <div className="relative">
                    <p className="text-pink-200 text-sm mb-1">Achievements</p>
                    <p className="text-3xl mb-2">12</p>
                    <p className="text-xs text-pink-200">Badges earned</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="reading" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-slate-900/60 backdrop-blur border border-blue-900/30">
                <TabsTrigger value="reading" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/20 text-gray-400">
                  <BookMarked className="h-4 w-4" />
                  <span className="hidden sm:inline">Reading</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/20 text-gray-400">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Favorites</span>
                </TabsTrigger>
                <TabsTrigger value="donations" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/20 text-gray-400">
                  <HeartHandshake className="h-4 w-4" />
                  <span className="hidden sm:inline">Donations</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/20 text-gray-400">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
              </TabsList>

              {/* Reading History Tab */}
              <TabsContent value="reading" className="space-y-4">
                <Card className="border border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white">Reading History</CardTitle>
                    <CardDescription className="text-gray-400">Books you've explored at GleamVerse</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {readingHistory.map((book) => (
                        <div key={book.id} className="group cursor-pointer">
                          <div className="relative overflow-hidden rounded-lg shadow-md shadow-blue-500/10 border border-blue-900/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/20 group-hover:-translate-y-1 group-hover:border-purple-500/50">
                            <ImageWithFallback 
                              src={book.cover}
                              alt={book.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                <p className="text-xs">{book.readDate}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <h4 className="text-sm line-clamp-1 text-white">{book.title}</h4>
                            <p className="text-xs text-gray-400 line-clamp-1">{book.author}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="space-y-4">
                <Card className="border border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white">Favorite Books</CardTitle>
                    <CardDescription className="text-gray-400">Your all-time favorites from our collection</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteBooks.map((book) => (
                        <div key={book.id} className="group">
                          <div className="relative overflow-hidden rounded-lg shadow-lg shadow-pink-500/10 border border-pink-900/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-pink-500/30 group-hover:border-pink-500/50">
                            <ImageWithFallback 
                              src={book.cover}
                              alt={book.title}
                              className="w-full h-64 object-cover"
                            />
                            <div className="absolute top-3 right-3">
                              <div className="bg-slate-900/90 backdrop-blur rounded-full p-2 shadow-lg border border-pink-500/30">
                                <Heart className="h-5 w-5 text-pink-400 fill-pink-400" />
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <h3 className="mb-1 text-white">{book.title}</h3>
                            <p className="text-sm text-gray-400 mb-3">by {book.author}</p>
                            <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Donations Tab */}
              <TabsContent value="donations" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Make a Donation Card */}
                  <Card className="border border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <HeartHandshake className="h-5 w-5 text-emerald-400" />
                        Support GleamVerse
                      </CardTitle>
                      <CardDescription className="text-gray-400">Help us maintain and expand our free library</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {[10, 25, 50].map((amount) => (
                          <Button
                            key={amount}
                            variant={donationAmount === amount.toString() ? "default" : "outline"}
                            onClick={() => {
                              setDonationAmount(amount.toString());
                              setCustomAmount("");
                            }}
                            className={donationAmount === amount.toString() ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0" : "border-emerald-900/30 text-gray-300 hover:bg-emerald-950/50 hover:text-emerald-300"}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom-amount" className="text-gray-300">Custom Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="custom-amount"
                            type="number"
                            placeholder="Enter amount"
                            className="pl-9 bg-slate-800/50 border-blue-900/30 text-white placeholder:text-gray-500"
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(e.target.value);
                              setDonationAmount("");
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-gray-300">Message (Optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Share why you're supporting GleamVerse..."
                          className="resize-none bg-slate-800/50 border-blue-900/30 text-white placeholder:text-gray-500"
                          rows={3}
                        />
                      </div>

                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/20">
                        <HeartHandshake className="h-4 w-4 mr-2" />
                        Donate Now
                      </Button>

                      <p className="text-xs text-gray-400 text-center">
                        Your donation helps us acquire new books, maintain our facilities, and keep the library free for everyone.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Donation History Card */}
                  <Card className="border border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="text-white">Your Contributions</CardTitle>
                      <CardDescription className="text-gray-400">Thank you for supporting our community library</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-emerald-950/50 to-green-950/50 border border-emerald-800/30">
                        <p className="text-sm text-gray-400 mb-1">Total Contributions</p>
                        <p className="text-3xl text-emerald-400">${stats.totalDonations}</p>
                      </div>

                      <div className="space-y-3">
                        {donationHistory.map((donation) => (
                          <div key={donation.id} className="p-4 rounded-lg border border-blue-900/30 bg-slate-800/30 hover:shadow-md hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="mb-1 text-white">${donation.amount}</p>
                                <p className="text-sm text-gray-400">{donation.purpose}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant="secondary" className="mb-1 bg-blue-900/50 text-blue-200 border-blue-700/50">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {donation.date}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Account Settings Tab */}
              <TabsContent value="account" className="space-y-4">
                <Card className="border border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white">Account Information</CardTitle>
                    <CardDescription className="text-gray-400">Manage your personal details and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-blue-900/30 bg-slate-800/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Mail className="h-5 w-5 text-blue-400" />
                              <p className="text-sm text-gray-400">Email Address</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/50">Edit</Button>
                          </div>
                          <p className="text-white">{userData.email}</p>
                        </div>

                        <div className="p-4 rounded-lg border border-blue-900/30 bg-slate-800/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Phone className="h-5 w-5 text-blue-400" />
                              <p className="text-sm text-gray-400">Phone Number</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/50">Edit</Button>
                          </div>
                          <p className="text-white">{userData.phone}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-blue-900/30 bg-slate-800/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-blue-400" />
                              <p className="text-sm text-gray-400">Address</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/50">Edit</Button>
                          </div>
                          <p className="text-white">{userData.address}</p>
                        </div>

                        <div className="p-4 rounded-lg border border-purple-800/30 bg-gradient-to-r from-purple-950/50 to-pink-950/50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-purple-400" />
                              <p className="text-sm text-gray-400">Member Since</p>
                            </div>
                          </div>
                          <p className="text-white">{userData.joinedDate}</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-slate-800" />

                    <div>
                      <h3 className="mb-3 text-white">Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button variant="outline" className="justify-start h-auto py-3 border-blue-900/30 hover:bg-blue-950/50 hover:border-blue-500/50">
                          <div className="text-left">
                            <p className="text-sm text-white">Email Notifications</p>
                            <p className="text-xs text-gray-400">Manage your email preferences</p>
                          </div>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 border-blue-900/30 hover:bg-blue-950/50 hover:border-blue-500/50">
                          <div className="text-left">
                            <p className="text-sm text-white">Privacy Settings</p>
                            <p className="text-xs text-gray-400">Control your data and privacy</p>
                          </div>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 border-blue-900/30 hover:bg-blue-950/50 hover:border-blue-500/50">
                          <div className="text-left">
                            <p className="text-sm text-white">Reading Preferences</p>
                            <p className="text-xs text-gray-400">Set your reading goals</p>
                          </div>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 border-blue-900/30 hover:bg-blue-950/50 hover:border-blue-500/50">
                          <div className="text-left">
                            <p className="text-sm text-white">Account Security</p>
                            <p className="text-xs text-gray-400">Password and 2FA settings</p>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
