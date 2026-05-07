import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { contactCompletSchema } from '@/lib/validations/contact-investisseur'
import { notifierPorteur } from '@/lib/notifications'

/**
 * GET /api/contacts
 * Liste des contacts investisseurs (ADMIN/ANALYSTE uniquement).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'ANALYSTE'].includes(session.user.role as string)) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '20'))
    const skip = (page - 1) * limit
    const statut = searchParams.get('statut')
    const projetId = searchParams.get('projetId')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (statut) where.statutSuivi = statut
    if (projetId) where.projetId = projetId

    const [contacts, total] = await Promise.all([
      prisma.contactInvestisseur.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          projet: {
            select: {
              id: true,
              titre: true,
              reference: true,
              secteur: true,
            },
          },
        },
      }),
      prisma.contactInvestisseur.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      contacts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[Contacts GET] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/contacts
 * Soumission d'une demande de contact par un investisseur (public, avec rate-limiting).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projetId, ...contactData } = body

    if (!projetId) {
      return NextResponse.json(
        { erreur: 'projetId est requis' },
        { status: 400 }
      )
    }

    const parsed = contactCompletSchema.safeParse(contactData)
    if (!parsed.success) {
      return NextResponse.json(
        { erreur: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    const projet = await prisma.projet.findUnique({
      where: { id: projetId, published: true },
      include: {
        porteur: {
          select: { prenom: true, nom: true, email: true, telephone: true },
        },
      },
    })

    if (!projet) {
      return NextResponse.json({ erreur: 'Projet introuvable' }, { status: 404 })
    }

    const session = await auth();
    let autoInvestisseurId = null;
    if (session?.user?.role === "INVESTISSEUR") {
      autoInvestisseurId = session.user.id;
    }

    const contact = await prisma.contactInvestisseur.create({
      data: {
        projetId,
        investisseurId: autoInvestisseurId,
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        qualite: data.qualite,
        pays: data.paysResidence,
        ticketHabituel: data.ticketHabituel,
        message: data.message,
        typeIntention: data.intention,
        experienceAfrique: data.dejaInvestiAfrique,
      },
    })

    // Notifier le porteur de la prise de contact (fire-and-forget)
    notifierPorteur(
      'CONTACT_INVESTISSEUR',
      projetId,
      {
        prenomPorteur: projet.porteur.prenom,
        nomPorteur: projet.porteur.nom,
        referenceProjet: projet.reference,
        titreProjet: projet.titre,
        nomInvestisseur: `${data.prenom} ${data.nom}`,
        emailInvestisseur: data.email,
      },
      projet.porteur.email,
      projet.porteur.telephone ?? undefined,
    ).catch(console.error)

    return NextResponse.json(
      {
        success: true,
        contact: { id: contact.id },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Contacts POST] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
