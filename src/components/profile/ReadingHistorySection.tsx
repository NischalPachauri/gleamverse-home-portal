import React from 'react';
import { BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Book } from '../../types/profile';
import { ReadingHistoryItem } from '../../types/profile';

interface ReadingHistorySectionProps {
    theme: 'light' | 'dark';
    readingHistory: ReadingHistoryItem[];
    books: Book[];
}

export const ReadingHistorySection: React.FC<ReadingHistorySectionProps> = ({
    theme,
    readingHistory,
    books
}) => {
    return (
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
    );
};
