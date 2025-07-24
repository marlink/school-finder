# School Finder Portal - Biblioteka Komponentów

> **WAŻNE**: NIGDY nie używaj plików z folderu `-Trash`. Folder ten zawiera przestarzałe lub odrzucone dokumenty, które nie powinny być wykorzystywane w implementacji.

## 1. Przegląd

School Finder Portal wykorzystuje komponenty Shadcn UI, które są zbudowane na bazie Radix UI i stylizowane za pomocą Tailwind CSS z motywem tangerine. Poniżej znajduje się lista najważniejszych komponentów używanych w projekcie wraz z ich opisami i przykładami użycia.

Instalacja Shadcn UI z motywem tangerine:
```

## 6. Komponenty Układu Strony

### 6.1. LayoutSwitcher

```tsx
// components/layout/LayoutSwitcher.tsx
import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList, Rows3 } from "lucide-react";

interface LayoutSwitcherProps {
  currentLayout: "horizontal" | "vertical" | "mixed";
  onLayoutChange: (layout: "horizontal" | "vertical" | "mixed") => void;
}

export function LayoutSwitcher({ currentLayout, onLayoutChange }: LayoutSwitcherProps) {
  return (
    <div className="flex items-center space-x-1">
      <Button
        variant={currentLayout === "horizontal" ? "default" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => onLayoutChange("horizontal")}
        title="Układ poziomy"
      >
        <LayoutList className="h-4 w-4" />
      </Button>
      <Button
        variant={currentLayout === "vertical" ? "default" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => onLayoutChange("vertical")}
        title="Układ pionowy"
      >
        <Rows3 className="h-4 w-4" />
      </Button>
      <Button
        variant={currentLayout === "mixed" ? "default" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => onLayoutChange("mixed")}
        title="Układ mieszany"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### 6.2. SchoolCarousel

```tsx
// components/schools/SchoolCarousel.tsx
import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SchoolCard } from "@/components/schools/SchoolCard";

interface SchoolCarouselProps {
  schools: Array<{
    id: string;
    name: string;
    type: string;
    city: string;
    region: string;
    googleRating?: number;
    sentimentScore?: number;
  }>;
  onFavorite?: (id: string) => void;
  favorites?: string[];
}

export function SchoolCarousel({ schools, onFavorite, favorites }: SchoolCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft += 320; // Szerokość karty + margines
        
        // Przewijanie do początku po dojściu do końca
        if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10) {
          carouselRef.current.scrollLeft = 0;
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {schools.map((school) => (
          <div key={school.id} className="flex-shrink-0 w-72 snap-start">
            <SchoolCard 
              school={school} 
              onFavorite={onFavorite} 
              isFavorite={favorites?.includes(school.id)}
            />
          </div>
        ))}
      </div>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### 6.3. RegionsTable

```tsx
// components/regions/RegionsTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface RegionSchool {
  id: string;
  name: string;
  type: string;
  city: string;
  googleRating?: number;
}

interface RegionData {
  name: string;
  schools: RegionSchool[];
}

interface RegionsTableProps {
  regions: RegionData[];
}

export function RegionsTable({ regions }: RegionsTableProps) {
  return (
    <div className="space-y-8">
      {regions.map((region) => (
        <div key={region.name} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{region.name}</h3>
            <Button variant="link" asChild>
              <a href={`/regions/${region.name.toLowerCase()}`}>Zobacz wszystkie</a>
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa szkoły</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Miasto</TableHead>
                <TableHead>Ocena</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {region.schools.slice(0, 5).map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.type}</TableCell>
                  <TableCell>{school.city}</TableCell>
                  <TableCell>
                    {school.googleRating ? `${school.googleRating.toFixed(1)}/5.0` : "Brak ocen"}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/schools/${school.id}`}>Szczegóły</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
```

### 6.4. FilterLayouts

```tsx
// components/filters/HorizontalFilters.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function HorizontalFilters({ onFilter }) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-2 w-full sm:w-auto">
        <label htmlFor="name" className="text-sm font-medium">Nazwa szkoły</label>
        <Input id="name" placeholder="Wpisz nazwę" className="w-full sm:w-[200px]" />
      </div>
      
      <div className="space-y-2 w-full sm:w-auto">
        <label htmlFor="type" className="text-sm font-medium">Typ szkoły</label>
        <Select>
          <SelectTrigger id="type" className="w-full sm:w-[200px]">
            <SelectValue placeholder="Wybierz typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="kindergarten">Przedszkole</SelectItem>
            <SelectItem value="primary">Szkoła Podstawowa</SelectItem>
            <SelectItem value="high_school">Liceum</SelectItem>
            <SelectItem value="technical">Technikum</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2 w-full sm:w-auto">
        <label htmlFor="rating" className="text-sm font-medium">Min. ocena</label>
        <Select>
          <SelectTrigger id="rating" className="w-full sm:w-[200px]">
            <SelectValue placeholder="Wybierz ocenę" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Wszystkie oceny</SelectItem>
            <SelectItem value="3">3.0+</SelectItem>
            <SelectItem value="4">4.0+</SelectItem>
            <SelectItem value="4.5">4.5+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button className="ml-auto">Filtruj</Button>
    </div>
  );
}

// components/filters/VerticalFilters.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function VerticalFilters({ onFilter }) {
  return (
    <div className="space-y-4 w-full max-w-xs">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Nazwa szkoły</label>
        <Input id="name" placeholder="Wpisz nazwę" />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">Typ szkoły</label>
        <Select>
          <SelectTrigger id="type">
            <SelectValue placeholder="Wybierz typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="kindergarten">Przedszkole</SelectItem>
            <SelectItem value="primary">Szkoła Podstawowa</SelectItem>
            <SelectItem value="high_school">Liceum</SelectItem>
            <SelectItem value="technical">Technikum</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="rating" className="text-sm font-medium">Min. ocena</label>
        <Select>
          <SelectTrigger id="rating">
            <SelectValue placeholder="Wybierz ocenę" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Wszystkie oceny</SelectItem>
            <SelectItem value="3">3.0+</SelectItem>
            <SelectItem value="4">4.0+</SelectItem>
            <SelectItem value="4.5">4.5+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button className="w-full">Filtruj</Button>
    </div>
  );
}

// components/filters/MixedFilters.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function MixedFilters({ onFilter }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-4">
        <h3 className="font-medium">Podstawowe informacje</h3>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Nazwa szkoły</label>
          <Input id="name" placeholder="Wpisz nazwę" />
        </div>
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">Miasto</label>
          <Input id="city" placeholder="Wpisz miasto" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium">Typ i poziom</h3>
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">Typ szkoły</label>
          <Select>
            <SelectTrigger id="type">
              <SelectValue placeholder="Wybierz typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="kindergarten">Przedszkole</SelectItem>
              <SelectItem value="primary">Szkoła Podstawowa</SelectItem>
              <SelectItem value="high_school">Liceum</SelectItem>
              <SelectItem value="technical">Technikum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="level" className="text-sm font-medium">Poziom edukacji</label>
          <Select>
            <SelectTrigger id="level">
              <SelectValue placeholder="Wybierz poziom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="elementary">Podstawowy</SelectItem>
              <SelectItem value="secondary">Średni</SelectItem>
              <SelectItem value="higher">Wyższy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium">Oceny i opinie</h3>
        <div className="space-y-2">
          <label htmlFor="rating" className="text-sm font-medium">Min. ocena</label>
          <Select>
            <SelectTrigger id="rating">
              <SelectValue placeholder="Wybierz ocenę" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Wszystkie oceny</SelectItem>
              <SelectItem value="3">3.0+</SelectItem>
              <SelectItem value="4">4.0+</SelectItem>
              <SelectItem value="4.5">4.5+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="sentiment" className="text-sm font-medium">Min. sentyment</label>
          <Select>
            <SelectTrigger id="sentiment">
              <SelectValue placeholder="Wybierz sentyment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Wszystkie</SelectItem>
              <SelectItem value="50">50%+</SelectItem>
              <SelectItem value="75">75%+</SelectItem>
              <SelectItem value="90">90%+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full mt-4">Filtruj</Button>
      </div>
    </div>
  );
}
```bash
npx shadcn@latest add https://tweakcn.com/r/themes/tangerine.json
```

Dokumentacja instalacji: https://ui.shadcn.com/docs/installation/next

## 2. Komponenty Layoutu

### 2.1. Navbar

```tsx
// components/layout/Navbar.tsx
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserNav } from "@/components/user/UserNav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">School Finder</span>
          </a>
          <nav className="hidden md:flex gap-6">
            <a href="/search" className="text-sm font-medium hover:underline">Wyszukaj</a>
            <a href="/regions" className="text-sm font-medium hover:underline">Regiony</a>
            <a href="/about" className="text-sm font-medium hover:underline">O nas</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
```

### 2.2. Footer

```tsx
// components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">School Finder</h3>
            <p className="text-sm text-muted-foreground">
              Platforma do wyszukiwania i oceniania szkół w Polsce.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Linki</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/search" className="hover:underline">Wyszukaj szkołę</a></li>
              <li><a href="/regions" className="hover:underline">Przeglądaj regiony</a></li>
              <li><a href="/about" className="hover:underline">O nas</a></li>
              <li><a href="/privacy" className="hover:underline">Polityka prywatności</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: kontakt@schoolfinder.pl</li>
              <li>Tel: +48 123 456 789</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} School Finder. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}
```

## 3. Komponenty Wyszukiwania

### 3.1. SearchForm

```tsx
// components/search/SearchForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schoolTypes = [
  { value: "all", label: "Wszystkie typy" },
  { value: "kindergarten", label: "Przedszkole" },
  { value: "primary", label: "Szkoła Podstawowa" },
  { value: "high_school", label: "Liceum" },
  { value: "technical", label: "Technikum" },
  { value: "vocational", label: "Szkoła Zawodowa" },
  { value: "special", label: "Szkoła Specjalna" },
  { value: "higher", label: "Szkoła Wyższa" },
];

export function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (city) params.append("city", city);
    if (region) params.append("region", region);
    if (type && type !== "all") params.append("type", type);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="query" className="text-sm font-medium">Słowa kluczowe</label>
          <Input
            id="query"
            placeholder="Np. dwujęzyczna, sportowa"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">Miasto</label>
          <Input
            id="city"
            placeholder="Np. Warszawa, Kraków"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="region" className="text-sm font-medium">Region</label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger id="region">
              <SelectValue placeholder="Wybierz region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Wszystkie regiony</SelectItem>
              <SelectItem value="mazowieckie">Mazowieckie</SelectItem>
              <SelectItem value="malopolskie">Małopolskie</SelectItem>
              <SelectItem value="wielkopolskie">Wielkopolskie</SelectItem>
              {/* Dodaj więcej regionów */}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">Typ szkoły</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Wybierz typ szkoły" />
            </SelectTrigger>
            <SelectContent>
              {schoolTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full">Wyszukaj</Button>
    </form>
  );
}
```

## 4. Komponenty Szkół

### 4.1. SchoolCard

```tsx
// components/schools/SchoolCard.tsx
import { Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SchoolCardProps {
  school: {
    id: string;
    name: string;
    type: string;
    city: string;
    region: string;
    googleRating?: number;
    sentimentScore?: number;
  };
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export function SchoolCard({ school, onFavorite, isFavorite }: SchoolCardProps) {
  const schoolTypeLabels: Record<string, string> = {
    kindergarten: "Przedszkole",
    primary: "Szkoła Podstawowa",
    high_school: "Liceum",
    technical: "Technikum",
    vocational: "Szkoła Zawodowa",
    special: "Szkoła Specjalna",
    higher: "Szkoła Wyższa",
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{school.name}</CardTitle>
          <Badge variant="outline">{schoolTypeLabels[school.type] || school.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">
          {school.city}, {school.region}
        </p>
        <div className="flex items-center space-x-4">
          {school.googleRating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{school.googleRating.toFixed(1)}</span>
            </div>
          )}
          {school.sentimentScore !== undefined && (
            <div className="flex items-center">
              <span className="text-sm font-medium">
                Sentyment: {(school.sentimentScore * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t">
        <Button variant="outline" size="sm" asChild>
          <a href={`/schools/${school.id}`}>Szczegóły</a>
        </Button>
        {onFavorite && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFavorite(school.id)}
            className={isFavorite ? "text-red-500" : ""}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

## 5. Komponenty Map

### 5.1. SchoolMap

```tsx
// components/maps/SchoolMap.tsx
import { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface SchoolMapProps {
  latitude: number;
  longitude: number;
  name: string;
  className?: string;
}

export function SchoolMap({ latitude, longitude, name, className }: SchoolMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const center = {
    lat: latitude,
    lng: longitude,
  };

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };

  return isLoaded ? (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: false,
        }}
      >
        <Marker position={center} title={name} />
      </GoogleMap>
    </div>
  ) : (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      Ładowanie mapy...
    </div>
  );
}
```