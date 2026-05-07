/**
 * Matrice de templates de notifications (HTML pour email, texte brut pour WhatsApp)
 * selon les événements du cycle de vie d'un projet Capilink.
 */

type TypeEvenement =
  | 'ACCUSE_RECEPTION'
  | 'PAIEMENT_CONFIRME'
  | 'SCORING_DEMARRE'
  | 'SCORING_TERMINE'
  | 'PROJET_PUBLIE'
  | 'CONTACT_INVESTISSEUR'
  | 'RELANCE_PAIEMENT'
  | 'ALERTE_DOSSIER_URGENT'

interface ContexteTemplate {
  prenomPorteur: string
  nomPorteur?: string
  referenceProjet: string
  titreProjet: string
  montant?: string
  scoreTotal?: number
  statutScoring?: string
  nomInvestisseur?: string
  emailInvestisseur?: string
  lienPlateforme?: string
}

interface Template {
  sujetEmail: string
  corpsEmail: (ctx: ContexteTemplate) => string
  messageWhatsApp: (ctx: ContexteTemplate) => string
}

const LIEN_BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://capilink.cm'

// ─── Styles communs pour les emails ──────────────────────────────
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2d5a8c 100%);padding:28px 32px;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Capilink</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">by Oriz Advisory</p>
  </div>
  <div style="padding:28px 32px;">
    ${content}
  </div>
  <div style="padding:16px 32px;background:#f8f9fa;border-top:1px solid #e9ecef;text-align:center;">
    <p style="margin:0;font-size:12px;color:#6c757d;">
      © ${new Date().getFullYear()} Capilink by Oriz Advisory — Douala, Cameroun
    </p>
  </div>
