import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Flame, DollarSign, LogOut } from "lucide-react";
import { toast } from "sonner";
import { UserData, ReadingHistoryItem } from "@/types/profile";

interface ProfileSidebarProps {
    theme: string;
    userData: UserData;
    streak: number;
    readingHistory: ReadingHistoryItem[];
    bookmarksCount: number;
    favoritesCount: number;
    isUploadingPhoto: boolean;
    handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleUpgradeClick: () => void;
    signOut: () => Promise<void>;
}

/**
 * Sidebar component for the Profile page.
 * Displays user avatar, stats (streak, books read), and actions.
 */
export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
    theme,
    userData,
    streak,
    readingHistory,
    bookmarksCount,
    favoritesCount,
    isUploadingPhoto,
    handlePhotoUpload,
    handleUpgradeClick,
    signOut,
}) => {
    return (
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
                                className={`absolute inset-0 rounded-full cursor-pointer transition-opacity ${isUploadingPhoto ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
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
                                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{bookmarksCount}</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Bookmarks</p>
                            </div>
                            <div>
                                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{favoritesCount}</p>
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

                        <Separator className={`my-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                        <div className="w-full text-left">
                            <h3 className={`mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Reading Statistics</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-blue-900/30 bg-slate-800/30' : 'border-blue-300/30 bg-slate-100/30'}`}>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Books Read</p>
                                    <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{readingHistory.length}</p>
                                </div>
                                <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-purple-800/30 bg-slate-800/30' : 'border-purple-300/30 bg-slate-100/30'}`}>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Reading Time (approx)</p>
                                    <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{Math.floor(readingHistory.length * 1.5)}h</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
