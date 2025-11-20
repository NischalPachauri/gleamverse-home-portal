import React from 'react';
import { Heart, BookOpen } from 'lucide-react';
import { Book, UserData } from '../../types/profile';

interface FavoritesSectionProps {
    theme: 'light' | 'dark';
    userData: UserData;
    books: Book[];
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
    theme,
    userData,
    books
}) => {
    const favoriteBooks = books.filter(book => userData.favoriteBookIds.includes(book.id));

    return (
        <div className="mt-8">
            <h3 className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Favorite Books</h3>

            {favoriteBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favoriteBooks.map((book) => (
                        <div
                            key={book.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${theme === 'dark'
                                ? 'border-slate-800 bg-slate-800/30 hover:bg-slate-800/50'
                                : 'border-slate-200 bg-slate-100/30 hover:bg-slate-100/50'} transition-colors`}
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
                                <h4 className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    {book.title}
                                </h4>
                                <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {book.author}
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                    <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                        Favorited
                                    </span>
                                </div>
                            </div>
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
        </div>
    );
};
