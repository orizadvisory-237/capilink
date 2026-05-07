import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notifierPorteur } from '@/lib/notifications'

/**
 * PATCH /api/projets/[id]/paiement
 * Confirmation du paiement d'un projet (ADMIN uniquement).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { paiementStatut } = body

    if (!['CONFIRME', 'REMBOURSE'].includes(paiementStatut)) {
      return NextResponse.json(
        { erreur: 'Statut de paiement invalide' },
        { status: 400 }
      )
    }

    const projet = await prisma.projet.findUnique({
      where: { id },
      include: {
        porteur: {
          select: { prenom: true, nom: true, email: true, telephone: true },
        },
      },
    })

    if (!projet) {
      return NextResponse.json({ erreur: 'Projet introuvable' }, { status: 404 })
    }

    const updated = await prisma.projet.update({
      where: { id },
      data: {
        paiementStatut,
        paiementDate: paiementStatut === 'CONFIRME' ? new Date() : null,
        // Passer automatiquement le scoring à EN_COURS si paiement confirmé
        ...(paiementStatut === 'CONFIRME' && projet.statutScoring === 'EN_ATTENTE'
          ? { statutScoring: 'EN_COURS' }
          : {}),
      },
    })

    // Notifier le porteur
    if (paiementStatut === 'CONFIRME') {
      notifierPorteur(
        'PAIEMENT_CONFIRME',
        id,
        {
          prenomPorteur: projet.porteur.prenom,
          nomPorteur: projet.porteur.nom,
          referenceProjet: projet.reference,
          titreProjet: projet.titre,
        },
        projet.porteur.email,
        projet.porteur.telephone ?? undefined,
      ).catch(console.error)

      // Si forfait PREMIUM, alerter les analystes
      if (projet.forfait === 'PREMIUM') {
        const analystes = await prisma.user.findMany({
          where: { role: { in: ['ADMIN', 'ANALYSTE'] } },
          select: { email: true, telephone: true },
        })

        for (const analyste of analystes) {
          notifierPorteur(
            'ALERTE_DOSSIER_URGENT',
            id,
            {
              prenomPorteur: projet.porteur.prenom,
              nomPorteur: projet.porteur.nom,
              referenceProjet: projet.reference,
              titreProjet: projet.titre,
            },
            analyste.email,
            analyste.telephone ?? undefined,
          ).catch(console.error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      projet: {
        id: updated.id,
        paiementStatut: updated.paiementStatut,
        paiementDate: updated.paiementDate,
        statutScoring: updated.statutScoring,
      },
    })
  } catch (error) {
    console.error('[Paiement] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
