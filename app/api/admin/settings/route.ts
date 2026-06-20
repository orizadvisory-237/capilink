import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { avecGuard } from '@/lib/security/api-guard'

/**
 * GET /api/admin/settings
 * Retourne les paramètres globaux de la plateforme.
 */
export const GET = avecGuard(
  { rolesAutorises: ['ADMIN', 'ANALYSTE'] },
  async () => {
    try {
      // Upsert pour garantir qu'un enregistrement existe toujours
      const settings = await prisma.siteSettings.upsert({
        where: { id: 'default' },
        create: { id: 'default' },
        update: {},
      })

      return NextResponse.json({ success: true, settings })
    } catch (error) {
      console.error('[Settings GET] Erreur:', error)
      return NextResponse.json(
        { erreur: 'Erreur interne du serveur' },
        { status: 500 }
      )
    }
  }
)

/**
 * PUT /api/admin/settings
 * Met à jour les paramètres globaux (ADMIN uniquement).
 */
export const PUT = avecGuard(
  { rolesAutorises: ['ADMIN'] },
  async (req) => {
    try {
      const body = await req.json()
      const { scoringActif, projetsGratuits } = body

      const data: Record<string, boolean> = {}
      if (typeof scoringActif === 'boolean') data.scoringActif = scoringActif
      if (typeof projetsGratuits === 'boolean') data.projetsGratuits = projetsGratuits

      if (Object.keys(data).length === 0) {
        return NextResponse.json(
          { erreur: 'Aucun paramètre à mettre à jour.' },
          { status: 400 }
        )
      }

      const settings = await prisma.siteSettings.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...data },
        update: data,
      })

      return NextResponse.json({ success: true, settings })
    } catch (error) {
      console.error('[Settings PUT] Erreur:', error)
      return NextResponse.json(
        { erreur: 'Erreur interne du serveur' },
        { status: 500 }
      )
    }
  }
)
