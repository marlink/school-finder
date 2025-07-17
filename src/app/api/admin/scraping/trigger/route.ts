import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { runScraper, InstitutionType, ScrapingMode } from '@/lib/scraper'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.split(' ')[1]
  
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  
  // Check for hardcoded admin token
  if (token === 'admin-token') {
    // Skip further authentication checks for hardcoded admin
  } else {
    // Verify the token and get the user
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }
    
    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
  }
  
  try {
    // Parse request body
    const body = await request.json()
    const { region = 'all', schoolType = 'all', fullScrape = false } = body
    
    // Mapowanie parametrów na typy używane przez scraper
    const institutionType = schoolType === 'university' 
      ? InstitutionType.UNIVERSITY 
      : schoolType === 'secondary' 
        ? InstitutionType.SECONDARY 
        : InstitutionType.ALL;
    
    const scrapingMode = fullScrape 
      ? ScrapingMode.FULL 
      : ScrapingMode.INCREMENTAL;
    
    // Uruchomienie scrapera jako proces asynchroniczny
    try {
      // Uruchom scraper w tle
      runScraper({
        supabase,
        region: region === 'all' ? undefined : region,
        institutionType,
        mode: scrapingMode,
        userId: token === 'admin-token' ? 'admin' : user.id
      });
      
      // Zwróć odpowiedź natychmiast, scraper będzie działał w tle
      return NextResponse.json({
        message: 'Scraping process started',
        status: 'running',
        details: {
          region,
          schoolType,
          fullScrape
        }
      });
    } catch (error: any) {
      // Jeśli wystąpił błąd podczas uruchamiania scrapera
      if (error.message.includes('already running')) {
        return NextResponse.json({ error: 'A scraping process is already running' }, { status: 400 });
      }
      
      throw error;
    }
    // Koniec funkcji POST
  } catch (error: any) {
    console.error('Error triggering scraping:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}