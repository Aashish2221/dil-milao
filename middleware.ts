import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/discover', '/matches', '/chat', '/premium', '/profile', '/setup', '/notifications', '/liked-you', '/settings', '/my-likes']
const AUTH_PATHS = ['/', '/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const needsAuth = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PATHS.includes(pathname)

  if (!needsAuth && !isAuthPage) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && needsAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/discover', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/discover/:path*',
    '/matches/:path*',
    '/chat/:path*',
    '/premium/:path*',
    '/profile/:path*',
    '/setup/:path*',
    '/notifications/:path*',
    '/liked-you/:path*',
    '/settings/:path*',
    '/my-likes/:path*',
  ],
}
