'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Github } from 'lucide-react'
import { getAppPath } from '@/lib/routeUtils'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/95">
      <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand and Description */}
          <div className="flex flex-col space-y-3">
            <Link href={getAppPath('/')} className="font-bold text-base sm:text-lg">
              Katalog Szkół Polska
            </Link>
            <p className="text-sm md:text-base text-muted-foreground">
              Znajdź najlepsze szkoły w Polsce dzięki naszemu kompleksowemu katalogowi.
              Porównuj oceny, lokalizacje i udogodnienia, aby dokonać właściwego wyboru dla swojej edukacji.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-medium text-base sm:text-lg">Szybkie linki</h3>
            <Link href={getAppPath('/schools')} className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">
              Szkoły
            </Link>
            <Link href={getAppPath('/regions')} className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">
              Regiony
            </Link>
            <Link href={getAppPath('/about')} className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">
              O nas
            </Link>
          </div>

          {/* Resources */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-medium text-base sm:text-lg">Zasoby</h3>
            <Link href={getAppPath('/faq')} className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link href={getAppPath('/contact')} className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">
              Kontakt
            </Link>
            <Link href={getAppPath('/privacy')} className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">
              Polityka prywatności
            </Link>
            <Link href={getAppPath('/terms')} className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">
              Warunki korzystania
            </Link>
          </div>

          {/* Social Media */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-medium text-base sm:text-lg">Połącz się z nami</h3>
            <div className="flex space-x-3">
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="mailto:kontakt@katalogszkolpolska.pl" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm md:text-base text-muted-foreground">
            © {currentYear} Katalog Szkół Polska. Wszelkie prawa zastrzeżone.
          </p>
          <p className="text-xs md:text-sm text-muted-foreground mt-2 md:mt-0">
            Stworzone z ❤️ w Polsce
          </p>
        </div>
      </div>
    </footer>
  )
}