export enum UserRole {
  PORTEUR = "PORTEUR",
  INVESTISSEUR = "INVESTISSEUR",
  ADMIN = "ADMIN",
}

export enum BesoinsFinancement {
  EQUITY = "EQUITY",
  DETTE = "DETTE",
  SUBVENTION = "SUBVENTION",
  LEASING = "LEASING",
  MIXTE = "MIXTE",
}

export enum StatutScoring {
  EN_ATTENTE = "EN_ATTENTE",
  EN_COURS = "EN_COURS",
  PRIORITAIRE = "PRIORITAIRE",
  STANDARD = "STANDARD",
  ACCOMPAGNEMENT = "ACCOMPAGNEMENT",
  REJETE = "REJETE",
}

export enum TypeDocument {
  BUSINESS_PLAN = "BUSINESS_PLAN",
  ETATS_FINANCIERS = "ETATS_FINANCIERS",
  STATUTS = "STATUTS",
  PIECE_IDENTITE = "PIECE_IDENTITE",
  AUTRE = "AUTRE",
}

export enum SecteurActivite {
  AGRICULTURE = "AGRICULTURE",
  AGROALIMENTAIRE = "AGROALIMENTAIRE",
  BTP = "BTP",
  COMMERCE = "COMMERCE",
  EDUCATION = "EDUCATION",
  ENERGIE = "ENERGIE",
  SANTE = "SANTE",
  SERVICES = "SERVICES",
  TECHNOLOGIE = "TECHNOLOGIE",
  TRANSPORT = "TRANSPORT",
  AUTRE = "AUTRE",
}

export interface NiveauScore {
  label: string;
  couleur: string;
}

export interface FiltresVitrine {
  secteur?: SecteurActivite;
  montantMin?: number;
  montantMax?: number;
  besoin?: BesoinsFinancement;
}

// Model exports reflecting Prisma schema
export interface User {
  id: string;
  email: string;
  role: UserRole;
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  createdAt: Date;
}

export interface Projet {
  id: string;
  titre: string;
  description: string;
  secteur: string;
  besoins: BesoinsFinancement;
  montantRecherche: number;
  montantMin: number | null;
  montantMax: number | null;
  statutScoring: StatutScoring;
  scoreTotal: number | null;
  published: boolean;
  porteurId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoreDetail {
  id: string;
  projetId: string;
  dimensionViabilitePorteur: number;
  dimensionModelEconomique: number;
  dimensionMarcheTraction: number;
  dimensionStructurationJuridique: number;
  dimensionAttractiviteInvestisseur: number;
  commentaireGlobal: string | null;
  analysteId: string | null;
  createdAt: Date;
}

export interface DocumentProjet {
  id: string;
  projetId: string;
  nom: string;
  type: TypeDocument;
  url: string;
  createdAt: Date;
}

export interface ContactInvestisseur {
  id: string;
  projetId: string;
  investisseurId: string;
  message: string;
  createdAt: Date;
}

// ─── Bloc 2 : Parcours Porteur ──────────────────────────────────

/** Qualité du porteur lors de l'inscription */
export type QualitePorteur =
  | "ENTREPRENEUR_INDIVIDUEL"
  | "DIRIGEANT_PME"
  | "REPRESENTANT_ASSOCIATION"
  | "AUTRE";

/** Stade de développement du projet */
export type StadeDeveloppement =
  | "IDEE"
  | "DEMARRAGE"
  | "CROISSANCE"
  | "EXPANSION";

/** Rôle dans le projet */
export type RoleProjet =
  | "FONDATEUR_UNIQUE"
  | "CO_FONDATEUR"
  | "DIRIGEANT_SALARIE"
  | "MANDATAIRE_SOCIAL"
  | "AUTRE";

/** Structure juridique */
export type StructureJuridique =
  | "PAS_IMMATRICULEE"
  | "ENTREPRISE_INDIVIDUELLE"
  | "SARL"
  | "SA"
  | "GIC_COOPERATIVE"
  | "ASSOCIATION_ONG"
  | "AUTRE";

/** Tranche de chiffre d'affaires */
export type TrancheCA =
  | "AUCUN"
  | "MOINS_5M"
  | "5M_20M"
  | "20M_50M"
  | "50M_100M"
  | "PLUS_100M"
  | "NON_COMMUNIQUE";

/** Rentabilité actuelle */
export type Rentabilite =
  | "BENEFICIAIRE"
  | "EQUILIBRE"
  | "DEFICITAIRE"
  | "PAS_ACTIVITE";

/** Membre clé de l'équipe */
export interface MembreEquipe {
  prenom: string;
  nom: string;
  role: string;
  anneesExperience: string;
}

/** Données complètes du formulaire de soumission (4 sections) */
export interface ProjetFormData {
  // Section 1 — Présentation
  nomProjet: string;
  secteur: SecteurActivite;
  description: string;
  stadeDeveloppement: StadeDeveloppement;
  zonesGeographiques: string[];
  problemeResolu: string;
  solutionProposee: string;
  avantageConcurrentiel: string;

