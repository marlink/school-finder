'use client'

import { getProviders, signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [providers, setProviders] = useState<any>({})
  const router = useRouter()

  useEffect(() => {
    getProviders().then(setProviders)
  }, [])

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const email = formData.get('email')
    // Add your email signup logic here
    router.push('/auth/signin?callbackUrl=/') // Redirect to sign-in page after signup
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-blue-600">Zarejestruj się</CardTitle>
          <CardDescription className="text-center">Załóż konto i zacznij korzystać z naszego serwisu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <Input name="email" type="email" placeholder="Twój email" required autoFocus className="w-full" />
            <Button type="submit" className="w-full">Zarejestruj się</Button>
          </form>
          <div className="flex flex-col space-y-2">
            {Object.values(providers).map((provider: any) => (
              <Button key={provider.name} onClick={() => signIn(provider.id)} className="w-full">
                Zarejestruj się za pomocą {provider.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

