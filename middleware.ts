import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  if (!session) {
    // If not logged in, redirect to auth
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }
    return res
  }

  // Protect /dashboard/admin from non-admins
  if (pathname.startsWith('/dashboard/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/user', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
