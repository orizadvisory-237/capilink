import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { inscriptionPorteurSchema } from '@/lib/validations/auth'
import { avecGuard } from '@/lib/security/api-guard'
import { hasherMotDePasse } from '@/lib/security/password'
import { envoyerNotification } from '@/lib/notifications'

/**
 * POST /api/porteurs/inscription
 * Inscription d'un nouveau porteur de projet avec politique antibruit et constantes.
 */
export const POST = avecGuard(
  {
    schema: inscriptionPorteurSchema,
    limiteur: 'inscription',
  },
  async (req, { body }) => {
    const { email, password, nom, prenom, telephone, ville, qualitePorteur, secteurPrincipal, sourceConnaissance } = body as any

    // Toujours hasher le mot de passe pour le timing constant
    const hashMotDePasse = await hasherMotDePasse(password)

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      // Envoyer un email "compte existant" à l'adresse
      // plutôt que d'exposer l'info dans la réponse HTTP
      try {
        await envoyerNotification({
           destinataireEmail: email,
           canaux: ['EMAIL'],
           type: 'ALERTE_DOSSIER_URGENT',
           contexte: {
             titreProjet: 'Tentative création compte (Déjà existant)',
             prenomPorteur: prenom,
             referenceProjet: 'N/A'
           }
        })
      } catch (err) {}
      
      // Réponse identique au cas de succès pour éviter l'énumération de compte
      return NextResponse.json({ success: true, message: 'Si l\'email existe, un lien vous a été envoyé.' }, { status: 201 })
    }

    try {
      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email,
          password: hashMotDePasse,
          nom,
          prenom,
          telephone: telephone ?? null,
          ville: ville ?? null,
          qualitePorteur: qualitePorteur ?? null,
          secteurPrincipal: secteurPrincipal ?? null,
          sourceConnaissance: sourceConnaissance ?? null,
          role: 'PORTEUR',
        },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          role: true,
          createdAt: true,
        },
      })
      return NextResponse.json({ success: true, message: 'Compte créé avec succès.' }, { status: 201 })
    } catch (e: any) {
      console.error("[Prisma Create Error]", e);
      return NextResponse.json({ erreur: e.message || String(e) }, { status: 400 })
    }
  }
)
