import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const STATUTS_VALIDES = ['NOUVEAU', 'CONTACTE', 'RDV_PLANIFIE', 'DEAL_EN_COURS', 'CLOTURE', 'ARCHIVE']

/**
 * PATCH /api/contacts/[id]
 * Met à jour le statut de suivi d'un contact investisseur (ADMIN/ANALYSTE uniquement).
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
    const { statutSuivi, notesInternes } = body

    // Validation
    if (statutSuivi && !STATUTS_VALIDES.includes(statutSuivi)) {
      return NextResponse.json(
        { erreur: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}` },
        { status: 400 }
      )
    }

    // Vérifier que le contact existe
    const existing = await prisma.contactInvestisseur.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ erreur: 'Contact introuvable' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    if (statutSuivi) updateData.statutSuivi = statutSuivi
    if (typeof notesInternes === 'string') updateData.notesInternes = notesInternes

    const contact = await prisma.contactInvestisseur.update({
      where: { id },
      data: updateData,
      include: {
        projet: {
          select: { id: true, titre: true, reference: true },
        },
      },
    })

    return NextResponse.json({ success: true, contact })
  } catch (error) {
    console.error('[Contact PATCH] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