  // Section 2 — Finances
  typeFinancement: BesoinsFinancement;
  montantRecherche: number;
  utilisationFonds: string[];
  utilisationFondsAutre: string;
  chiffreAffaires: TrancheCA;
  rentabilite: Rentabilite;
  projectionCA: number | null;
  genereRevenus: boolean;
  depuisCombienTemps: string;

  // Section 3 — Porteur & équipe
  roleProjet: RoleProjet;
  anneesExperience: string;
  diplome: string;
  dejaGereEntreprise: boolean;
  membresEquipe: boolean;
  membres: MembreEquipe[];
  structureJuridique: StructureJuridique;
  numeroContribuable: string;
  contentieux: string;

  // Section 4 — Documents (géré séparément via DocumentUploadItem)
}

/** Fichier uploadé côté client (pas d'upload réel dans ce bloc) */
export interface DocumentUploadItem {
  id: string;
  nom: string;
  type: TypeDocument;
  fichier: File | null;
  taille: number;
  statut: "EN_COURS" | "TELECHARGE" | "ERREUR";
  progression: number;
}

/** Forfait de listing */
export type ForfaitType = "STARTER" | "GROWTH" | "PREMIUM";

export interface Forfait {
  id: ForfaitType;
  nom: string;
  prix: number;
  features: string[];
  recommended: boolean;
}

// ─── Bloc 3 : Vitrine Investisseur ──────────────────────────────

/** Projet complet pour la vitrine investisseur (mock) */
export interface ProjetMock {
  id: string;
  titre: string;
  secteur: SecteurActivite;
  stade: StadeDeveloppement;
  typeFinancement: BesoinsFinancement;
  montantRecherche: number | string;
  montantMin: number | string;
  montantMax: number | string;
  ville: string;
  zoneGeographique: string[];
  description: string;
  problemeResolu: string;
  solution: string;
  avantagesConcurrentiels: string;
  caActuel: string;
  rentabilite: string;
  revenusGeneres: boolean;
  scoreTotal: number;
  statutScoring: "PRIORITAIRE" | "STANDARD";
  scoreDetail: {
    viabilitePorteur: number;
    modeleEconomique: number;
    marcheTraction: number;
    structurationJuridique: number;
    attractiviteInvestisseur: number;
    commentaireOriz?: string;
  };
  commentaireOriz: string;
  forfait: ForfaitType;
  datePublication: string;
  publishedAt?: string;
  anneesExperience?: string;
  structureJuridique?: string;
  nombreVues: number;
  nombreContactsInvestisseur: number;
  porteur: {
    prenom: string;
    nom: string;
    ville: string;
    anneesExperience: string;
    structureJuridique: string;
  };
  documents: {
    businessPlan: boolean;
    etatsFinanciers: boolean;
    statuts: boolean;
  };
}

/** Qualité de l'investisseur */
export type QualiteInvestisseur =
  | "BUSINESS_ANGEL"
  | "FONDS_INVESTISSEMENT"
  | "INSTITUTION_FINANCIERE"
  | "DIASPORA"
  | "STRATEGIQUE";

/** Type d'intention de contact */
export type IntentionContact =
  | "INFORMATION"
  | "RENDEZ_VOUS"
  | "FINANCEMENT"
  | "PARTENARIAT";

/** Données du formulaire de contact investisseur */
export interface ContactFormData {
  // Étape 1 — Identification
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  qualite: QualiteInvestisseur;
  paysResidence: string;
  ticketHabituel: string;

  // Étape 2 — Message
  message: string;
  intention: IntentionContact;
  dejaInvestiAfrique: boolean;
  accepteTransmission: boolean;
}

/** Filtres vitrine étendus pour Bloc 3 */
export interface FiltresVitrineExtended {
  secteurs: SecteurActivite[];
  typesFinancement: BesoinsFinancement[];
  montantMin: number;
  montantMax: number;
  stades: StadeDeveloppement[];
  zones: string[];
  scoreMin: number;
  prioritairesUniquement: boolean;
}


