import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

/**
 * Normalise un numéro de téléphone camerounais vers le format E.164.
 * Accepte : 6XX XX XX XX, +237 6XXXXXXXX, 237 6XXXXXXXX
 */
export function normaliserTelephone(telephone: string): string {
  // Retirer tous les espaces, tirets, parenthèses
  const cleaned = telephone.replace(/[\s\-()]/g, '')

  // Déjà au format +237
  if (cleaned.startsWith('+237')) return cleaned
  // Sans le +
  if (cleaned.startsWith('237') && cleaned.length === 12) return `+${cleaned}`
  // Numéro local commençant par 6
  if (cleaned.startsWith('6') && cleaned.length === 9) return `+237${cleaned}`

  // Retourner tel quel si format inconnu
  return cleaned
}

interface EnvoiWhatsAppOptions {
  destinataire: string // Numéro de téléphone
  message: string
}

interface EnvoiWhatsAppResult {
  success: boolean
  messageId?: string
  erreur?: string
}

/**
 * Envoie un message WhatsApp via Twilio.
 */
export async function envoyerWhatsApp({
  destinataire,
  message,
}: EnvoiWhatsAppOptions): Promise<EnvoiWhatsAppResult> {
  try {
    const numero = normaliserTelephone(destinataire)

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${numero}`,
      body: message,
    })

    return {
      success: true,
      messageId: result.sid,
    }
  } catch (error) {
    console.error('[WhatsApp] Erreur envoi:', error)
    return {
      success: false,
      erreur: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
