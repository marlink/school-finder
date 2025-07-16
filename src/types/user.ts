export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserStats {
  id: number;
  user_id: string;
  schools_viewed: number;
  reviews_submitted: number;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserFavorite {
  id: number;
  user_id: string;
  school_id: number;
  created_at?: string;
  school?: School; // From the school type
}

export interface UserViewedSchool {
  id: number;
  user_id: string;
  school_id: number;
  viewed_at?: string;
  school?: School; // From the school type
}