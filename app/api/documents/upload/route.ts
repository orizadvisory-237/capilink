import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { uploadDocument } from '@/lib/supabase/storage'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const TYPES_AUTORISES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
]

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const projetId = formData.get('projetId') as string | null
    const typeDocument = formData.get('type') as string | null

    if (!file || !projetId || !typeDocument) {
      return NextResponse.json(
        { erreur: 'Fichier, projetId et type sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le projet appartient au porteur
    const projet = await prisma.projet.findUnique({
      where: { id: projetId },
      select: { porteurId: true },
    })

    if (!projet) {
      return NextResponse.json({ erreur: 'Projet introuvable' }, { status: 404 })
    }

    // Seul le porteur ou un admin peut uploader
    const isPorteur = projet.porteurId === session.user.id
    const isAdmin = ['ADMIN', 'ANALYSTE'].includes(session.user.role as string)

    if (!isPorteur && !isAdmin) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 403 })
    }

    // Vérifications du fichier
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { erreur: 'Le fichier dépasse la taille maximale de 10 Mo' },
        { status: 400 }
      )
    }

    if (!TYPES_AUTORISES.includes(file.type)) {
      return NextResponse.json(
        { erreur: 'Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG, Excel' },
        { status: 400 }
      )
    }

    // Upload vers Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadDocument(projetId, buffer, file.name, file.type)

    if (!result.success) {
      return NextResponse.json(
        { erreur: result.erreur || 'Erreur lors de l\'upload' },
        { status: 500 }
      )
    }

    // Enregistrer dans la BDD
    const document = await prisma.documentProjet.create({
      data: {
        projetId,
        nom: file.name,
        type: typeDocument as 'BUSINESS_PLAN' | 'ETATS_FINANCIERS' | 'STATUTS' | 'PIECE_IDENTITE' | 'AUTRE',
        url: result.url!,
        taille: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        nom: document.nom,
        type: document.type,
        url: document.url,
        taille: document.taille,
      },
    })
  } catch (error) {
    console.error('[Upload] Erreur:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
