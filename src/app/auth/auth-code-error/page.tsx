'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthCodeErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Błąd autoryzacji</CardTitle>
          <CardDescription>
            Wystąpił problem podczas logowania
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            <p className="font-medium mb-2">Co się stało?</p>
            <p>
              Nie udało się dokończyć procesu logowania. Może to być spowodowane:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Anulowaniem logowania w oknie dostawcy</li>
              <li>Problemem z połączeniem internetowym</li>
              <li>Tymczasowym problemem z serwerem</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Spróbuj ponownie
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              Wróć do strony głównej
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>
              Jeśli problem się powtarza, skontaktuj się z{' '}
              <a href="mailto:support@schoolfinder.pl" className="text-blue-600 hover:underline">
                pomocą techniczną
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}