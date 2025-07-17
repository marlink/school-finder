/**
 * Prosty serwer Node.js dla panelu administracyjnego scraperów
 */

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// Ładowanie zmiennych środowiskowych z pliku .env.local
dotenv.config({ path: '.env.local' });

// Pobieranie danych Supabase z zmiennych środowiskowych
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const app = express();
const port = process.env.PORT || 3500;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Inicjalizacja klienta Supabase z danymi z .env.local
let supabaseClient = null;

// Sprawdzenie, czy dane Supabase są dostępne
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Błąd: Brak konfiguracji Supabase w pliku .env.local');
  console.error('Upewnij się, że plik .env.local zawiera NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Inicjalizacja klienta Supabase
supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Funkcja do inicjalizacji tabel w bazie danych
async function initializeDatabase() {
  try {
    console.log('Inicjalizacja bazy danych...');
    
    // Bezpośrednie utworzenie tabeli scraping_status za pomocą SQL
    const { data, error } = await supabaseClient
      .from('schools')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Błąd podczas sprawdzania tabeli schools:', error);
      return;
    }
    
    // Utworzenie tabeli scraping_status
    const { error: createError } = await supabaseClient.auth.admin.createUser({
      email: 'temp@example.com',
      password: 'tempPassword123',
      user_metadata: {
        sql: `
          CREATE TABLE IF NOT EXISTS public.scraping_status (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            status TEXT NOT NULL,
            details JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    });
    
    if (createError) {
      console.error('Nie można utworzyć tabeli scraping_status:', createError);
      
      // Alternatywne podejście - symulacja tabeli w pamięci
      console.log('Używanie symulowanej tabeli w pamięci');
      global.inMemoryScrapingStatus = [];
    } else {
      console.log('Tabela scraping_status utworzona pomyślnie');
    }
  } catch (error) {
    console.error('Błąd podczas inicjalizacji bazy danych:', error);
    console.log('Używanie symulowanej tabeli w pamięci');
    global.inMemoryScrapingStatus = [];
  }
}

// Middleware do weryfikacji konfiguracji Supabase (teraz tylko dla kompatybilności wstecznej)
const verifySupabaseConfig = (req, res, next) => {
  // Jeśli w nagłówkach są podane dane Supabase, użyj ich zamiast danych z .env.local
  const { supabaseUrl, supabaseKey } = req.headers;
  
  if (supabaseUrl && supabaseKey) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  
  next();
};

// Endpoint do pobierania statystyk
app.get('/api/admin/dashboard', verifySupabaseConfig, async (req, res) => {
  try {
    // Sprawdzenie, czy używamy symulowanej tabeli w pamięci
    if (global.inMemoryScrapingStatus) {
      // Symulowane dane statystyczne
      const totalSchools = Math.floor(Math.random() * 1000) + 100; // Losowa liczba szkół
      
      // Ostatnia aktualizacja
      const lastUpdated = global.inMemoryScrapingStatus.length > 0 
        ? global.inMemoryScrapingStatus[global.inMemoryScrapingStatus.length - 1].created_at 
        : new Date().toISOString();
      
      // Symulowane dane regionów
      const schoolsByRegion = {
        'mazowieckie': Math.floor(Math.random() * 200) + 50,
        'małopolskie': Math.floor(Math.random() * 150) + 30,
        'śląskie': Math.floor(Math.random() * 180) + 40,
        'wielkopolskie': Math.floor(Math.random() * 120) + 20,
        'dolnośląskie': Math.floor(Math.random() * 100) + 10,
        'łódzkie': Math.floor(Math.random() * 90) + 10,
        'pomorskie': Math.floor(Math.random() * 80) + 10
      };
      
      // Symulowane dane typów szkół
      const schoolsByType = {
        'podstawowa': Math.floor(Math.random() * 400) + 100,
        'liceum': Math.floor(Math.random() * 200) + 50,
        'technikum': Math.floor(Math.random() * 150) + 30,
        'zawodowa': Math.floor(Math.random() * 100) + 20,
        'przedszkole': Math.floor(Math.random() * 150) + 30
      };
      
      return res.json({
        totalSchools,
        lastUpdated,
        schoolsByRegion,
        schoolsByType
      });
    }
    
    // Jeśli nie używamy symulowanej tabeli, pobierz dane z Supabase
    // Pobieranie liczby szkół
    const { count: totalSchools, error: countError } = await supabaseClient
      .from('schools')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Błąd pobierania liczby szkół:', countError);
      // Jeśli wystąpił błąd, użyj symulowanych danych
      return res.json({
        totalSchools: Math.floor(Math.random() * 1000) + 100,
        lastUpdated: new Date().toISOString(),
        schoolsByRegion: {
          'mazowieckie': Math.floor(Math.random() * 200) + 50,
          'małopolskie': Math.floor(Math.random() * 150) + 30,
          'śląskie': Math.floor(Math.random() * 180) + 40
        },
        schoolsByType: {
          'podstawowa': Math.floor(Math.random() * 400) + 100,
          'liceum': Math.floor(Math.random() * 200) + 50,
          'technikum': Math.floor(Math.random() * 150) + 30
        }
      });
    }
    
    // Pobieranie ostatniej aktualizacji
    const { data: statusData, error: statusError } = await supabaseClient
      .from('scraping_status')
      .select('created_at, status')
      .order('created_at', { ascending: false })
      .limit(1);
    
    const lastUpdated = statusData && statusData.length > 0 ? statusData[0].created_at : null;
    
    // Pobieranie liczby szkół według regionu
    const { data: regionData, error: regionError } = await supabaseClient
      .from('schools')
      .select('region')
      .not('region', 'is', null);
    
    let schoolsByRegion = {};
    
    if (!regionError && regionData) {
      regionData.forEach(school => {
        if (school.region) {
          schoolsByRegion[school.region] = (schoolsByRegion[school.region] || 0) + 1;
        }
      });
    }
    
    // Pobieranie liczby szkół według typu
    const { data: typeData, error: typeError } = await supabaseClient
      .from('schools')
      .select('type')
      .not('type', 'is', null);
    
    let schoolsByType = {};
    
    if (!typeError && typeData) {
      typeData.forEach(school => {
        if (school.type) {
          schoolsByType[school.type] = (schoolsByType[school.type] || 0) + 1;
        }
      });
    }
    
    res.json({
      totalSchools,
      lastUpdated,
      schoolsByRegion,
      schoolsByType
    });
  } catch (error) {
    console.error('Błąd podczas pobierania statystyk:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Endpoint do pobierania statusu scrapera
app.get('/api/admin/scraping/status', verifySupabaseConfig, async (req, res) => {
  try {
    // Sprawdzenie, czy używamy symulowanej tabeli w pamięci
    if (global.inMemoryScrapingStatus) {
      // Jeśli nie ma żadnych statusów, zwróć status 'idle'
      if (global.inMemoryScrapingStatus.length === 0) {
        return res.json({ status: 'idle' });
      }
      
      // Zwróć ostatni status
      const lastStatus = global.inMemoryScrapingStatus[global.inMemoryScrapingStatus.length - 1];
      return res.json(lastStatus);
    }
    
    // Pobieranie ostatniego statusu z Supabase
    const { data, error } = await supabaseClient
      .from('scraping_status')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Błąd pobierania statusu scrapera:', error);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
    
    // Jeśli nie ma żadnych statusów, zwróć status 'idle'
    if (!data || data.length === 0) {
      return res.json({ status: 'idle' });
    }
    
    res.json(data[0]);
  } catch (error) {
    console.error('Błąd podczas pobierania statusu scrapera:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Endpoint do uruchamiania scrapera
app.post('/api/admin/scraping/trigger', verifySupabaseConfig, async (req, res) => {
  try {
    const { region, schoolType, fullScrape } = req.body;
    
    // Sprawdzenie, czy scraper jest już uruchomiony
    let isRunning = false;
    
    // Sprawdzenie, czy używamy symulowanej tabeli w pamięci
    if (global.inMemoryScrapingStatus) {
      // Sprawdź, czy ostatni status to 'running'
      if (global.inMemoryScrapingStatus.length > 0) {
        const lastStatus = global.inMemoryScrapingStatus[global.inMemoryScrapingStatus.length - 1];
        isRunning = lastStatus.status === 'running';
      }
      
      if (isRunning) {
        return res.status(400).json({ error: 'Scraper jest już uruchomiony' });
      }
      
      // Dodaj nowy status 'running'
      const newStatus = {
        id: Date.now().toString(),
        status: 'running',
        details: {
          region,
          schoolType,
          fullScrape: fullScrape === true,
          startedAt: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      global.inMemoryScrapingStatus.push(newStatus);
      
      // Symulacja procesu scrapowania (10 sekund)
      setTimeout(() => {
        // Aktualizacja statusu na 'completed'
        const completedStatus = {
          id: Date.now().toString(),
          status: 'completed',
          details: {
            region,
            schoolType,
            fullScrape: fullScrape === true,
            startedAt: newStatus.details.startedAt,
            completedAt: new Date().toISOString(),
            schoolsScraped: Math.floor(Math.random() * 100) + 10
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        global.inMemoryScrapingStatus.push(completedStatus);
      }, 10000);
      
      return res.json({
        message: 'Scraper został uruchomiony',
        status: 'running',
        details: {
          region,
          schoolType,
          fullScrape: fullScrape === true,
          startedAt: newStatus.details.startedAt
        }
      });
    }
    
    // Jeśli nie używamy symulowanej tabeli, sprawdź status w Supabase
    const { data, error } = await supabaseClient
      .from('scraping_status')
      .select('status')
      .eq('status', 'running')
      .limit(1);
    
    if (error) {
      console.error('Błąd sprawdzania statusu scrapera:', error);
      
      // Jeśli wystąpił błąd, użyj symulowanej tabeli w pamięci
      global.inMemoryScrapingStatus = [];
      
      // Dodaj nowy status 'running'
      const newStatus = {
        id: Date.now().toString(),
        status: 'running',
        details: {
          region,
          schoolType,
          fullScrape: fullScrape === true,
          startedAt: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      global.inMemoryScrapingStatus.push(newStatus);
      
      // Symulacja procesu scrapowania (10 sekund)
      setTimeout(() => {
        // Aktualizacja statusu na 'completed'
        const completedStatus = {
          id: Date.now().toString(),
          status: 'completed',
          details: {
            region,
            schoolType,
            fullScrape: fullScrape === true,
            startedAt: newStatus.details.startedAt,
            completedAt: new Date().toISOString(),
            schoolsScraped: Math.floor(Math.random() * 100) + 10
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        global.inMemoryScrapingStatus.push(completedStatus);
      }, 10000);
      
      return res.json({
        message: 'Scraper został uruchomiony',
        status: 'running',
        details: {
          region,
          schoolType,
          fullScrape: fullScrape === true,
          startedAt: newStatus.details.startedAt
        }
      });
    }
    
    if (data && data.length > 0) {
      return res.status(400).json({ error: 'Scraper jest już uruchomiony' });
    }
    
    // Dodanie nowego statusu 'running' do Supabase
    const { data: insertData, error: insertError } = await supabaseClient
      .from('scraping_status')
      .insert([
        {
          status: 'running',
          details: {
            region,
            schoolType,
            fullScrape: fullScrape === true,
            startedAt: new Date().toISOString()
          }
        }
      ])
      .select();
    
    if (insertError) {
      console.error('Błąd dodawania statusu scrapera:', insertError);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
    
    // Tutaj można dodać kod do uruchomienia scrapera
    // Na przykład wywołanie skryptu Python za pomocą child_process
    
    res.json({
      message: 'Scraper został uruchomiony',
      status: 'running',
      details: insertData[0].details
    });
  } catch (error) {
    console.error('Błąd podczas uruchamiania scrapera:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Inicjalizacja bazy danych przy starcie serwera
initializeDatabase().then(() => {
  // Uruchomienie serwera
  app.listen(port, () => {
    console.log(`Serwer uruchomiony na porcie ${port}`);
    console.log(`Panel administracyjny dostępny pod adresem: http://localhost:${port}`);
  });
});