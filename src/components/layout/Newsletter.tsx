'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail } from 'lucide-react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setMessage({ 
        text: 'Dziękujemy za zapisanie się do newslettera!', 
        type: 'success' 
      })
      setEmail('')
    }, 1000)
    
    // In the future, this will be replaced with actual SMTP integration
  }

  return (
    <section className="w-full bg-primary/5 border-t">
      <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Bądź na bieżąco</h2>
          <p className="text-muted-foreground mb-6 md:text-lg">
            Zapisz się do naszego newslettera, aby otrzymywać najnowsze informacje o szkołach i edukacji w Polsce.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Twój adres email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Zapisywanie...' : 'Zapisz się'}
            </Button>
          </form>
          
          {message && (
            <div className={`mt-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-4">
            Szanujemy Twoją prywatność. Możesz wypisać się z newslettera w dowolnym momencie.
          </p>
        </div>
      </div>
    </section>
  )
}