'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

const errorMessages = {
  Configuration: 'Wystąpił problem z konfiguracją. Spróbuj ponownie później.',
  AccessDenied: 'Dostęp został odrzucony. Nie masz uprawnień do tej aplikacji.',
  Verification: 'Token weryfikacyjny wygasł lub jest nieprawidłowy.',
  Default: 'Wystąpił nieoczekiwany błąd podczas logowania.',
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Błąd logowania</CardTitle>
          <CardDescription>
            {errorMessages[error] || errorMessages.Default}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Jeśli problem się powtarza, skontaktuj się z naszym zespołem wsparcia.
            </p>
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Spróbuj ponownie
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Powrót do strony głównej
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Potrzebujesz pomocy?{' '}
              <a href="mailto:kontakt@schoolfinder.pl" className="text-primary hover:underline">
                Skontaktuj się z nami
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Ładowanie...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
