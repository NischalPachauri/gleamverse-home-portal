/**
/**
 * Represents a book in the library.
 */
export interface Book {
    id: string;
    title: string;
    author: string;
    genre: string;
    genres?: string[];
    genreDescriptions?: Record<string, string>;
    description: string;
    coverImage?: string;
    pdfPath: string;
    publishYear?: number;
    pages?: number;
    rating?: number;
    language?: string;
    tags?: string[];
}

/**
 * Represents a user's profile data.
 */
export interface UserData {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    joinedDate: string;
    avatar?: string;
    favoriteBookIds: string[];
}

/**
 * Represents a reading goal set by the user.
 */
export interface ReadingGoal {
    id: string;
    title: string;
    target_books: number;
    completed_books: number;
    book_ids: string[];
    deadline?: string;
    description?: string;
    created_at: string;
}

/**
 * Represents an item in the user's reading history.
 */
export interface ReadingHistoryItem {
    id: string;
    book_id: string;
    last_read_page: number;
    last_read_at: string;
    created_at: string;
}
