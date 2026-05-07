import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notifierPorteur } from '@/lib/notifications'

/**
 * PATCH /api/projets/[id]/statut
 * Mise à jour du statut de scoring d'un projet (ADMIN/ANALYSTE uniquement).
 * Peut déclencher la publication automatique si le statut est PRIORITAIRE ou STANDARD.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'ANALYSTE'].includes(session.user.role as string)) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { statutScoring, publier } = body

    const statutsValides = ['EN_ATTENTE', 'EN_COURS', 'PRIORITAIRE', 'STANDARD', 'ACCOMPAGNEMENT', 'REJETE']
    if (!statutsValides.includes(statutScoring)) {
      return NextResponse.json(
        { erreur: 'Statut de scoring invalide' },
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { statutScoring }

    // Publication automatique si scoring éligible et demandé
    if (publier && ['PRIORITAIRE', 'STANDARD'].includes(statutScoring)) {
      updateData.published = true
      updateData.publishedAt = new Date()
    }

    const updated = await prisma.projet.update({
      where: { id },
      data: updateData,
    })

    // Notification au porteur (fire-and-forget)
    if (updateData.published) {
      notifierPorteur(
        'PROJET_PUBLIE',
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
    }

    return NextResponse.json({
      success: true,
      projet: {
        id: updated.id,
        statutScoring: updated.statutScoring,
        published: updated.published,
      },
    })
  } catch (error) {
    console.error('[Statut] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
