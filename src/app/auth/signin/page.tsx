'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to Stack Auth signin page
    router.replace('/handler/signin')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">SF</span>
        </div>
        <p className="text-gray-600">Przekierowywanie do logowania...</p>
      </div>
    </div>
  )
}
