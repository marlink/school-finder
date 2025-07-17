#!/bin/bash

# Skrypt instalacyjny dla panelu administracyjnego scraperów School Finder

echo "Instalowanie panelu administracyjnego scraperów School Finder..."

# Sprawdzenie, czy Node.js jest zainstalowany
if ! command -v node &> /dev/null; then
    echo "Błąd: Node.js nie jest zainstalowany."
    echo "Proszę zainstalować Node.js (wersja 14 lub nowsza) ze strony https://nodejs.org/"
    exit 1
fi

# Sprawdzenie wersji Node.js
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "Błąd: Wymagana jest wersja Node.js 14 lub nowsza."
    echo "Aktualna wersja: $(node -v)"
    echo "Proszę zaktualizować Node.js ze strony https://nodejs.org/"
    exit 1
fi

echo "Node.js w wersji $(node -v) - OK"

# Instalacja zależności
echo "Instalowanie zależności..."
cp scraper-admin-package.json package.json
npm install

# Sprawdzenie, czy instalacja się powiodła
if [ $? -ne 0 ]; then
    echo "Błąd: Nie udało się zainstalować zależności."
    exit 1
fi

echo "Zależności zainstalowane pomyślnie."

# Informacja o uruchomieniu
echo ""
echo "Panel administracyjny scraperów został zainstalowany!"
echo ""
echo "Aby uruchomić panel, wykonaj polecenie:"
echo "  node scraper-server.js"
echo ""
echo "Następnie otwórz przeglądarkę i przejdź do adresu:"
echo "  http://localhost:3500"
echo ""
echo "W panelu konfiguracyjnym wprowadź dane dostępowe do Supabase:"
echo "  - Supabase URL (np. https://your-project.supabase.co)"
echo "  - Supabase Anon Key (klucz anonimowy)"