</div>
</body>
</html>`

// ─── Templates par événement ────────────────────────────────────

export const TEMPLATES: Record<TypeEvenement, Template> = {
  ACCUSE_RECEPTION: {
    sujetEmail: '✅ Votre dossier a bien été reçu — Capilink',
    corpsEmail: (ctx) => emailWrapper(`
      <h2 style="color:#1e3a5f;margin:0 0 16px;">Bienvenue, ${ctx.prenomPorteur} !</h2>
      <p style="color:#333;line-height:1.6;">
        Nous avons bien reçu votre dossier de projet <strong>${ctx.titreProjet}</strong> 
        (réf. <code style="background:#e9ecef;padding:2px 6px;border-radius:4px;">${ctx.referenceProjet}</code>).
      </p>
      <p style="color:#333;line-height:1.6;">
        Notre équipe d'analystes va examiner votre dossier dans les prochaines <strong>48 heures ouvrées</strong>.
        Veuillez vous assurer que le paiement du forfait est effectué pour déclencher l'analyse.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${LIEN_BASE}/porteur/mon-dossier" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#1e3a5f,#2d5a8c);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Suivre mon dossier
        </a>
      </div>
    `),
    messageWhatsApp: (ctx) =>
      `✅ *Capilink* — Dossier reçu !\n\nBonjour ${ctx.prenomPorteur},\nVotre projet "${ctx.titreProjet}" (réf: ${ctx.referenceProjet}) a bien été enregistré.\n\n📋 Prochaine étape : paiement du forfait pour activer l'analyse.\n\n🔗 ${LIEN_BASE}/porteur/mon-dossier`,
  },

  PAIEMENT_CONFIRME: {
    sujetEmail: '💳 Paiement confirmé — Votre analyse démarre',
    corpsEmail: (ctx) => emailWrapper(`
      <h2 style="color:#1e3a5f;margin:0 0 16px;">Paiement confirmé !</h2>
      <p style="color:#333;line-height:1.6;">
        Bonjour ${ctx.prenomPorteur}, le paiement pour votre projet <strong>${ctx.titreProjet}</strong> a été validé.
      </p>
      <p style="color:#333;line-height:1.6;">
        Un analyste Oriz Advisory va désormais prendre en charge l'évaluation de votre dossier.
        Vous recevrez une notification dès que l'analyse sera terminée.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#166534;font-weight:600;">🎯 Délai estimé : 48 à 72 heures ouvrées</p>
      </div>
    `),
    messageWhatsApp: (ctx) =>
      `💳 *Capilink* — Paiement confirmé !\n\nBonjour ${ctx.prenomPorteur},\nLe paiement pour "${ctx.titreProjet}" est validé.\n\n🔍 L'analyse de votre dossier commence. Réponse sous 48-72h.`,
  },

  SCORING_DEMARRE: {
    sujetEmail: '🔍 Analyse en cours — Votre dossier est entre de bonnes mains',
    corpsEmail: (ctx) => emailWrapper(`
      <h2 style="color:#1e3a5f;margin:0 0 16px;">Analyse démarrée</h2>
      <p style="color:#333;line-height:1.6;">
        Bonjour ${ctx.prenomPorteur}, l'évaluation de votre projet <strong>${ctx.titreProjet}</strong> 
        est officiellement en cours.
      </p>
      <p style="color:#333;line-height:1.6;">
        Notre analyste évalue 5 dimensions clés : viabilité du porteur, modèle économique, 
        marché & traction, structuration juridique, et attractivité investisseur.
      </p>
    `),
    messageWhatsApp: (ctx) =>
      `🔍 *Capilink* — Analyse en cours\n\nBonjour ${ctx.prenomPorteur},\nL'évaluation de "${ctx.titreProjet}" a démarré. Nos analystes travaillent sur votre dossier.`,
  },

  SCORING_TERMINE: {
    sujetEmail: '📊 Résultat de votre scoring disponible — Capilink',
    corpsEmail: (ctx) => emailWrapper(`
      <h2 style="color:#1e3a5f;margin:0 0 16px;">Votre score est disponible !</h2>
      <p style="color:#333;line-height:1.6;">
        Bonjour ${ctx.prenomPorteur}, l'analyse de votre projet <strong>${ctx.titreProjet}</strong> est terminée.
      </p>
      <div style="background:linear-gradient(135deg,#1e3a5f,#2d5a8c);border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
        <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">Score Global</p>
        <p style="margin:8px 0 0;color:#fff;font-size:42px;font-weight:800;">${ctx.scoreTotal}/100</p>
        <p style="margin:8px 0 0;color:#fbbf24;font-size:16px;font-weight:600;">${ctx.statutScoring}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${LIEN_BASE}/porteur/mon-dossier" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#1e3a5f,#2d5a8c);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Voir le détail complet
        </a>
      </div>
    `),
    messageWhatsApp: (ctx) =>
      `📊 *Capilink* — Score disponible !\n\nBonjour ${ctx.prenomPorteur},\nVotre projet "${ctx.titreProjet}" a obtenu un score de *${ctx.scoreTotal}/100*.\nStatut : ${ctx.statutScoring}\n\n🔗 ${LIEN_BASE}/porteur/mon-dossier`,
  },

  PROJET_PUBLIE: {
    sujetEmail: '🚀 Votre projet est en ligne sur la Vitrine — Capilink',
    corpsEmail: (ctx) => emailWrapper(`
      <h2 style="color:#1e3a5f;margin:0 0 16px;">Votre projet est publié !</h2>
      <p style="color:#333;line-height:1.6;">
        Félicitations ${ctx.prenomPorteur} ! Votre projet <strong>${ctx.titreProjet}</strong> 
        est désormais visible sur la Vitrine Investisseurs de Capilink.
      </p>
      <p style="color:#333;line-height:1.6;">
        Les investisseurs peuvent maintenant consulter votre profil et vous contacter directement. 
        Vous serez notifié(e) à chaque prise de contact.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${LIEN_BASE}/vitrine" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#059669,#10b981);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Voir la vitrine
        </a>
      </div>
    `),
    messageWhatsApp: (ctx) =>
      `🚀 *Capilink* — Projet publié !\n\nFélicitations ${ctx.prenomPorteur} !\n"${ctx.titreProjet}" est maintenant visible sur la vitrine investisseurs.\n\n🔗 ${LIEN_BASE}/vitrine`,
  },

  CONTACT_INVESTISSEUR: {
    sujetEmail: '📩 Un investisseur s\'intéresse à votre projet — Capilink',
    corpsEmail: (ctx) => emailWrapper(`
      <h2 style="color:#1e3a5f;margin:0 0 16px;">Nouvelle prise de contact !</h2>
      <p style="color:#333;line-height:1.6;">
        Bonjour ${ctx.prenomPorteur}, un investisseur a manifesté son intérêt pour 
        votre projet <strong>${ctx.titreProjet}</strong>.
      </p>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;color:#1e40af;font-weight:600;">👤 ${ctx.nomInvestisseur}</p>
        <p style="margin:0;color:#1e40af;font-size:14px;">📧 ${ctx.emailInvestisseur}</p>
      </div>
      <p style="color:#333;line-height:1.6;">
        L'équipe Oriz Advisory assurera le suivi de cette mise en relation.
      </p>
    `),
    messageWhatsApp: (ctx) =>
      `📩 *Capilink* — Nouveau contact investisseur !\n\nBonjour ${ctx.prenomPorteur},\nUn investisseur (${ctx.nomInvestisseur}) souhaite en savoir plus sur "${ctx.titreProjet}".\n\nL'équipe Oriz vous accompagnera dans la suite.`,
  },

  RELANCE_PAIEMENT: {
    sujetEmail: '⏰ Rappel : finalisez votre paiement — Capilink',
    corpsEmail: (ctx) => emailWrapper(`
      <h2 style="color:#1e3a5f;margin:0 0 16px;">N'oubliez pas votre paiement</h2>
      <p style="color:#333;line-height:1.6;">
        Bonjour ${ctx.prenomPorteur}, votre dossier <strong>${ctx.titreProjet}</strong> est en attente de paiement 
        depuis quelques jours.
      </p>
      <p style="color:#333;line-height:1.6;">
        Sans paiement, nous ne pouvons pas lancer l'analyse de scoring. 
        Réglez dès maintenant pour ne pas perdre votre place dans la file d'attente.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${LIEN_BASE}/porteur/mon-dossier" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Finaliser mon paiement
        </a>
      </div>
    `),
    messageWhatsApp: (ctx) =>
      `⏰ *Capilink* — Rappel paiement\n\nBonjour ${ctx.prenomPorteur},\nVotre dossier "${ctx.titreProjet}" est toujours en attente de paiement.\n\n💳 Finalisez maintenant : ${LIEN_BASE}/porteur/mon-dossier`,
  },

  ALERTE_DOSSIER_URGENT: {
    sujetEmail: '🔔 Dossier urgent à analyser — Oriz Advisory',
    corpsEmail: (ctx) => emailWrapper(`
      <h2 style="color:#dc2626;margin:0 0 16px;">⚠️ Dossier urgent</h2>
      <p style="color:#333;line-height:1.6;">
        Un dossier forfait <strong>PREMIUM</strong> vient d'être payé et nécessite une analyse prioritaire.
      </p>
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;font-weight:600;">Projet : ${ctx.titreProjet}</p>
        <p style="margin:4px 0 0;">Réf : ${ctx.referenceProjet}</p>
        <p style="margin:4px 0 0;">Porteur : ${ctx.prenomPorteur} ${ctx.nomPorteur || ''}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${LIEN_BASE}/admin/scoring" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Accéder au scoring
        </a>
      </div>
    `),
    messageWhatsApp: (ctx) =>
      `🔔 *Capilink — URGENT*\n\nDossier PREMIUM à analyser :\n📋 "${ctx.titreProjet}" (${ctx.referenceProjet})\nPorteur : ${ctx.prenomPorteur} ${ctx.nomPorteur || ''}\n\n🔗 ${LIEN_BASE}/admin/scoring`,
  },
}
