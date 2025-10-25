// Database types for Supabase
export interface Database {
  public: {
    Tables: {
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
      user_library: {
        Row: {
          id: string;
          book_id: string;
          user_session_id: string;
          current_page: number;
          last_read_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          user_session_id: string;
          current_page?: number;
          last_read_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          user_session_id?: string;
          current_page?: number;
          last_read_at?: string;
          created_at?: string;
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
    };
  };
}

