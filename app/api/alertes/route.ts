import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { avecGuard } from '@/lib/security/api-guard'
import { z } from 'zod'

const alerteSchema = z.object({
  secteurs: z.array(z.string().min(1)).min(1, 'Au moins un secteur requis'),
})

/**
 * POST /api/alertes
 * Permet à un investisseur authentifié d'enregistrer ses alertes sectorielles.
 * SEC-04: Route désormais protégée par authentification + validation.
 */
export const POST = avecGuard(
  {
    rolesAutorises: ['INVESTISSEUR', 'ADMIN'],
    limiteur: 'api',
    schema: alerteSchema,
  },
  async (req, { session, body }) => {
    const { secteurs } = body as { secteurs: string[] }
    const email = (session.user as { email?: string }).email

    if (!email) {
      return NextResponse.json({ erreur: 'Email non trouvé' }, { status: 400 })
    }

    await prisma.contactInvestisseur.updateMany({
      where: { email },
      data: { alerteSecteurs: secteurs },
    })

    return NextResponse.json({ success: true })
  }
)
