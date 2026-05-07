import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/porteurs/mon-dossier
 * Récupère le dossier complet du porteur connecté (projets, documents, scoring, contacts).
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'PORTEUR') {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 })
    }

    const projets = await prisma.projet.findMany({
      where: { porteurId: session.user.id },
      include: {
        scoring: true,
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        contacts: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            prenom: true,
            nom: true,
            qualite: true,
            typeIntention: true,
            statutSuivi: true,
            createdAt: true,
          },
        },
        _count: {
          select: { contacts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      porteur: {
        id: session.user.id,
        nom: session.user.nom,
        prenom: session.user.prenom,
        email: session.user.email,
      },
      projets,
    })
  } catch (error) {
    console.error('[Mon dossier] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
