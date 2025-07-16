'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu, X, ChevronDown, School, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <School className="h-6 w-6" />
            <span className="font-bold text-base sm:text-lg md:text-xl hidden sm:inline-block">Katalog Szkół Polska</span>
            <span className="font-bold text-base sm:text-lg md:text-xl sm:hidden">KSP</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/schools" className="text-sm md:text-base font-medium transition-colors hover:text-primary">
            Szkoły
          </Link>
          <Link href="/regions" className="text-sm md:text-base font-medium transition-colors hover:text-primary">
            Regiony
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm md:text-base font-medium transition-colors hover:text-primary">
              Zasoby <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/about">O nas</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/faq">FAQ</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contact">Kontakt</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Konto
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Panel</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites">Ulubione</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Wyloguj się
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Logowanie</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Rejestracja</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-accent"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Przełącz menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-background border-b shadow-lg md:hidden z-50">
            <div className="container max-w-screen-2xl mx-auto px-4 py-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                <Link 
                  href="/schools" 
                  className="text-sm font-medium p-2 rounded hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Szkoły
                </Link>
                <Link 
                  href="/regions" 
                  className="text-sm font-medium p-2 rounded hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Regiony
                </Link>
                <div className="border-t my-2"></div>
                <Link 
                  href="/about" 
                  className="text-sm font-medium p-2 rounded hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  O nas
                </Link>
                <Link 
                  href="/faq" 
                  className="text-sm font-medium p-2 rounded hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link 
                  href="/contact" 
                  className="text-sm font-medium p-2 rounded hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kontakt
                </Link>
                <div className="border-t my-2"></div>
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href="/dashboard"
                      className="text-sm font-medium p-2 rounded hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Panel
                    </Link>
                    <Link 
                      href="/profile"
                      className="text-sm font-medium p-2 rounded hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profil
                    </Link>
                    <Link 
                      href="/favorites"
                      className="text-sm font-medium p-2 rounded hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Ulubione
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium p-2 rounded hover:bg-accent text-left text-destructive"
                    >
                      Wyloguj się
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link 
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Logowanie
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link 
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Rejestracja
                      </Link>
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}