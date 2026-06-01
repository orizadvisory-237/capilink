import { z } from "zod";

// ─── Section 1 : Présentation du projet ─────────────────────────
export const sectionPresentationSchema = z.object({
  nomProjet: z
    .string()
    .min(1, "Le nom du projet est requis")
    .max(80, "80 caractères maximum"),
  secteur: z.string().min(1, "Veuillez sélectionner un secteur d'activité"),
  description: z
    .string()
    .min(1, "La description est requise")
    .max(1000, "1000 caractères maximum"),
  stadeDeveloppement: z.string().min(1, "Veuillez sélectionner le stade de développement"),
  zonesGeographiques: z
    .array(z.string())
    .min(1, "Sélectionnez au moins une zone géographique"),
  problemeResolu: z
    .string()
    .min(1, "Ce champ est requis")
    .max(300, "300 caractères maximum"),
  solutionProposee: z
    .string()
    .min(1, "Ce champ est requis")
    .max(300, "300 caractères maximum"),
  avantageConcurrentiel: z.string().max(300, "300 caractères maximum").optional(),
});

// ─── Section 2 : Informations financières ───────────────────────
export const sectionFinancesSchema = z.object({
  typeFinancement: z.string().min(1, "Veuillez sélectionner un type de financement"),
  montantRecherche: z
    .number()
    .min(5000000, "Le montant minimum est de 5 000 000 FCFA")
    .max(500000000, "Le montant maximum est de 500 000 000 FCFA"),
  utilisationFonds: z
    .array(z.string())
    .min(1, "Sélectionnez au moins une utilisation des fonds"),
  utilisationFondsAutre: z.string().optional(),
  chiffreAffaires: z.string().min(1, "Veuillez sélectionner une tranche"),
  rentabilite: z.string().min(1, "Veuillez indiquer la rentabilité actuelle"),
  projectionCA: z.number().nullable().optional(),
  genereRevenus: z.boolean(),
  depuisCombienTemps: z.string().optional(),
});

// ─── Section 3 : Profil du porteur et équipe ────────────────────
const membreEquipeSchema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  role: z.string().min(1, "Rôle requis"),
  anneesExperience: z.string().min(1, "Requis"),
});

export const sectionPorteurSchema = z.object({
  roleProjet: z.string().min(1, "Veuillez sélectionner votre rôle"),
  anneesExperience: z.string().min(1, "Requis"),
  diplome: z.string().min(1, "Requis"),
  dejaGereEntreprise: z.boolean(),
  membresEquipe: z.boolean(),
  membres: z.array(membreEquipeSchema).max(3).optional(),
  structureJuridique: z.string().min(1, "Requis"),
  numeroContribuable: z.string().optional(),
  contentieux: z.string().min(1, "Requis"),
});

// ─── Section 4 : Documents ──────────────────────────────────────
export const sectionDocumentsSchema = z.object({
  forfait: z.enum(["STARTER", "GROWTH", "PREMIUM"], {
    error: "Veuillez choisir un forfait de listing",
  }),
  documents: z.array(z.object({
    nom: z.string(),
    type: z.enum(["BUSINESS_PLAN", "ETATS_FINANCIERS", "STATUTS", "PIECE_IDENTITE", "AUTRE"]),
    url: z.string(),
    taille: z.number()
  })).optional(),
});

// ─── Schéma complet (union des 4 sections) ──────────────────────
export const projetCompletSchema = sectionPresentationSchema
  .merge(sectionFinancesSchema)
  .merge(sectionPorteurSchema)
  .merge(sectionDocumentsSchema);

export type SectionPresentationData = z.infer<typeof sectionPresentationSchema>;
export type SectionFinancesData = z.infer<typeof sectionFinancesSchema>;
export type SectionPorteurData = z.infer<typeof sectionPorteurSchema>;
export type SectionDocumentsData = z.infer<typeof sectionDocumentsSchema>;
export type ProjetCompletData = z.infer<typeof projetCompletSchema>;

// ─── Schéma inscription porteur ─────────────────────────────────
export const inscriptionEtape1Schema = z
  .object({
    prenom: z.string().min(1, "Le prénom est requis"),
    nom: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Adresse email invalide"),
    telephone: z
      .string()
      .min(1, "Le numéro de téléphone est requis")
      .regex(/^\+237\s?6\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/, "Format attendu : +237 6XX XX XX XX"),
    motDePasse: z.string().min(10, "Le mot de passe doit faire au moins 10 caractères"),
    confirmationMotDePasse: z.string().min(1, "Veuillez confirmer votre mot de passe"),
    accepteConditions: z.literal(true, {
      error: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.motDePasse === data.confirmationMotDePasse, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmationMotDePasse"],
  });

export const inscriptionEtape2Schema = z.object({
  qualitePorteur: z.string().min(1, "Veuillez sélectionner votre qualité"),
  ville: z.string().min(1, "Veuillez sélectionner votre ville"),
  secteurActivite: z.string().min(1, "Veuillez sélectionner un secteur"),
  sourceDecouverte: z.string().min(1, "Veuillez indiquer comment vous nous avez connu"),
});

export const connexionSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  motDePasse: z.string().min(1, "Le mot de passe est requis"),
});
