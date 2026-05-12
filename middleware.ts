import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from './auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Dans NextAuth v5, req.auth contient la session complète
  const user = req.auth?.user

  // Routes admin — ADMIN ou ANALYSTE uniquement
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/connexion', req.url))
    if (!['ADMIN', 'ANALYSTE'].includes(user.role as string)) {
      return NextResponse.redirect(new URL('/non-autorise', req.url))
    }
  }

  // Routes investigateur
  if (pathname.startsWith('/espace-investisseur')) {
    if (!user) return NextResponse.redirect(new URL('/connexion', req.url))
    if (user.role !== 'INVESTISSEUR' && !['ADMIN', 'ANALYSTE'].includes(user.role as string)) {
      return NextResponse.redirect(new URL('/non-autorise', req.url))
    }
  }

  // Routes porteur — ces routes sont protégées
  const porteurRoutes = ['/dashboard', '/mon-dossier', '/soumettre'];
  if (porteurRoutes.some(route => pathname.startsWith(route))) {
    if (!user) return NextResponse.redirect(new URL('/connexion', req.url))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/mon-dossier/:path*', '/soumettre/:path*', '/espace-investisseur/:path*']
}
