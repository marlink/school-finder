import { NextResponse, type NextRequest } from 'next/server'
import { StackServerApp } from '@stackframe/stack'

const stackServerApp = new StackServerApp({
  tokenStore: 'nextjs-cookie',
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
})

export async function middleware(request: NextRequest) {
  // Only apply authentication to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      const user = await stackServerApp.getUser()
      
      if (!user) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/handler/signin', request.url))
      }
      
      // Check if user has admin role (you may need to adjust this based on your user structure)
      // For now, we'll allow any authenticated user to access admin
      // You can add role checking here later
    } catch (error) {
      console.error('Stack Auth error in middleware:', error)
      // If Stack Auth fails, redirect to signin
      return NextResponse.redirect(new URL('/handler/signin', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
