import { prisma } from '@/lib/prisma'
import { envoyerWhatsApp } from './whatsapp'
import { envoyerEmail } from './email'
import { TEMPLATES } from './templates'

type TypeNotification =
  | 'ACCUSE_RECEPTION'
  | 'PAIEMENT_CONFIRME'
  | 'SCORING_DEMARRE'
  | 'SCORING_TERMINE'
  | 'PROJET_PUBLIE'
  | 'CONTACT_INVESTISSEUR'
  | 'RELANCE_PAIEMENT'
  | 'ALERTE_DOSSIER_URGENT'

type CanalNotification = 'EMAIL' | 'WHATSAPP'

interface EnvoiNotificationOptions {
  type: TypeNotification
  canaux: CanalNotification[]
  projetId?: string
  destinataireEmail?: string
  destinataireTelephone?: string
  contexte: {
    prenomPorteur: string
    nomPorteur?: string
    referenceProjet: string
    titreProjet: string
    montant?: string
    scoreTotal?: number
    statutScoring?: string
    nomInvestisseur?: string
    emailInvestisseur?: string
  }
}

/**
 * Orchestrateur d'envoi de notifications multicanal.
 * Envoie simultanément sur tous les canaux demandés et persiste le résultat en BDD.
 */
export async function envoyerNotification({
  type,
  canaux,
  projetId,
  destinataireEmail,
  destinataireTelephone,
  contexte,
}: EnvoiNotificationOptions) {
  const template = TEMPLATES[type]
  if (!template) {
    console.error(`[Notifications] Template inconnu: ${type}`)
    return
  }

  const resultats = await Promise.allSettled(
    canaux.map(async (canal) => {
      if (canal === 'EMAIL' && destinataireEmail) {
        const result = await envoyerEmail({
          destinataire: destinataireEmail,
          sujet: template.sujetEmail,
          corps: template.corpsEmail(contexte),
        })

        // Persister en BDD
        await prisma.notification.create({
          data: {
            projetId,
            destinataire: destinataireEmail,
            canal: 'EMAIL',
            type,
            statut: result.success ? 'ENVOYE' : 'ECHEC',
            contenu: template.sujetEmail,
            messageId: result.messageId ?? null,
            erreur: result.erreur ?? null,
            envoyeAt: result.success ? new Date() : null,
          },
        })

        return { canal, ...result }
      }

      if (canal === 'WHATSAPP' && destinataireTelephone) {
        const result = await envoyerWhatsApp({
          destinataire: destinataireTelephone,
          message: template.messageWhatsApp(contexte),
        })

        // Persister en BDD
        await prisma.notification.create({
          data: {
            projetId,
            destinataire: destinataireTelephone,
            canal: 'WHATSAPP',
            type,
            statut: result.success ? 'ENVOYE' : 'ECHEC',
            contenu: template.messageWhatsApp(contexte).slice(0, 200),
            messageId: result.messageId ?? null,
            erreur: result.erreur ?? null,
            envoyeAt: result.success ? new Date() : null,
          },
        })

        return { canal, ...result }
      }

      return { canal, success: false, erreur: 'Destinataire manquant pour ce canal' }
    })
  )

  // Log résumé
  resultats.forEach((r) => {
    if (r.status === 'fulfilled') {
      const v = r.value
      if (v.success) {
        console.log(`[Notifications] ✅ ${v.canal} envoyé (${type})`)
      } else {
        console.warn(`[Notifications] ❌ ${v.canal} échec: ${v.erreur}`)
      }
    } else {
      console.error(`[Notifications] 💥 Erreur inattendue:`, r.reason)
    }
  })

  return resultats
}

/**
 * Raccourci : notifier un porteur sur tous les canaux disponibles.
 */
export async function notifierPorteur(
  type: TypeNotification,
  projetId: string,
  contexte: EnvoiNotificationOptions['contexte'],
  email?: string,
  telephone?: string
) {
  const canaux: CanalNotification[] = []
  if (email) canaux.push('EMAIL')
  if (telephone) canaux.push('WHATSAPP')

  if (canaux.length === 0) {
    console.warn('[Notifications] Aucun canal disponible pour notifier le porteur.')
    return
  }

  return envoyerNotification({
    type,
    canaux,
    projetId,
    destinataireEmail: email,
    destinataireTelephone: telephone,
    contexte,
  })
}
