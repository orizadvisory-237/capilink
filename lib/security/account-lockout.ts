import { prisma } from '@/lib/prisma'
import { TypeEvenementSecurite } from '@prisma/client'
import { envoyerNotification } from '@/lib/notifications'

const MAX_TENTATIVES = 5
const DUREE_VERROUILLAGE_MIN = 30

export async function enregistrerTentativeConnexion(
  userId: string,
  reussie: boolean,
  ip: string
): Promise<{ verrouille: boolean; messageErreur?: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { verrouille: false }

  // Vérifier si verrou actif
  if (user.compteVerrouille && user.verrouillageExpireAt) {
    if (new Date() < user.verrouillageExpireAt) {
      const minutesRestantes = Math.ceil(
        (user.verrouillageExpireAt.getTime() - Date.now()) / 60000
      )
      return {
        verrouille: true,
        messageErreur: `Compte temporairement verrouillé. Réessayez dans ${minutesRestantes} min.`,
      }
    }
    // Verrou expiré — réinitialiser
    await prisma.user.update({
      where: { id: userId },
      data: { compteVerrouille: false, tentativesConnexion: 0, verrouillageExpireAt: null },
    })
  }

  if (reussie) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        tentativesConnexion: 0,
        derniereConnexionAt: new Date(),
        derniereConnexionIP: ip,
      },
    })
    await journaliserEvenement({
      userId,
      type: 'CONNEXION_REUSSIE',
      ip,
    })
    return { verrouille: false }
  }

  // Échec de connexion
  const tentatives = user.tentativesConnexion + 1
  const verrouiller = tentatives >= MAX_TENTATIVES

  await prisma.user.update({
    where: { id: userId },
    data: {
      tentativesConnexion: tentatives,
      compteVerrouille: verrouiller,
      verrouillageExpireAt: verrouiller
        ? new Date(Date.now() + DUREE_VERROUILLAGE_MIN * 60 * 1000)
        : null,
    },
  })

  await journaliserEvenement({
    userId,
    type: verrouiller ? 'COMPTE_VERROUILLE' : 'CONNEXION_ECHEC',
    ip,
    details: { tentatives },
  })

  if (verrouiller && user.email) {
    // Notifier l'utilisateur par email (utiliser le template ALERTE)
    await notifierVerrouillage(user.email, user.prenom)
    return {
      verrouille: true,
      messageErreur: `Compte verrouillé après ${MAX_TENTATIVES} tentatives. Réessayez dans ${DUREE_VERROUILLAGE_MIN} min.`,
    }
  }

  return { verrouille: false }
}

async function notifierVerrouillage(email: string, prenom: string) {
  try {
    // Nous utiliserons le mail standard d'alerte ou générique
    await envoyerNotification({
      destinataireEmail: email,
      canaux: ['EMAIL'],
      type: 'ALERTE_DOSSIER_URGENT',
      contexte: {
        titreProjet: 'Alerte Sécurité: Compte Verrouillé',
        prenomPorteur: prenom,
        referenceProjet: 'N/A'
      }
    })
  } catch (error) {
    console.error('[Securite] Echec envoi alerte email:', error)
  }
}

export async function journaliserEvenement(params: {
  userId?: string
  type: TypeEvenementSecurite
  ip: string
  userAgent?: string
  details?: object
}) {
  await prisma.journalSecurite.create({
    data: {
      userId: params.userId,
      type: params.type,
      ip: params.ip,
      userAgent: params.userAgent,
      details: params.details ?? {},
    },
  })
}
