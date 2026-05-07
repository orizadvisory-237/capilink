import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

interface DonnéesRapport {
  referenceProjet: string
  titreProjet: string
  secteur: string
  stade: string
  montantRecherche: string
  typeFinancement: string
  porteur: {
    prenom: string
    nom: string
    ville: string
    anneesExperience: string
    structureJuridique: string
  }
  scoring: {
    scoreTotal: number
    statutScoring: string
    dimensions: {
      viabilitePorteur: number
      modeleEconomique: number
      marcheTraction: number
      structurationJuridique: number
      attractiviteInvestisseur: number
    }
    commentaireGlobal: string
    commentaireSyntheseInvestisseur: string
  }
  dateAnalyse: string
}

/**
 * Génère un rapport de scoring en PDF (A4) à partir des données du projet.
 * Utilise Puppeteer avec @sparticuz/chromium pour la compatibilité Vercel Serverless.
 */
export async function genererRapportPDF(donnees: DonnéesRapport): Promise<Buffer> {
  const html = construireHTML(donnees)

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1920, height: 1080 },
    executablePath: await chromium.executablePath(),
    headless: true,
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

function getNiveauScore(score: number): { label: string; couleur: string } {
  if (score >= 80) return { label: 'Projet Prioritaire', couleur: '#059669' }
  if (score >= 60) return { label: 'Projet Standard', couleur: '#2563eb' }
  if (score >= 40) return { label: 'Accompagnement Oriz', couleur: '#d97706' }
  return { label: 'Non éligible', couleur: '#dc2626' }
}

function construireHTML(d: DonnéesRapport): string {
  const niveau = getNiveauScore(d.scoring.scoreTotal)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; line-height: 1.6; }
    
    .header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%);
      color: white;
      padding: 32px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 { font-size: 24px; font-weight: 700; }
    .header p { font-size: 12px; opacity: 0.8; margin-top: 4px; }
    .header .ref {
      background: rgba(255,255,255,0.15);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
    }
    
    .content { padding: 32px 40px; }
    
    .project-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 4px;
    }
    .project-meta {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 24px;
    }
    
    .score-banner {
      background: linear-gradient(135deg, #1e3a5f, #2d5a8c);
      border-radius: 12px;
      padding: 24px 32px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }
    .score-banner .score-value { font-size: 48px; font-weight: 800; }
    .score-banner .score-label { font-size: 14px; opacity: 0.8; }
    .score-banner .statut {
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1e3a5f;
      margin: 24px 0 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .dimensions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .dimension-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .dimension-card .dim-name {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dimension-card .dim-score {
      font-size: 22px;
      font-weight: 700;
      color: #1e3a5f;
      margin-top: 4px;
    }
    .dimension-card .dim-bar {
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      margin-top: 8px;
      overflow: hidden;
    }
    .dimension-card .dim-bar-fill {
      height: 100%;
      border-radius: 2px;
      background: linear-gradient(90deg, #1e3a5f, #3b82f6);
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 16px;
    }
    .info-item {
      padding: 8px 0;
    }
    .info-item .label {
      font-size: 11px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-item .value {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-top: 2px;
    }
    
    .commentaire {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .commentaire h4 {
      color: #166534;
      font-size: 13px;
      margin-bottom: 6px;
    }
    .commentaire p {
      font-size: 13px;
      color: #333;
      line-height: 1.6;
    }
    
    .footer {
      text-align: center;
      padding: 20px 40px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #9ca3af;
    }
    .footer .confidential {
      color: #dc2626;
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Capilink</h1>
      <p>by Oriz Advisory — Rapport de Scoring</p>
    </div>
    <div class="ref">${d.referenceProjet}</div>
  </div>
  
  <div class="content">
    <div class="project-title">${d.titreProjet}</div>
    <div class="project-meta">${d.secteur} · ${d.stade} · ${d.typeFinancement} · ${d.montantRecherche}</div>
    
    <div class="score-banner">
      <div>
        <div class="score-label">Score Global</div>
        <div class="score-value">${d.scoring.scoreTotal}<span style="font-size:24px;opacity:0.6;">/100</span></div>
      </div>
      <div class="statut" style="background:${niveau.couleur};">${niveau.label}</div>
    </div>
    
    <div class="section-title">Détail par dimension</div>
    <div class="dimensions-grid">
      <div class="dimension-card">
        <div class="dim-name">Viabilité du Porteur</div>
        <div class="dim-score">${d.scoring.dimensions.viabilitePorteur}/30</div>
        <div class="dim-bar"><div class="dim-bar-fill" style="width:${(d.scoring.dimensions.viabilitePorteur / 30) * 100}%"></div></div>
      </div>
      <div class="dimension-card">
        <div class="dim-name">Modèle Économique</div>
        <div class="dim-score">${d.scoring.dimensions.modeleEconomique}/25</div>
        <div class="dim-bar"><div class="dim-bar-fill" style="width:${(d.scoring.dimensions.modeleEconomique / 25) * 100}%"></div></div>
      </div>
      <div class="dimension-card">
        <div class="dim-name">Marché & Traction</div>
        <div class="dim-score">${d.scoring.dimensions.marcheTraction}/20</div>
        <div class="dim-bar"><div class="dim-bar-fill" style="width:${(d.scoring.dimensions.marcheTraction / 20) * 100}%"></div></div>
      </div>
      <div class="dimension-card">
        <div class="dim-name">Structuration Juridique</div>
        <div class="dim-score">${d.scoring.dimensions.structurationJuridique}/15</div>
        <div class="dim-bar"><div class="dim-bar-fill" style="width:${(d.scoring.dimensions.structurationJuridique / 15) * 100}%"></div></div>
      </div>
      <div class="dimension-card" style="grid-column: span 2;">
        <div class="dim-name">Attractivité Investisseur</div>
        <div class="dim-score">${d.scoring.dimensions.attractiviteInvestisseur}/10</div>
        <div class="dim-bar"><div class="dim-bar-fill" style="width:${(d.scoring.dimensions.attractiviteInvestisseur / 10) * 100}%"></div></div>
      </div>
    </div>
    
    <div class="section-title">Profil du Porteur</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="label">Nom complet</div>
        <div class="value">${d.porteur.prenom} ${d.porteur.nom}</div>
      </div>
      <div class="info-item">
        <div class="label">Ville</div>
        <div class="value">${d.porteur.ville}</div>
      </div>
      <div class="info-item">
        <div class="label">Expérience</div>
        <div class="value">${d.porteur.anneesExperience}</div>
      </div>
      <div class="info-item">
        <div class="label">Structure juridique</div>
        <div class="value">${d.porteur.structureJuridique}</div>
      </div>
    </div>
    
    <div class="section-title">Avis des experts</div>
    <div class="commentaire">
      <h4>Commentaire global de l'analyste</h4>
      <p>${d.scoring.commentaireGlobal}</p>
    </div>
    <div class="commentaire" style="background:#eff6ff;border-color:#bfdbfe;">
      <h4 style="color:#1e40af;">Synthèse investisseur (publique)</h4>
      <p>${d.scoring.commentaireSyntheseInvestisseur}</p>
    </div>
  </div>
  
  <div class="footer">
    <div class="confidential">DOCUMENT CONFIDENTIEL</div>
    <p>Généré le ${d.dateAnalyse} · Capilink by Oriz Advisory · Douala, Cameroun</p>
    <p>Ce document est réservé à un usage interne et ne saurait être diffusé sans autorisation.</p>
  </div>
</body>
</html>`
}
