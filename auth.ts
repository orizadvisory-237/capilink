import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { connexionSchema } from '@/lib/validations/auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = connexionSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email }
        })

        // On importe dynamiquement pour éviter l'erreur dépendance circulaire si jamais
        const { verifierMotDePasse } = await import('@/lib/security/password')
        const { enregistrerTentativeConnexion } = await import('@/lib/security/account-lockout')
        const { extraireIP } = await import('@/lib/security/rate-limiter')
        
        // Simuler IP (On ne l'a pas directement dans Auth.js options sans passer par req, donc on injecte 'ip-inconnue' si nécessaire)
        const ip = 'ip-connexion'

        if (!user || !user.password) {
           await verifierMotDePasse('dummy', 'dummy') // Timing constant
           return null
        }

        // Vérification avec la librairie durcie
        const match = await verifierMotDePasse(parsed.data.password, user.password)
        
        // Journalisation de la tentative et application du lockout
        const { verrouille, messageErreur } = await enregistrerTentativeConnexion(user.id, match, ip)
        
        if (verrouille) throw new Error(messageErreur || 'Compte verrouillé')

        if (!match) return null

        return {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Premier login ou rafraîchissement : charger le rôle depuis la BDD
      if (user) {
        token.id = user.id as string
        
        // Handle Google OAuth name mapping
        if (user.name && !user.nom && !user.prenom) {
          const parts = user.name.split(' ')
          token.prenom = parts[0] || ''
          token.nom = parts.slice(1).join(' ') || ''
        } else {
          token.nom = user.nom
          token.prenom = user.prenom
        }

        // Charger le rôle directement depuis la BDD (crucial pour Google OAuth)
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id as string },
            select: { role: true },
          })
          token.role = dbUser?.role || 'PORTEUR'
        } catch {
          token.role = user.role || 'PORTEUR'
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
      // Si c'est un chemin relatif, le garder
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Si c'est le même domaine, autoriser
      if (url.startsWith(baseUrl)) return url
      // Par défaut, rediriger vers le dashboard
      return `${baseUrl}/dashboard`
    }
  },

  pages: {
    signIn: '/connexion',
    error: '/connexion',
  }
})
