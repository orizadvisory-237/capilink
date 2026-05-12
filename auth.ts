import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { connexionSchema } from '@/lib/validations/auth'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
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

        const { verifierMotDePasse } = await import('@/lib/security/password')
        const { enregistrerTentativeConnexion } = await import('@/lib/security/account-lockout')
        
        const ip = 'ip-connexion'

        if (!user || !user.password) {
           await verifierMotDePasse('dummy', 'dummy') 
           return null
        }

        const match = await verifierMotDePasse(parsed.data.password, user.password)
        
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
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      // Premier login ou rafraîchissement : charger le rôle depuis la BDD
      if (user) {
        token.id = user.id as string
        
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
  }
})
