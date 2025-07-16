#!/bin/bash

# Sprawdzenie, czy jesteśmy w katalogu głównym projektu
if [ ! -f "package.json" ]; then
  echo "❌ Błąd: Nie jesteś w katalogu głównym projektu."
  echo "Przejdź do katalogu school-finder-app i spróbuj ponownie."
  exit 1
fi

# Sprawdzenie, czy plik .env.local istnieje
if [ ! -f ".env.local" ]; then
  echo "❌ Błąd: Brak pliku .env.local w katalogu głównym projektu."
  echo "Skopiuj plik .env.example do .env.local i uzupełnij wymagane zmienne środowiskowe."
  exit 1
fi

# Uruchomienie serwera deweloperskiego
echo "✅ Uruchamianie serwera deweloperskiego..."
npm run dev
