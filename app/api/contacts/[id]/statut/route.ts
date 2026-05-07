import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/contacts/[id]/statut
 * Mise à jour du statut de suivi d'un contact investisseur (ADMIN/ANALYSTE uniquement).
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

    const statutsValides = ['NOUVEAU', 'CONTACTE', 'RDV_PLANIFIE', 'DEAL_EN_COURS', 'CLOTURE', 'ARCHIVE']
    if (statutSuivi && !statutsValides.includes(statutSuivi)) {
      return NextResponse.json(
        { erreur: 'Statut de suivi invalide' },
        { status: 400 }
      )
    }

    const contact = await prisma.contactInvestisseur.findUnique({ where: { id } })
    if (!contact) {
      return NextResponse.json({ erreur: 'Contact introuvable' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    if (statutSuivi) updateData.statutSuivi = statutSuivi
    if (notesInternes !== undefined) updateData.notesInternes = notesInternes

    const updated = await prisma.contactInvestisseur.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      contact: {
        id: updated.id,
        statutSuivi: updated.statutSuivi,
        notesInternes: updated.notesInternes,
      },
    })
  } catch (error) {
    console.error('[Contact Statut] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
