import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/stats/dashboard
 * Statistiques agrégées pour le dashboard admin (ADMIN/ANALYSTE uniquement).
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'ANALYSTE'].includes(session.user.role as string)) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 403 })
    }

    const [
      totalProjets,
      projetsPublies,
      projetsEnAttente,
      projetsEnCours,
      totalContacts,
      contactsNouveau,
      totalPorteurs,
      totalVues,
      projetsParStatut,
      projetsParSecteur,
      contactsParMois,
      derniersProjets,
    ] = await Promise.all([
      prisma.projet.count(),
      prisma.projet.count({ where: { published: true } }),
      prisma.projet.count({ where: { statutScoring: 'EN_ATTENTE' } }),
      prisma.projet.count({ where: { statutScoring: 'EN_COURS' } }),
      prisma.contactInvestisseur.count(),
      prisma.contactInvestisseur.count({ where: { statutSuivi: 'NOUVEAU' } }),
      prisma.user.count({ where: { role: 'PORTEUR' } }),
      prisma.projet.aggregate({ _sum: { nombreVues: true } }),
      // Projets par statut scoring
      prisma.projet.groupBy({
        by: ['statutScoring'],
        _count: true,
      }),
      // Projets par secteur
      prisma.projet.groupBy({
        by: ['secteur'],
        _count: true,
        orderBy: { _count: { secteur: 'desc' } },
        take: 10,
      }),
      // Contacts par mois (6 derniers mois)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as mois,
          COUNT(*)::int as total
        FROM "ContactInvestisseur"
        WHERE "createdAt" > NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY mois ASC
      ` as Promise<{ mois: Date; total: number }[]>,
      // 5 derniers projets
      prisma.projet.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reference: true,
          titre: true,
          secteur: true,
          statutScoring: true,
          paiementStatut: true,
          createdAt: true,
          porteur: {
            select: { prenom: true, nom: true },
          },
        },
      }),
    ])

    // Revenus estimés
    const revenus = await prisma.projet.aggregate({
      where: { paiementStatut: 'CONFIRME' },
      _sum: { montantForfait: true },
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalProjets,
        projetsPublies,
        projetsEnAttente,
        projetsEnCours,
        totalContacts,
        contactsNouveau,
        totalPorteurs,
        totalVues: totalVues._sum.nombreVues ?? 0,
        revenusConfirmes: revenus._sum.montantForfait ?? 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        projetsParStatut: projetsParStatut.map((p: any) => ({
          statut: p.statutScoring,
          count: p._count,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        projetsParSecteur: projetsParSecteur.map((p: any) => ({
          secteur: p.secteur,
          count: p._count,
        })),
        contactsParMois,
        derniersProjets,
      },
    })
  } catch (error) {
    console.error('[Stats] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
