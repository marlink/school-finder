import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { OnboardingManager } from '@/components/onboarding/OnboardingManager'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <OnboardingManager />
    </div>
  )
}
