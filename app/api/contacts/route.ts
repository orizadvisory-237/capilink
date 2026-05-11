import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { contactCompletSchema } from '@/lib/validations/contact-investisseur'
import { notifierPorteur } from '@/lib/notifications'
import { avecGuard } from '@/lib/security/api-guard'

/**
 * GET /api/contacts
 * Liste des contacts investisseurs (ADMIN/ANALYSTE uniquement).
 */
export const GET = avecGuard(
  {
    rolesAutorises: ['ADMIN', 'ANALYSTE'],
    limiteur: 'api',
  },
  async (req, { session }) => {
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
  }
)

/**
 * POST /api/contacts
 * Soumission d'une demande de contact par un investisseur.
 * SEC-05: Désormais protégé par rate limiting via avecGuard().
 */
export const POST = avecGuard(
  {
    limiteur: 'contact',
    schema: contactCompletSchema,
  },
  async (req, { body }) => {
    // Extraire projetId du query string ou du body original
    const url = new URL(req.url)
    let projetId = url.searchParams.get('projetId')

    // Si pas dans les query params, re-lire le body brut pour le projetId
    if (!projetId) {
      try {
        const rawBody = await req.clone().json()
        projetId = rawBody.projetId
      } catch {}
    }

    if (!projetId) {
      return NextResponse.json(
        { erreur: 'projetId est requis' },
        { status: 400 }
      )
    }

    const data = body as any

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
  }
)
