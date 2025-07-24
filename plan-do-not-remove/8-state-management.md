# School Finder Portal - Zarządzanie Stanem

> **WAŻNE**: NIGDY nie używaj plików z folderu `-Trash`. Folder ten zawiera przestarzałe lub odrzucone dokumenty, które nie powinny być wykorzystywane w implementacji.

## 1. Przegląd

W School Finder Portal używamy kombinacji React Context API i SWR do zarządzania stanem aplikacji. Ten dokument opisuje, jak zorganizowane jest zarządzanie stanem w projekcie.

## 2. React Context API

React Context API jest używane do zarządzania globalnym stanem aplikacji, takim jak stan uwierzytelnienia użytkownika, preferencje motywu i limity wyszukiwania.

### 2.1. AuthContext

```tsx
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "user" | "admin";
  subscription: "free" | "premium";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id as string,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role as "user" | "admin",
        subscription: session.user.subscription as "free" | "premium",
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isPremium = user?.subscription === "premium";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isPremium,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 2.2. ThemeContext

```tsx
// contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (storedTheme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleThemeChange,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

### 2.3. SearchLimitContext

```tsx
// contexts/SearchLimitContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type SearchLimitContextType = {
  searchCount: number;
  incrementSearchCount: () => void;
  resetSearchCount: () => void;
  hasReachedLimit: boolean;
  remainingSearches: number;
};

const SEARCH_LIMIT = 3; // Limit dla użytkowników free
const STORAGE_KEY = "school_finder_search_count";
const TIMESTAMP_KEY = "school_finder_search_timestamp";

const SearchLimitContext = createContext<SearchLimitContextType>({} as SearchLimitContextType);

export const SearchLimitProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isPremium } = useAuth();
  const [searchCount, setSearchCount] = useState(0);

  // Załaduj licznik wyszukiwań przy inicjalizacji
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedCount = localStorage.getItem(STORAGE_KEY);
    const storedTimestamp = localStorage.getItem(TIMESTAMP_KEY);

    if (storedCount && storedTimestamp) {
      const timestamp = parseInt(storedTimestamp, 10);
      const now = Date.now();
      const hoursPassed = (now - timestamp) / (1000 * 60 * 60);

      // Resetuj licznik, jeśli minęło więcej niż 24 godziny
      if (hoursPassed >= 24) {
        localStorage.setItem(STORAGE_KEY, "0");
        localStorage.setItem(TIMESTAMP_KEY, now.toString());
        setSearchCount(0);
      } else {
        setSearchCount(parseInt(storedCount, 10));
      }
    } else {
      localStorage.setItem(STORAGE_KEY, "0");
      localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
    }
  }, []);

  // Resetuj licznik, gdy użytkownik zaloguje się jako premium
  useEffect(() => {
    if (isPremium) {
      resetSearchCount();
    }
  }, [isPremium]);

  const incrementSearchCount = () => {
    if (isPremium) return; // Premium użytkownicy nie mają limitu

    const newCount = searchCount + 1;
    setSearchCount(newCount);
    localStorage.setItem(STORAGE_KEY, newCount.toString());
    localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
  };

  const resetSearchCount = () => {
    setSearchCount(0);
    localStorage.setItem(STORAGE_KEY, "0");
    localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
  };

  const hasReachedLimit = !isPremium && searchCount >= SEARCH_LIMIT;
  const remainingSearches = isPremium ? Infinity : Math.max(0, SEARCH_LIMIT - searchCount);

  return (
    <SearchLimitContext.Provider
      value={{
        searchCount,
        incrementSearchCount,
        resetSearchCount,
        hasReachedLimit,
        remainingSearches,
      }}
    >
      {children}
    </SearchLimitContext.Provider>
  );
};

export const useSearchLimit = () => useContext(SearchLimitContext);
```

## 3. SWR dla Pobierania Danych

Używamy SWR (stale-while-revalidate) do pobierania i buforowania danych z API.

### 3.1. Hooki SWR

```tsx
// hooks/useSchools.ts
import useSWR from "swr";
import { useSearchLimit } from "@/contexts/SearchLimitContext";

type School = {
  id: string;
  name: string;
  type: string;
  city: string;
  region: string;
  address: string;
  contact: string;
  officialId: string;
  googleRating?: number;
  sentimentScore?: number;
  latitude?: number;
  longitude?: number;
};

type SearchParams = {
  query?: string;
  city?: string;
  region?: string;
  type?: string;
  page?: number;
  limit?: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSchools(params: SearchParams = {}) {
  const { incrementSearchCount } = useSearchLimit();
  const { query, city, region, type, page = 1, limit = 10 } = params;

  const searchParams = new URLSearchParams();
  if (query) searchParams.append("query", query);
  if (city) searchParams.append("city", city);
  if (region) searchParams.append("region", region);
  if (type) searchParams.append("type", type);
  searchParams.append("page", page.toString());
  searchParams.append("limit", limit.toString());

  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    schools: School[];
    total: number;
    pages: number;
  }>(`/api/schools?${searchParams.toString()}`, fetcher, {
    onSuccess: () => {
      // Inkrementuj licznik wyszukiwań tylko przy pierwszym wyszukiwaniu
      if (page === 1 && (query || city || region || type)) {
        incrementSearchCount();
      }
    },
  });

  return {
    schools: data?.schools || [],
    total: data?.total || 0,
    pages: data?.pages || 0,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
```

```tsx
// hooks/useSchool.ts
import useSWR from "swr";

type School = {
  id: string;
  name: string;
  type: string;
  city: string;
  region: string;
  address: string;
  contact: string;
  officialId: string;
  googleRating?: number;
  sentimentScore?: number;
  latitude?: number;
  longitude?: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSchool(id: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    school: School;
  }>(id ? `/api/schools/${id}` : null, fetcher);

  return {
    school: data?.school,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
```

```tsx
// hooks/useFavorites.ts
import useSWR from "swr";
import { useAuth } from "@/contexts/AuthContext";

type School = {
  id: string;
  name: string;
  type: string;
  city: string;
  region: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useFavorites() {
  const { isAuthenticated } = useAuth();

  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    favorites: School[];
  }>(isAuthenticated ? "/api/user/favorites" : null, fetcher);

  const addFavorite = async (schoolId: string) => {
    if (!isAuthenticated) return false;

    try {
      const response = await fetch("/api/user/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schoolId }),
      });

      if (response.ok) {
        mutate();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding favorite:", error);
      return false;
    }
  };

  const removeFavorite = async (schoolId: string) => {
    if (!isAuthenticated) return false;

    try {
      const response = await fetch(`/api/user/favorites/${schoolId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        mutate();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing favorite:", error);
      return false;
    }
  };

  return {
    favorites: data?.favorites || [],
    isLoading,
    isError: error,
    isValidating,
    addFavorite,
    removeFavorite,
    mutate,
  };
}
```