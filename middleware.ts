import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  })

  // Routes admin — ADMIN ou ANALYSTE uniquement
  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/connexion', req.url))
    if (!['ADMIN', 'ANALYSTE'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/non-autorise', req.url))
    }
  }

  // Routes investigateur
  if (pathname.startsWith('/espace-investisseur')) {
    if (!token) return NextResponse.redirect(new URL('/connexion', req.url))
    if (token.role !== 'INVESTISSEUR' && !['ADMIN', 'ANALYSTE'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/non-autorise', req.url))
    }
  }

  // Routes porteur — ces routes sont protégées
  const porteurRoutes = ['/dashboard', '/mon-dossier', '/soumettre'];
  if (porteurRoutes.some(route => pathname.startsWith(route))) {
    if (!token) return NextResponse.redirect(new URL('/connexion', req.url))
    
    // Si la route est '/soumettre' seul le rôle PORTEUR peut y accéder ?
    // En fait "soumettre" devrait rediriger si pas connecté, mais c'est bon
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/mon-dossier/:path*', '/soumettre/:path*', '/espace-investisseur/:path*']
}
