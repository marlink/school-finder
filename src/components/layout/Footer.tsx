import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">School Finder</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Platforma do wyszukiwania i oceniania szkół w Polsce. 
              Pomagamy rodzicom i uczniom znaleźć idealną szkołę.
            </p>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">SF</span>
              </div>
              <span className="text-sm font-medium">Twoja przyszłość zaczyna się tutaj</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Szybkie linki</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Wyszukaj szkołę
                </Link>
              </li>
              <li>
                <Link href="/regions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Przeglądaj regiony
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  O nas
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-muted-foreground hover:text-foreground transition-colors">
                  Subskrypcja
                </Link>
              </li>
              <li>
                <Link href="/style-guide" className="text-muted-foreground hover:text-foreground transition-colors">
                  Style Guide
                </Link>
              </li>
              <li>
                <Link href="/section-demo" className="text-muted-foreground hover:text-foreground transition-colors">
                  Section Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pomoc i informacje</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Polityka prywatności
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Regulamin
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                  Polityka cookies
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  Najczęściej zadawane pytania
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                  Wsparcie techniczne
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} School Finder. Wszelkie prawa zastrzeżone.
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Kontakt:</span>
              <a 
                href="mailto:kontakt@schoolfinder.pl" 
                className="hover:text-foreground transition-colors"
              >
                kontakt@schoolfinder.pl
              </a>
              <span>|</span>
              <a 
                href="tel:+48123456789" 
                className="hover:text-foreground transition-colors"
              >
                +48 123 456 789
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
