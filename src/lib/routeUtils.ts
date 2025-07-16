/**
 * Funkcja pomocnicza do tworzenia ścieżek URL z uwzględnieniem basePath
 * Zapewnia poprawne działanie linków na GitHub Pages
 */
export function getAppPath(path: string): string {
  // Usuń początkowy slash, jeśli istnieje
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // W środowisku produkcyjnym dodaj basePath
  const basePath = process.env.NODE_ENV === 'production' ? '/school-finder' : '';
  
  // Połącz basePath z ścieżką
  return `${basePath}/${cleanPath}`.replace(/\/\//g, '/');
}