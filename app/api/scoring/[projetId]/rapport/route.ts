import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { genererRapportPDF } from '@/lib/pdf/generate-rapport'

/**
 * GET /api/scoring/[projetId]/rapport
 * Génère et télécharge le rapport de scoring en PDF.
 * ADMIN/ANALYSTE ou PORTEUR propriétaire du projet.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projetId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 })
    }

    const { projetId } = await params

    const projet = await prisma.projet.findUnique({
      where: { id: projetId },
      include: {
        porteur: {
          select: { prenom: true, nom: true, ville: true },
        },
        scoring: true,
      },
    })

    if (!projet) {
      return NextResponse.json({ erreur: 'Projet introuvable' }, { status: 404 })
    }

    // Autorisation : admin/analyste OU porteur propriétaire
    const isAdmin = ['ADMIN', 'ANALYSTE'].includes(session.user.role as string)
    const isPorteur = projet.porteurId === session.user.id

    if (!isAdmin && !isPorteur) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 403 })
    }

    if (!projet.scoring || projet.scoring.brouillon) {
      return NextResponse.json(
        { erreur: 'Le scoring n\'est pas encore finalisé' },
        { status: 400 }
      )
    }

    const scoring = projet.scoring

    // Construire les données pour le PDF
    const donnees = {
      referenceProjet: projet.reference,
      titreProjet: projet.titre,
      secteur: projet.secteur,
      stade: projet.stade,
      montantRecherche: `${Number(projet.montantRecherche).toLocaleString('fr-FR')} FCFA`,
      typeFinancement: projet.typeFinancement,
      porteur: {
        prenom: projet.porteur.prenom,
        nom: projet.porteur.nom,
        ville: projet.porteur.ville ?? 'Non renseigné',
        anneesExperience: projet.anneesExperience,
        structureJuridique: projet.structureJuridique,
      },
      scoring: {
        scoreTotal: projet.scoreTotal ?? 0,
        statutScoring: projet.statutScoring,
        dimensions: {
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
        },
        commentaireGlobal: scoring.commentaireGlobal,
        commentaireSyntheseInvestisseur: scoring.commentaireSyntheseInvestisseur,
      },
      dateAnalyse: scoring.updatedAt.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    }

    const pdfBuffer = await genererRapportPDF(donnees)

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="rapport-${projet.reference}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[Rapport PDF] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur lors de la génération du rapport' },
      { status: 500 }
    )
  }
}
