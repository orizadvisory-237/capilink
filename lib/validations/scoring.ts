import { z } from "zod";

// ─── Sous-critères par dimension ────────────────────────────────

/** Schéma pour un sous-critère (valeur + justification) */
const sousScoreSchema = (max: number) =>
  z.object({
    valeur: z.number().min(0).max(max),
    justification: z.string().min(1, "La justification est obligatoire"),
  });

// D1 — Viabilité porteur (30 pts)
export const dimensionD1Schema = z.object({
  experienaceSectorielle: sousScoreSchema(10),
  competencesGestion: sousScoreSchema(10),
  resilienceEngagement: sousScoreSchema(10),
});

// D2 — Modèle économique (25 pts)
export const dimensionD2Schema = z.object({
  clarteBizModel: sousScoreSchema(10),
  realismeProjections: sousScoreSchema(8),
  utilisationFonds: sousScoreSchema(7),
});

// D3 — Marché et traction (20 pts)
export const dimensionD3Schema = z.object({
  tailleMarche: sousScoreSchema(8),
  tractionValidation: sousScoreSchema(8),
  avantageConcurrentiel: sousScoreSchema(4),
});

// D4 — Structuration juridique (15 pts)
export const dimensionD4Schema = z.object({
  structureLegale: sousScoreSchema(6),
  qualiteDocumentsFinanciers: sousScoreSchema(5),
  absenceContentieux: sousScoreSchema(4),
});

// D5 — Attractivité investisseur (10 pts)
export const dimensionD5Schema = z.object({
  clarteOffreInvestisseur: sousScoreSchema(5),
  potentielRendement: sousScoreSchema(5),
});

// ─── Commentaires ───────────────────────────────────────────────
export const commentaireSchema = z
  .string()
  .min(100, "Le commentaire doit faire au moins 100 caractères")
  .max(1500, "Maximum 1500 caractères");

export const commentaireSyntheseSchema = z
  .string()
  .min(20, "La synthèse doit faire au moins 20 caractères")
  .max(200, "Maximum 200 caractères pour la vitrine");

// ─── Scoring complet ────────────────────────────────────────────
export const scoringCompletSchema = z.object({
  d1: dimensionD1Schema,
  d2: dimensionD2Schema,
  d3: dimensionD3Schema,
  d4: dimensionD4Schema,
  d5: dimensionD5Schema,
  commentaireGlobal: commentaireSchema,
  commentaireSyntheseInvestisseur: commentaireSyntheseSchema,
  statutChoisi: z.string().min(1, "Veuillez choisir un statut"),
});

export type ScoringCompletData = z.infer<typeof scoringCompletSchema>;
