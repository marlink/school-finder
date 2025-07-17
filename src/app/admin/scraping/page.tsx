'use client'

/**
 * Panel administracyjny do zarządzania procesem scrapowania danych szkół
 * 
 * Komponent umożliwia:
 * - Wyświetlanie statystyk dotyczących szkół w bazie danych
 * - Uruchamianie procesu scrapowania z możliwością filtrowania po regionie i typie szkoły
 * - Monitorowanie statusu procesu scrapowania
 */

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Database, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function ScrapingPage() {
  // Stan do przechowywania statystyk szkół
  const [stats, setStats] = useState<any>(null)
  // Stan ładowania danych
  const [loading, setLoading] = useState(true)
  // Stan błędu
  const [error, setError] = useState<string | null>(null)
  // Stan powodzenia operacji
  const [success, setSuccess] = useState<string | null>(null)
  // Stan statusu procesu scrapowania (idle, running, completed)
  const [scrapingStatus, setScrapingStatus] = useState<string | null>(null)
  // Flaga określająca czy proces scrapowania jest aktualnie uruchomiony
  const [isScrapingRunning, setIsScrapingRunning] = useState(false)
  
  // Stan formularza scrapowania
  const [region, setRegion] = useState<string>('all')        // Wybrany region do scrapowania
  const [schoolType, setSchoolType] = useState<string>('all') // Wybrany typ szkoły do scrapowania
  const [fullScrape, setFullScrape] = useState(false)        // Czy wykonać pełne scrapowanie (nadpisanie danych)

  /**
   * Efekt uruchamiany przy montowaniu komponentu
   * Pobiera statystyki i sprawdza status procesu scrapowania
   */
  useEffect(() => {
    fetchStats()
    checkScrapingStatus()
  }, [])

  /**
   * Pobiera statystyki dotyczące szkół z API administratora
   * Aktualizuje stan stats lub ustawia błąd w przypadku niepowodzenia
   */
  const fetchStats = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getDashboardStats()
      setStats(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sprawdza aktualny status procesu scrapowania
   * Jeśli proces jest uruchomiony, sprawdza ponownie po 5 sekundach
   */
  const checkScrapingStatus = async () => {
    try {
      const status = await adminApi.getScrapingStatus()
      setScrapingStatus(status.status)
      setIsScrapingRunning(status.status === 'running')
      
      // Jeśli scrapowanie jest w trakcie, sprawdź ponownie za 5 sekund
      if (status.status === 'running') {
        setTimeout(checkScrapingStatus, 5000)
      }
    } catch (err: any) {
      console.error('Error checking scraping status:', err)
    }
  }

  /**
   * Obsługuje uruchomienie procesu scrapowania z wybranymi parametrami
   * Resetuje stany błędu i sukcesu, a następnie wywołuje API
   */
  const handleTriggerScraping = async () => {
    setError(null)
    setSuccess(null)
    setIsScrapingRunning(true)
    
    try {
      await adminApi.triggerScraping({
        region,
        schoolType,
        fullScrape
      })
      
      setSuccess('Scraping started successfully')
      checkScrapingStatus()
    } catch (err: any) {
      setError(err.message)
      setIsScrapingRunning(false)
    }
  }

  /**
   * Wyświetla loader podczas ładowania danych
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Stałe używane w interfejsie
  const appVersion = '0.1.0' // Wersja z package.json
  const lastUpdated = stats?.lastUpdated || 'Never' // Data ostatniej aktualizacji danych

  /**
   * Renderuje interfejs użytkownika panelu scrapowania
   */
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Scraping</h1>
      
      {/* Karty ze statystykami */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.totalSchools || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>App Version</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{appVersion}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{typeof lastUpdated === 'string' ? lastUpdated : new Date(lastUpdated).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Statystyki szkół według regionu i typu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schools by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.schoolsByRegion && Object.entries(stats.schoolsByRegion).map(([name, value]: [string, any]) => (
                <div key={name} className="flex justify-between items-center">
                  <span>{name}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Schools by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.schoolsByType && Object.entries(stats.schoolsByType).map(([name, value]: [string, any]) => (
                <div key={name} className="flex justify-between items-center">
                  <span>{name}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Karta z formularzem do uruchamiania scrapowania */}
      <Card>
        <CardHeader>
          <CardTitle>Data Scraping</CardTitle>
          <CardDescription>
            Trigger the data scraping process to update school information from external sources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Wyświetlanie komunikatu o błędzie */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Wyświetlanie komunikatu o sukcesie */}
            {success && (
              <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            {/* Wyświetlanie statusu procesu scrapowania */}
            {scrapingStatus && (
              <Alert variant={scrapingStatus === 'running' ? 'default' : 'outline'} className={scrapingStatus === 'running' ? 'bg-blue-50 text-blue-800 border-blue-200' : ''}>
                {scrapingStatus === 'running' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                <AlertTitle>Status</AlertTitle>
                <AlertDescription>
                  {scrapingStatus === 'running' ? 'Scraping is currently running...' : 
                   scrapingStatus === 'idle' ? 'Scraper is idle and ready to run' : 
                   scrapingStatus === 'completed' ? 'Last scraping completed successfully' : 
                   'Unknown status'}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Formularz wyboru parametrów scrapowania */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wybór regionu */}
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select 
                  value={region} 
                  onValueChange={setRegion}
                  disabled={isScrapingRunning}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {stats?.schoolsByRegion && Object.keys(stats.schoolsByRegion).map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Wybór typu szkoły */}
              <div className="space-y-2">
                <Label htmlFor="schoolType">School Type</Label>
                <Select 
                  value={schoolType} 
                  onValueChange={setSchoolType}
                  disabled={isScrapingRunning}
                >
                  <SelectTrigger id="schoolType">
                    <SelectValue placeholder="Select school type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {stats?.schoolsByType && Object.keys(stats.schoolsByType).map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Opcja pełnego scrapowania (nadpisanie istniejących danych) */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="fullScrape" 
                checked={fullScrape} 
                onCheckedChange={(checked) => setFullScrape(checked as boolean)}
                disabled={isScrapingRunning}
              />
              <Label htmlFor="fullScrape">Full scrape (overwrites existing data)</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {/* Przycisk uruchamiający proces scrapowania */}
          <Button 
            onClick={handleTriggerScraping} 
            disabled={isScrapingRunning}
            className="w-full md:w-auto"
          >
            {isScrapingRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Scraping in progress...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Start Scraping
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}