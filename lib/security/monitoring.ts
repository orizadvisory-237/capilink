import { journaliserEvenement } from './account-lockout'
import { envoyerNotification } from '@/lib/notifications'

// Détecter les comportements anormaux et alerter l'équipe Oriz
export async function detecterAnomalies(
  type: 'connexion' | 'upload' | 'contact' | 'erreur',
  ip: string,
  userId?: string
) {
  // Log en base
  await journaliserEvenement({
    userId,
    type: 'TENTATIVE_ACCES_NON_AUTORISE',
    ip,
    details: { type, timestamp: new Date().toISOString() },
  })

  const adminEmail = process.env.RESEND_ADMIN_EMAIL || 'admin@oriz.cm'

  // Alerter l'équipe Oriz si comportement critique
  try {
    await envoyerNotification({
      type: 'ALERTE_DOSSIER_URGENT', // Réutiliser comme canal d'alerte admin
      canaux: ['EMAIL'],
      destinataireEmail: adminEmail,
      contexte: {
        titreProjet: `[SÉCURITÉ] Activité anormale détectée`,
        prenomPorteur: `IP: ${ip} (${userId || 'anonyme'})`,
        referenceProjet: type
      },
    })
  } catch (err) {
    console.error('[Securite] Impossible alerter administrateurs : ', err)
  }
}
