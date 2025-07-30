'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to Stack Auth signup page
    router.replace('/handler/signup')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">SF</span>
        </div>
        <p className="text-gray-600">Przekierowywanie do rejestracji...</p>
      </div>
    </div>
  )
}

