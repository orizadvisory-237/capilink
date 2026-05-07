import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/projets/vitrine/[id]
 * Détail d'un projet publié pour la vitrine investisseurs (public).
 * Incrémente le compteur de vues.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const projet = await prisma.projet.findUnique({
      where: { id, published: true },
      include: {
        porteur: {
          select: {
            prenom: true,
            nom: true,
            ville: true,
            qualitePorteur: true,
          },
        },
        scoring: {
          select: {
            d1ExperienceSectorielle: true,
            d1CompetencesGestion: true,
            d1ResilienceEngagement: true,
            d2ClarteBM: true,
            d2RealismeProjections: true,
            d2StructurationFonds: true,
            d3TailleMarche: true,
            d3Traction: true,
            d3AvantagesConcurrentiels: true,
            d4StructureLegale: true,
            d4DocumentsFinanciers: true,
            d4AbsenceContentieux: true,
            d5ClarteOffre: true,
            d5PotentielRendement: true,
            commentaireSyntheseInvestisseur: true,
          },
        },
        documents: {
          select: {
            type: true,
          },
        },
        _count: {
          select: { contacts: true },
        },
      },
    })

    if (!projet) {
      return NextResponse.json({ erreur: 'Projet introuvable' }, { status: 404 })
    }

    // Incrémenter les vues (fire-and-forget)
    prisma.projet.update({
      where: { id },
      data: { nombreVues: { increment: 1 } },
    }).catch(console.error)

    // Calculer les scores par dimension
    const scoring = projet.scoring
    const scoreDetail = scoring
      ? {
          viabilitePorteur:
            scoring.d1ExperienceSectorielle +
            scoring.d1CompetencesGestion +
            scoring.d1ResilienceEngagement,
          modeleEconomique:
            scoring.d2ClarteBM +
            scoring.d2RealismeProjections +
            scoring.d2StructurationFonds,
          marcheTraction:
            scoring.d3TailleMarche +
            scoring.d3Traction +
            scoring.d3AvantagesConcurrentiels,
          structurationJuridique:
            scoring.d4StructureLegale +
            scoring.d4DocumentsFinanciers +
            scoring.d4AbsenceContentieux,
          attractiviteInvestisseur:
            scoring.d5ClarteOffre + scoring.d5PotentielRendement,
          commentaireOriz: scoring.commentaireSyntheseInvestisseur,
        }
      : null

    // Documents présents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typesDocuments = projet.documents.map((d: any) => d.type)
    const documentsPresents = {
      businessPlan: typesDocuments.includes('BUSINESS_PLAN'),
      etatsFinanciers: typesDocuments.includes('ETATS_FINANCIERS'),
      statuts: typesDocuments.includes('STATUTS'),
    }

    return NextResponse.json({
      success: true,
      projet: {
        id: projet.id,
        reference: projet.reference,
        titre: projet.titre,
        description: projet.description,
        secteur: projet.secteur,
        stade: projet.stade,
        typeFinancement: projet.typeFinancement,
        montantRecherche: projet.montantRecherche.toString(),
        montantMin: projet.montantMin.toString(),
        montantMax: projet.montantMax.toString(),
        zoneGeographique: projet.zoneGeographique,
        problemeResolu: projet.problemeResolu,
        solution: projet.solution,
        avantagesConcurrentiels: projet.avantagesConcurrentiels,
        caActuel: projet.caActuel,
        rentabilite: projet.rentabilite,
        revenusGeneres: projet.revenusGeneres,
        scoreTotal: projet.scoreTotal,
        statutScoring: projet.statutScoring,
        scoreDetail,
        forfait: projet.forfait,
        nombreVues: projet.nombreVues,
        nombreContacts: projet._count.contacts,
        publishedAt: projet.publishedAt,
        porteur: projet.porteur,
        documents: documentsPresents,
        anneesExperience: projet.anneesExperience,
        structureJuridique: projet.structureJuridique,
      },
    })
  } catch (error) {
    console.error('[Vitrine Detail] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
