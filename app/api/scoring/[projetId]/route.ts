import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { scoringCompletSchema } from '@/lib/validations/scoring'
import { notifierPorteur } from '@/lib/notifications'

/**
 * GET /api/scoring/[projetId]
 * Récupère le scoring existant d'un projet (ADMIN/ANALYSTE uniquement).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projetId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'ANALYSTE'].includes(session.user.role as string)) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 403 })
    }

    const { projetId } = await params

    const scoring = await prisma.scoreDetail.findUnique({
      where: { projetId },
      include: {
        analyste: {
          select: { prenom: true, nom: true },
        },
      },
    })

    const projet = await prisma.projet.findUnique({
      where: { id: projetId },
      include: {
        porteur: {
          select: { prenom: true, nom: true, email: true, telephone: true, ville: true },
        },
        documents: true,
      },
    })

    if (!projet) {
      return NextResponse.json({ erreur: 'Projet introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      scoring,
      projet: {
        ...projet,
        montantRecherche: projet.montantRecherche.toString(),
        montantMin: projet.montantMin.toString(),
        montantMax: projet.montantMax.toString(),
        projectionCA: projet.projectionCA?.toString() ?? null,
      },
    })
  } catch (error) {
    console.error('[Scoring GET] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/scoring/[projetId]
 * Enregistre ou met à jour le scoring d'un projet.
 * Si `brouillon` = false, finalise le scoring et calcule le score total.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projetId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'ANALYSTE'].includes(session.user.role as string)) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 403 })
    }

    const { projetId } = await params
    const body = await req.json()
    const { brouillon = true } = body

    // Si finalisation, valider tout le schéma
    if (!brouillon) {
      const parsed = scoringCompletSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { erreur: 'Données de scoring invalides', details: parsed.error.flatten() },
          { status: 400 }
        )
      }
    }

    const projet = await prisma.projet.findUnique({
      where: { id: projetId },
      include: {
        porteur: {
          select: { prenom: true, nom: true, email: true, telephone: true },
        },
      },
    })

    if (!projet) {
      return NextResponse.json({ erreur: 'Projet introuvable' }, { status: 404 })
    }

    // Extraire les scores
    const d1 = body.d1 ?? {}
    const d2 = body.d2 ?? {}
    const d3 = body.d3 ?? {}
    const d4 = body.d4 ?? {}
    const d5 = body.d5 ?? {}

    // Calculer le score total
    const scoreTotal =
      (d1.experienaceSectorielle?.valeur ?? 0) +
      (d1.competencesGestion?.valeur ?? 0) +
      (d1.resilienceEngagement?.valeur ?? 0) +
      (d2.clarteBizModel?.valeur ?? 0) +
      (d2.realismeProjections?.valeur ?? 0) +
      (d2.utilisationFonds?.valeur ?? 0) +
      (d3.tailleMarche?.valeur ?? 0) +
      (d3.tractionValidation?.valeur ?? 0) +
      (d3.avantageConcurrentiel?.valeur ?? 0) +
      (d4.structureLegale?.valeur ?? 0) +
      (d4.qualiteDocumentsFinanciers?.valeur ?? 0) +
      (d4.absenceContentieux?.valeur ?? 0) +
      (d5.clarteOffreInvestisseur?.valeur ?? 0) +
      (d5.potentielRendement?.valeur ?? 0)

    // Justifications JSON
    const justifs = (dim: Record<string, { justification?: string }>) => {
      const result: Record<string, string> = {}
      for (const [key, val] of Object.entries(dim)) {
        if (val?.justification) result[key] = val.justification
      }
      return result
    }

    const scoringData = {
      d1ExperienceSectorielle: d1.experienaceSectorielle?.valeur ?? 0,
      d1CompetencesGestion: d1.competencesGestion?.valeur ?? 0,
      d1ResilienceEngagement: d1.resilienceEngagement?.valeur ?? 0,
      d1Justifications: justifs(d1),
      d2ClarteBM: d2.clarteBizModel?.valeur ?? 0,
      d2RealismeProjections: d2.realismeProjections?.valeur ?? 0,
      d2StructurationFonds: d2.utilisationFonds?.valeur ?? 0,
      d2Justifications: justifs(d2),
      d3TailleMarche: d3.tailleMarche?.valeur ?? 0,
      d3Traction: d3.tractionValidation?.valeur ?? 0,
      d3AvantagesConcurrentiels: d3.avantageConcurrentiel?.valeur ?? 0,
      d3Justifications: justifs(d3),
      d4StructureLegale: d4.structureLegale?.valeur ?? 0,
      d4DocumentsFinanciers: d4.qualiteDocumentsFinanciers?.valeur ?? 0,
      d4AbsenceContentieux: d4.absenceContentieux?.valeur ?? 0,
      d4Justifications: justifs(d4),
      d5ClarteOffre: d5.clarteOffreInvestisseur?.valeur ?? 0,
      d5PotentielRendement: d5.potentielRendement?.valeur ?? 0,
      d5Justifications: justifs(d5),
      commentaireGlobal: body.commentaireGlobal ?? '',
      commentaireSyntheseInvestisseur: body.commentaireSyntheseInvestisseur ?? '',
      statutChoisi: body.statutChoisi ?? null,
      brouillon,
      analysteId: session.user.id,
    }

    // Upsert
    const scoring = await prisma.scoreDetail.upsert({
      where: { projetId },
      create: { projetId, ...scoringData },
      update: scoringData,
    })

    // Si finalisé, mettre à jour le score sur le projet
    if (!brouillon) {
      await prisma.projet.update({
        where: { id: projetId },
        data: {
          scoreTotal,
          statutScoring: body.statutChoisi,
        },
      })

      // Notification scoring terminé (fire-and-forget)
      notifierPorteur(
        'SCORING_TERMINE',
        projetId,
        {
          prenomPorteur: projet.porteur.prenom,
          nomPorteur: projet.porteur.nom,
          referenceProjet: projet.reference,
          titreProjet: projet.titre,
          scoreTotal,
          statutScoring: body.statutChoisi,
        },
        projet.porteur.email,
        projet.porteur.telephone ?? undefined,
      ).catch(console.error)
    }

    return NextResponse.json({
      success: true,
      scoring: {
        id: scoring.id,
        brouillon: scoring.brouillon,
        scoreTotal,
      },
    })
  } catch (error) {
    console.error('[Scoring POST] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
