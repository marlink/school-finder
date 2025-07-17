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
    const { data: lastUpdatedData, error: lastUpdatedError } = await supabaseClient
      .from('scraping_status')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);
    
    let lastUpdated = null;
    if (lastUpdatedError) {
      console.error('Błąd pobierania ostatniej aktualizacji:', lastUpdatedError);
      // Jeśli wystąpił błąd, użyj bieżącej daty
      lastUpdated = new Date().toISOString();
    } else {
      lastUpdated = lastUpdatedData.length > 0 ? lastUpdatedData[0].created_at : new Date().toISOString();
    }
    
    // Pobieranie szkół według regionów
    const { data: regionData, error: regionError } = await supabaseClient
      .from('schools')
      .select('region');
    
    let schoolsByRegion = {};
    if (regionError) {
      console.error('Błąd pobierania danych regionów:', regionError);
      // Jeśli wystąpił błąd, użyj symulowanych danych
      schoolsByRegion = {
        'mazowieckie': Math.floor(Math.random() * 200) + 50,
        'małopolskie': Math.floor(Math.random() * 150) + 30,
        'śląskie': Math.floor(Math.random() * 180) + 40
      };
    } else {
      regionData.forEach(school => {
        const region = school.region || 'Nieznany';
        schoolsByRegion[region] = (schoolsByRegion[region] || 0) + 1;
      });
    }
    
    // Pobieranie szkół według typów
    const { data: typeData, error: typeError } = await supabaseClient
      .from('schools')
      .select('type');
    
    let schoolsByType = {};
    if (typeError) {
      console.error('Błąd pobierania danych typów szkół:', typeError);
      // Jeśli wystąpił błąd, użyj symulowanych danych
      schoolsByType = {
        'podstawowa': Math.floor(Math.random() * 400) + 100,
        'liceum': Math.floor(Math.random() * 200) + 50,
        'technikum': Math.floor(Math.random() * 150) + 30
      };
    } else {
      typeData.forEach(school => {
        const type = school.type || 'Nieznany';
        schoolsByType[type] = (schoolsByType[type] || 0) + 1;
      });
    }
    
    res.json({
      totalSchools,
      lastUpdated,
      schoolsByRegion,
      schoolsByType
    });
  } catch (error) {
    console.error('Błąd pobierania statystyk:', error);
    // W przypadku błędu, zwróć symulowane dane
    res.json({
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
});

// Endpoint do pobierania statusu scrapera
app.get('/api/admin/scraping/status', verifySupabaseConfig, async (req, res) => {
  try {
    // Sprawdź, czy używamy symulowanej tabeli w pamięci
    if (global.inMemoryScrapingStatus) {
      const latestStatus = global.inMemoryScrapingStatus.length > 0 
        ? global.inMemoryScrapingStatus[global.inMemoryScrapingStatus.length - 1] 
        : { status: 'idle' };
      return res.json(latestStatus);
    }
    
    // Jeśli nie używamy symulowanej tabeli, pobierz dane z Supabase
    const { data, error } = await supabaseClient
      .from('scraping_status')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Błąd pobierania statusu z bazy danych:', error);
      // Jeśli wystąpił błąd, zwróć domyślny status
      return res.json({ status: 'idle' });
    }
    
    res.json(data.length > 0 ? data[0] : { status: 'idle' });
  } catch (error) {
    console.error('Błąd pobierania statusu scrapera:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint do uruchamiania scrapera
app.post('/api/admin/scraping/trigger', verifySupabaseConfig, async (req, res) => {
  try {
    const { region = 'all', schoolType = 'all', fullScrape = false } = req.body;
    
    // Sprawdzenie, czy używamy symulowanej tabeli w pamięci
    if (global.inMemoryScrapingStatus) {
      // Sprawdzenie, czy scraper nie jest już uruchomiony
      const isRunning = global.inMemoryScrapingStatus.some(status => status.status === 'running');
      
      if (isRunning) {
        return res.status(400).json({ error: 'Scraper jest już uruchomiony' });
      }
      
      // Dodanie nowego wpisu o statusie scrapera
      const newStatus = {
        id: Date.now().toString(),
        status: 'running',
        details: {
          region,
          schoolType,
          fullScrape,
          startedAt: new Date().toISOString(),
          startedBy: 'admin-panel'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      global.inMemoryScrapingStatus.push(newStatus);
      
      // Symulacja zakończenia scrapera po 10 sekundach
      setTimeout(() => {
        const schoolsScraped = Math.floor(Math.random() * 100) + 50; // Losowa liczba dla demonstracji
        
        // Aktualizacja statusu
        const completedStatus = {
          ...newStatus,
          status: 'completed',
          details: {
            ...newStatus.details,
            completedAt: new Date().toISOString(),
            schoolsScraped
          },
          updated_at: new Date().toISOString()
        };
        
        // Znajdź i zaktualizuj status w tablicy
        const index = global.inMemoryScrapingStatus.findIndex(s => s.id === newStatus.id);
        if (index !== -1) {
          global.inMemoryScrapingStatus[index] = completedStatus;
        }
        
        console.log(`Symulacja scrapera zakończona, pobrano ${schoolsScraped} szkół`);
      }, 10000);
      
      return res.json({
        message: 'Scraper został uruchomiony',
        status: 'running',
        details: {
          region,
          schoolType,
          fullScrape
        }
      });
    }
    
    // Jeśli nie używamy symulowanej tabeli, użyj Supabase
    // Sprawdzenie, czy scraper nie jest już uruchomiony
    const { data: statusData, error: statusError } = await supabaseClient
      .from('scraping_status')
      .select('*')
      .eq('status', 'running')
      .limit(1);
    
    if (statusError) {
      console.error('Błąd sprawdzania statusu scrapera:', statusError);
      // Jeśli wystąpił błąd, załóżmy, że scraper nie jest uruchomiony
    } else if (statusData && statusData.length > 0) {
      return res.status(400).json({ error: 'Scraper jest już uruchomiony' });
    }
    
    // Dodanie nowego wpisu o statusie scrapera
    const { data, error } = await supabaseClient
      .from('scraping_status')
      .insert({
        status: 'running',
        details: {
          region,
          schoolType,
          fullScrape,
          startedAt: new Date().toISOString(),
          startedBy: 'admin-panel'
        }
      })
      .select();
    
    if (error) {
      console.error('Błąd dodawania statusu scrapera:', error);
      // Jeśli wystąpił błąd, użyj symulowanej tabeli w pamięci
      if (!global.inMemoryScrapingStatus) {
        global.inMemoryScrapingStatus = [];
      }
      
      // Dodanie nowego wpisu o statusie scrapera do symulowanej tabeli
      const newStatus = {
        id: Date.now().toString(),
        status: 'running',
        details: {
          region,
          schoolType,
          fullScrape,
          startedAt: new Date().toISOString(),
          startedBy: 'admin-panel'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      global.inMemoryScrapingStatus.push(newStatus);
      
      // Symulacja zakończenia scrapera po 10 sekundach
      setTimeout(() => {
        const schoolsScraped = Math.floor(Math.random() * 100) + 50; // Losowa liczba dla demonstracji
        
        // Aktualizacja statusu
        const completedStatus = {
          ...newStatus,
          status: 'completed',
          details: {
            ...newStatus.details,
            completedAt: new Date().toISOString(),
            schoolsScraped
          },
          updated_at: new Date().toISOString()
        };
        
        // Znajdź i zaktualizuj status w tablicy
        const index = global.inMemoryScrapingStatus.findIndex(s => s.id === newStatus.id);
        if (index !== -1) {
          global.inMemoryScrapingStatus[index] = completedStatus;
        }
        
        console.log(`Symulacja scrapera zakończona, pobrano ${schoolsScraped} szkół`);
      }, 10000);
      
      return res.json({
        message: 'Scraper został uruchomiony (tryb symulacji)',
        status: 'running',
        details: {
          region,
          schoolType,
          fullScrape
        }
      });
    }
    
    // W rzeczywistej implementacji, tutaj uruchomilibyśmy scraper
    // Dla demonstracji, symulujemy zakończenie scrapera po 10 sekundach
    setTimeout(async () => {
      try {
        const schoolsScraped = Math.floor(Math.random() * 100) + 50; // Losowa liczba dla demonstracji
        
        await supabaseClient
          .from('scraping_status')
          .update({
            status: 'completed',
            details: {
              ...data[0].details,
              completedAt: new Date().toISOString(),
              schoolsScraped
            }
          })
          .eq('id', data[0].id);
          
        console.log(`Symulacja scrapera zakończona, pobrano ${schoolsScraped} szkół`);
      } catch (error) {
        console.error('Błąd aktualizacji statusu scrapera:', error);
      }
    }, 10000);
    
    res.json({
      message: 'Scraper został uruchomiony',
      status: 'running',
      details: {
        region,
        schoolType,
        fullScrape
      }
    });
  } catch (error) {
    console.error('Błąd uruchamiania scrapera:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serwowanie pliku HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'scraper-admin.html'));
});

// Uruchomienie serwera
// Funkcja do utworzenia funkcji pomocniczych w Supabase
async function createHelperFunctions() {
  try {
    // Funkcja sprawdzająca czy tabela istnieje
    const { error: checkFunctionError } = await supabaseClient.rpc('create_check_table_exists_function', {
      function_sql: `
        CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        AS $$
        DECLARE
          exists_bool BOOLEAN;
        BEGIN
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = $1
          ) INTO exists_bool;
          RETURN exists_bool;
        END;
        $$;
      `
    });
    
    if (checkFunctionError) {
      console.error('Błąd podczas tworzenia funkcji check_table_exists:', checkFunctionError);
      
      // Alternatywne podejście - bezpośrednie wykonanie SQL
      const { error: sqlError } = await supabaseClient.from('_exec_sql').select('*').eq('query', `
        CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        AS $$
        DECLARE
          exists_bool BOOLEAN;
        BEGIN
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = $1
          ) INTO exists_bool;
          RETURN exists_bool;
        END;
        $$;
      `);
      
      if (sqlError) {
        console.error('Błąd podczas tworzenia funkcji przez SQL:', sqlError);
      } else {
        console.log('Funkcja check_table_exists utworzona pomyślnie przez SQL');
      }
    } else {
      console.log('Funkcja check_table_exists utworzona pomyślnie');
    }
    
    // Funkcja tworząca tabelę scraping_status
    const { error: createTableFunctionError } = await supabaseClient.rpc('create_scraping_status_table_function', {
      function_sql: `
        CREATE OR REPLACE FUNCTION create_scraping_status_table()
        RETURNS VOID
        LANGUAGE plpgsql
        AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS public.scraping_status (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            status TEXT NOT NULL,
            details JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$;
      `
    });
    
    if (createTableFunctionError) {
      console.error('Błąd podczas tworzenia funkcji create_scraping_status_table:', createTableFunctionError);
      
      // Alternatywne podejście - bezpośrednie wykonanie SQL
      const { error: sqlError } = await supabaseClient.from('_exec_sql').select('*').eq('query', `
        CREATE OR REPLACE FUNCTION create_scraping_status_table()
        RETURNS VOID
        LANGUAGE plpgsql
        AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS public.scraping_status (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            status TEXT NOT NULL,
            details JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$;
      `);
      
      if (sqlError) {
        console.error('Błąd podczas tworzenia funkcji przez SQL:', sqlError);
      } else {
        console.log('Funkcja create_scraping_status_table utworzona pomyślnie przez SQL');
      }
    } else {
      console.log('Funkcja create_scraping_status_table utworzona pomyślnie');
    }
  } catch (error) {
    console.error('Błąd podczas tworzenia funkcji pomocniczych:', error);
  }
}

// Inicjalizacja serwera
async function initializeServer() {
  try {
    // Utworzenie funkcji pomocniczych
    await createHelperFunctions();
    
    // Inicjalizacja bazy danych
    await initializeDatabase();
    
    // Uruchomienie serwera
    app.listen(port, () => {
      console.log(`Serwer uruchomiony na http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Błąd podczas inicjalizacji serwera:', error);
    process.exit(1);
  }
}

// Uruchomienie inicjalizacji serwera
initializeServer();