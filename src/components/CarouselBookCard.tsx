import { Book } from "@/types/profile";
import EnhancedImage from "./EnhancedImage";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Book as BookIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselBookCardProps {
    book: Book;
}

export function CarouselBookCard({ book }: CarouselBookCardProps) {
    const navigate = useNavigate();
    const genres = book.genres || (book.genre ? [book.genre] : []);

    const handleRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/book/${book.id}`);
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (book.pdfPath) {
            const link = document.createElement('a');
            link.href = book.pdfPath;
            link.download = `${book.title}.pdf`;
            link.click();
        }
    };

    return (
        <div
            className="bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl dark:shadow-2xl border border-purple-200/50 dark:border-purple-500/20 hover:border-purple-400/60 transition-all duration-300 hover:shadow-purple-500/30 hover:shadow-2xl group hover:-translate-y-2 relative cursor-pointer h-full flex flex-col"
            onClick={() => navigate(`/book/${book.id}`)}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/5 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none"></div>

            <div className="relative overflow-hidden shrink-0">
                <div className="aspect-[2/3]">
                    <EnhancedImage
                        bookTitle={book.title}
                        alt={book.title}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* Action buttons overlay */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleRead}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <BookIcon className="w-4 h-4 mr-1" />
                        Read
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleDownload}
                        className="bg-white/90 hover:bg-white text-slate-900"
                    >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                    </Button>
                </div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
            </div>

            <div className="p-4 space-y-1 relative flex flex-col grow">
                <h3 className="text-slate-900 dark:text-white font-bold group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors text-base leading-tight">
                    {book.title}
                </h3>

                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                    {genres.slice(0, 3).map((genre, i) => (
                        <Badge
                            key={`${genre}-${i}`}
                            variant="secondary"
                            className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800/60 border border-purple-200 dark:border-purple-500/30 text-xs shadow-sm"
                        >
                            {genre}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
