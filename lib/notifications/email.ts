import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface EnvoiEmailOptions {
  destinataire: string // Adresse email
  sujet: string
  corps: string // HTML
}

interface EnvoiEmailResult {
  success: boolean
  messageId?: string
  erreur?: string
}

/**
 * Envoie un email transactionnel via Resend.
 */
export async function envoyerEmail({
  destinataire,
  sujet,
  corps,
}: EnvoiEmailOptions): Promise<EnvoiEmailResult> {
  try {
    const result = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: destinataire,
      subject: sujet,
      html: corps,
    })

    if (result.error) {
      return {
        success: false,
        erreur: result.error.message,
      }
    }

    return {
      success: true,
      messageId: result.data?.id,
    }
  } catch (error) {
    console.error('[Email] Erreur envoi:', error)
    return {
      success: false,
      erreur: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
