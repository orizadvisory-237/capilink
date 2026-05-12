import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  session: { strategy: 'jwt' },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [], // Les providers sont définis dans auth.ts pour éviter d'importer Prisma dans le Edge runtime
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role || 'PORTEUR'
        
        // Handle Google OAuth mappings gracefully
        if (user.name && !user.nom && !user.prenom) {
          const parts = user.name.split(' ')
          token.prenom = parts[0] || ''
          token.nom = parts.slice(1).join(' ') || ''
        } else {
          token.nom = user.nom
          token.prenom = user.prenom
        }
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.nom = token.nom as string
        session.user.prenom = token.prenom as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return `${baseUrl}/dashboard`
    }
  },
  pages: {
    signIn: '/connexion',
    error: '/connexion',
  }
} satisfies NextAuthConfig
