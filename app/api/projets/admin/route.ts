import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/projets/admin
 * Liste de tous les projets pour le back-office admin (ADMIN/ANALYSTE uniquement).
 * Supporte la pagination, le tri et les filtres.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'ANALYSTE'].includes(session.user.role as string)) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
    const skip = (page - 1) * limit

    const statut = searchParams.get('statut')
    const paiement = searchParams.get('paiement')
    const recherche = searchParams.get('q')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (statut) where.statutScoring = statut
    if (paiement) where.paiementStatut = paiement
    if (recherche) {
      where.OR = [
        { titre: { contains: recherche, mode: 'insensitive' } },
        { reference: { contains: recherche, mode: 'insensitive' } },
        { porteur: { nom: { contains: recherche, mode: 'insensitive' } } },
        { porteur: { prenom: { contains: recherche, mode: 'insensitive' } } },
      ]
    }

    const [projets, total] = await Promise.all([
      prisma.projet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          porteur: {
            select: {
              id: true,
              prenom: true,
              nom: true,
              email: true,
              telephone: true,
              ville: true,
            },
          },
          scoring: {
            select: {
              analysteId: true,
              brouillon: true,
            },
          },
          _count: {
            select: { documents: true, contacts: true },
          },
        },
      }),
      prisma.projet.count({ where }),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projetsSerialises = projets.map((p: any) => ({
      ...p,
      montantRecherche: p.montantRecherche.toString(),
      montantMin: p.montantMin.toString(),
      montantMax: p.montantMax.toString(),
      projectionCA: p.projectionCA?.toString() ?? null,
    }))

    return NextResponse.json({
      success: true,
      projets: projetsSerialises,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Admin Projets] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
