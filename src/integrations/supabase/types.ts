// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          title: string;
          author?: string | null;
          genre?: string | null;
          description?: string | null;
          cover_image?: string | null;
          pdf_path: string;
          publish_year?: number | null;
          pages?: number | null;
          rating?: number | null;
          language?: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          author?: string | null;
          genre?: string | null;
          description?: string | null;
          cover_image?: string | null;
          pdf_path: string;
          publish_year?: number | null;
          pages?: number | null;
          rating?: number | null;
          language?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string | null;
          genre?: string | null;
          description?: string | null;
          cover_image?: string | null;
          pdf_path?: string;
          publish_year?: number | null;
          pages?: number | null;
          rating?: number | null;
          language?: string | null;
          tags?: string[];
          created_at?: string;
        };
      };
      user_library: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          title: string;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          title: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string;
          title?: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reading_history: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          last_read_page: number;
          last_read_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          last_read_page?: number;
          last_read_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          last_read_page?: number;
          last_read_at?: string;
          created_at?: string;
        };
      };
      reading_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_books: number;
          completed_books: number;
          book_ids: string[];
          deadline?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_books?: number;
          completed_books?: number;
          book_ids?: string[];
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          target_books?: number;
          completed_books?: number;
          book_ids?: string[];
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reading_streaks: {
        Row: {
          id: string;
          user_id: string;
          read_date: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          read_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          read_date?: string;
          created_at?: string;
        };
      };
    };
  };
}

