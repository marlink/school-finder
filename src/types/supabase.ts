export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          role: string
          subscription_status: string
          subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          role?: string
          subscription_status?: string
          subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          role?: string
          subscription_status?: string
          subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schools: {
        Row: {
          id: string
          name: string
          short_name: string | null
          type: string
          address: Json | null
          contact: Json | null
          location: Json | null
          google_place_id: string | null
          official_id: string | null
          status: string
          student_count: number | null
          teacher_count: number | null
          established_year: number | null
          languages: Json | null
          specializations: Json | null
          facilities: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name?: string | null
          type: string
          address?: Json | null
          contact?: Json | null
          location?: Json | null
          google_place_id?: string | null
          official_id?: string | null
          status?: string
          student_count?: number | null
          teacher_count?: number | null
          established_year?: number | null
          languages?: Json | null
          specializations?: Json | null
          facilities?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string | null
          type?: string
          address?: Json | null
          contact?: Json | null
          location?: Json | null
          google_place_id?: string | null
          official_id?: string | null
          status?: string
          student_count?: number | null
          teacher_count?: number | null
          established_year?: number | null
          languages?: Json | null
          specializations?: Json | null
          facilities?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      school_images: {
        Row: {
          id: string
          school_id: string
          image_url: string
          image_type: string
          alt_text: string | null
          caption: string | null
          source: string
          is_verified: boolean
          display_order: number
          uploaded_at: string
        }
        Insert: {
          id?: string
          school_id: string
          image_url: string
          image_type?: string
          alt_text?: string | null
          caption?: string | null
          source?: string
          is_verified?: boolean
          display_order?: number
          uploaded_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          image_url?: string
          image_type?: string
          alt_text?: string | null
          caption?: string | null
          source?: string
          is_verified?: boolean
          display_order?: number
          uploaded_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          school_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          school_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          school_id?: string
          notes?: string | null
          created_at?: string
        }
      }
      user_searches: {
        Row: {
          user_id: string
          search_count: number
          last_reset: string
        }
        Insert: {
          user_id: string
          search_count?: number
          last_reset?: string
        }
        Update: {
          user_id?: string
          search_count?: number
          last_reset?: string
        }
      }
      school_analytics: {
        Row: {
          school_id: string
          date: string
          page_views: number
          favorites_added: number
          avg_time_on_page: number
          click_through_rate: number
        }
        Insert: {
          school_id: string
          date: string
          page_views?: number
          favorites_added?: number
          avg_time_on_page?: number
          click_through_rate?: number
        }
        Update: {
          school_id?: string
          date?: string
          page_views?: number
          favorites_added?: number
          avg_time_on_page?: number
          click_through_rate?: number
        }
      }
      search_analytics: {
        Row: {
          date: string
          search_term: string
          search_count: number
          avg_results: number
        }
        Insert: {
          date: string
          search_term: string
          search_count?: number
          avg_results?: number
        }
        Update: {
          date?: string
          search_term?: string
          search_count?: number
          avg_results?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type School = Database['public']['Tables']['schools']['Row']
export type SchoolImage = Database['public']['Tables']['school_images']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']

// School with images
export type SchoolWithImages = School & {
  school_images: SchoolImage[]
  is_favorite?: boolean
}

// Address and contact types
export interface SchoolAddress {
  street?: string
  city?: string
  postal?: string
  voivodeship?: string
  district?: string
}

export interface SchoolContact {
  phone?: string
  email?: string
  website?: string
  fax?: string
}

export interface SchoolLocation {
  latitude?: number
  longitude?: number
}
