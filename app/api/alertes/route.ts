import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/alertes
 * Permet d'enregistrer les secteurs pour lesquels un investisseur souhaite être alerté
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, secteurs } = body

    if (!email || !Array.isArray(secteurs)) {
      return NextResponse.json(
        { erreur: 'Paramètres invalides' },
        { status: 400 }
      )
    }

    // Mise à jour de tous les contacts de cet investisseur avec les nouveaux secteurs
    // Cela permet de garder trace des centres d'intérêt de l'investisseur 
    // sans nécessiter une table séparée complexe
    const result = await prisma.contactInvestisseur.updateMany({
      where: { email },
      data: {
        alerteSecteurs: secteurs,
      },
    })

    if (result.count === 0) {
      // Optionnel : s'il n'y a pas de contact existant, on pourrait vouloir le créer partiellement, 
      // mais ici le workflow standard suppose qu'ils viennent de faire une demande de contact.
      console.warn(`[Alertes] Aucun contact trouvé pour l'email: ${email}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Alertes] Erreur lors de l\'enregistrement:', error)
    return NextResponse.json(
      { erreur: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
