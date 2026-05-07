import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { verifierLimite, limiteurs, extraireIP } from './rate-limiter'
import { journaliserEvenement } from './account-lockout'
import { ZodSchema } from 'zod'

type Role = 'PORTEUR' | 'INVESTISSEUR' | 'ANALYSTE' | 'ADMIN'

interface GuardOptions {
  rolesAutorises?: Role[]
  limiteur?: keyof typeof limiteurs
  schema?: ZodSchema
}

type RouteHandler = (
  req: NextRequest,
  context: { session: Extract<Awaited<ReturnType<typeof auth>>, { user: unknown }>; body?: unknown; params?: any }
) => Promise<NextResponse>

export function avecGuard(options: GuardOptions, handler: RouteHandler) {
  return async (req: NextRequest, { params }: { params?: any } = {}) => {
    const ip = extraireIP(req)

    // 1. Rate limiting
    if (options.limiteur) {
      const { autorise } = await verifierLimite(
        limiteurs[options.limiteur],
        ip
      )
      if (!autorise) {
        return NextResponse.json(
          { erreur: 'Trop de requêtes. Réessayez dans quelques minutes.' },
          {
            status: 429,
            headers: {
              'Retry-After': '900',
              'X-RateLimit-Remaining': '0',
            },
          }
        )
      }
    }

    // 2. Vérification session
    const session = await auth()
    if (options.rolesAutorises && options.rolesAutorises.length > 0) {
      if (!session?.user) {
        return NextResponse.json(
          { erreur: 'Authentification requise.' },
          { status: 401 }
        )
      }
      
      const roleUtilisateur = (session.user as { role?: string }).role as Role | undefined;

      if (!roleUtilisateur || !options.rolesAutorises.includes(roleUtilisateur)) {
        await journaliserEvenement({
          userId: session.user.id,
          type: 'TENTATIVE_ACCES_NON_AUTORISE',
          ip,
          details: { route: req.url, roleActuel: roleUtilisateur, rolesRequis: options.rolesAutorises },
        })
        return NextResponse.json(
          { erreur: 'Accès non autorisé.' },
          { status: 403 }
        )
      }
    }

    // 3. Validation du body avec Zod
    let body: unknown
    if (options.schema && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      try {
        const raw = await req.json()
        const parsed = options.schema.safeParse(raw)
        if (!parsed.success) {
          return NextResponse.json(
            { erreur: 'Données invalides.', details: parsed.error.flatten() },
            { status: 400 }
          )
        }
        body = parsed.data
      } catch {
        return NextResponse.json(
          { erreur: 'Corps de requête invalide.' },
          { status: 400 }
        )
      }
    }

    // 4. Exécuter le handler
    try {
      // Cast the session context to ensure handler signatures accept it smoothly
      return await handler(req, { session: session as never, body, params })
    } catch (error) {
      console.error('[API Error]', error)
      return NextResponse.json(
        { erreur: 'Une erreur interne est survenue.' },
        { status: 500 }
      )
    }
  }
}
