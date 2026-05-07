import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/projets/vitrine
 * Liste des projets publiés pour la vitrine investisseurs (public).
 * Supporte la pagination et les filtres (secteur, montant, type financement, score minimum).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '12')))
    const skip = (page - 1) * limit

    // Filtres
    const secteurs = searchParams.get('secteurs')?.split(',').filter(Boolean)
    const typesFinancement = searchParams.get('types')?.split(',').filter(Boolean)
    const montantMin = searchParams.get('montantMin') ? BigInt(searchParams.get('montantMin')!) : undefined
    const montantMax = searchParams.get('montantMax') ? BigInt(searchParams.get('montantMax')!) : undefined
    const scoreMin = searchParams.get('scoreMin') ? parseInt(searchParams.get('scoreMin')!) : undefined
    const stades = searchParams.get('stades')?.split(',').filter(Boolean)
    const prioritaires = searchParams.get('prioritaires') === 'true'
    const tri = searchParams.get('tri') ?? 'recent' // recent | score | montant
    const ids = searchParams.get('ids')?.split(',').filter(Boolean)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      published: true,
      statutScoring: prioritaires
        ? 'PRIORITAIRE'
        : { in: ['PRIORITAIRE', 'STANDARD'] },
    }

    if (ids?.length) where.id = { in: ids }
    if (secteurs?.length) where.secteur = { in: secteurs }
    if (typesFinancement?.length) where.typeFinancement = { in: typesFinancement }
    if (stades?.length) where.stade = { in: stades }
    if (montantMin) where.montantRecherche = { ...where.montantRecherche, gte: montantMin }
    if (montantMax) where.montantRecherche = { ...where.montantRecherche, lte: montantMax }
    if (scoreMin) where.scoreTotal = { gte: scoreMin }

    // Tri
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { publishedAt: 'desc' }
    if (tri === 'score') orderBy = { scoreTotal: 'desc' }
    if (tri === 'montant') orderBy = { montantRecherche: 'desc' }

    const [projets, total] = await Promise.all([
      prisma.projet.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          reference: true,
          titre: true,
          description: true,
          secteur: true,
          stade: true,
          typeFinancement: true,
          montantRecherche: true,
          montantMin: true,
          montantMax: true,
          zoneGeographique: true,
          scoreTotal: true,
          statutScoring: true,
          forfait: true,
          nombreVues: true,
          publishedAt: true,
          porteur: {
            select: {
              prenom: true,
              nom: true,
              ville: true,
            },
          },
          scoring: {
            select: {
              commentaireSyntheseInvestisseur: true,
            },
          },
          _count: {
            select: { contacts: true },
          },
        },
      }),
      prisma.projet.count({ where }),
    ])

    // Sérialiser les BigInt en strings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projetsSerialises = projets.map((p: any) => ({
      ...p,
      montantRecherche: p.montantRecherche.toString(),
      montantMin: p.montantMin.toString(),
      montantMax: p.montantMax.toString(),
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
    console.error('[Vitrine] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
