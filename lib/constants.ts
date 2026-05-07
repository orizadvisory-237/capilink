import { SecteurActivite, StatutScoring, BesoinsFinancement, type Forfait } from "./types";

export const FORFAITS: Forfait[] = [
  {
    id: "STARTER",
    nom: "Starter",
    prix: 50000,
    features: [
      "Scoring sur 5 dimensions",
      "Rapport d'évaluation",
      "Publication sur la vitrine",
    ],
    recommended: false,
  },
  {
    id: "GROWTH",
    nom: "Growth",
    prix: 100000,
    features: [
      "Tout Starter",
      "Mise en avant prioritaire",
      "Accompagnement pré-publication",
      "Badge « Recommandé »",
    ],
    recommended: true,
  },
  {
    id: "PREMIUM",
    nom: "Premium",
    prix: 200000,
    features: [
      "Tout Growth",
      "Analyse approfondie express (48h)",
      "Coaching pitch investisseur",
      "Accès analyste dédié",
    ],
    recommended: false,
  },
];

export const SECTEURS_ACTIVITE: { id: SecteurActivite; label: string; icon: string }[] = [
  { id: SecteurActivite.AGRICULTURE, label: "Agriculture", icon: "🌾" },
  { id: SecteurActivite.AGROALIMENTAIRE, label: "Agroalimentaire", icon: "🥫" },
  { id: SecteurActivite.BTP, label: "Bâtiment et Travaux Publics", icon: "🏗️" },
  { id: SecteurActivite.COMMERCE, label: "Commerce général", icon: "🛒" },
  { id: SecteurActivite.EDUCATION, label: "Éducation & Formation", icon: "📚" },
  { id: SecteurActivite.ENERGIE, label: "Énergie", icon: "⚡" },
  { id: SecteurActivite.SANTE, label: "Santé", icon: "🏥" },
  { id: SecteurActivite.SERVICES, label: "Services", icon: "🤝" },
  { id: SecteurActivite.TECHNOLOGIE, label: "Technologie & Numérique", icon: "💻" },
  { id: SecteurActivite.TRANSPORT, label: "Transport & Logistique", icon: "🚚" },
  { id: SecteurActivite.AUTRE, label: "Autre", icon: "📌" },
];

export const TRANCHES_MONTANT = [
  { id: "10-25", label: "10M - 25M FCFA", min: 10000000, max: 25000000 },
  { id: "25-50", label: "25M - 50M FCFA", min: 25000000, max: 50000000 },
  { id: "50-100", label: "50M - 100M FCFA", min: 50000000, max: 100000000 },
  { id: "100+", label: "Plus de 100M FCFA", min: 100000000, max: null },
];

export const STATUTS_SCORING: Record<StatutScoring, { label: string; couleur: string; description: string }> = {
  [StatutScoring.EN_ATTENTE]: {
    label: "En attente de soumission",
    couleur: "text-gray-500 bg-gray-100",
    description: "Le projet n'est pas encore finalisé par le porteur.",
  },
  [StatutScoring.EN_COURS]: {
    label: "En cours d'analyse",
    couleur: "text-blue-700 bg-blue-100",
    description: "Les experts Oriz Advisory analysent actuellement ce projet.",
  },
  [StatutScoring.PRIORITAIRE]: {
    label: "Projet Prioritaire",
    couleur: "text-green-800 bg-green-100",
    description: "Le projet présente un profil très recherché par les investisseurs.",
  },
  [StatutScoring.STANDARD]: {
    label: "Projet Standard",
    couleur: "text-emerald-700 bg-emerald-100",
    description: "Le projet répond aux critères de base de viabilité.",
  },
  [StatutScoring.ACCOMPAGNEMENT]: {
    label: "Accompagnement Oriz",
    couleur: "text-yellow-700 bg-yellow-100",
    description: "Le projet nécessite une petite structuration avant présentation.",
  },
  [StatutScoring.REJETE]: {
    label: "Rejeté",
    couleur: "text-red-700 bg-red-100",
    description: "Le projet ne répond pas aux critères de la plateforme.",
  },
};

export const TYPES_FINANCEMENT: { id: BesoinsFinancement; label: string; description: string }[] = [
  {
    id: BesoinsFinancement.EQUITY,
    label: "Capital (Equity)",
    description: "Entrée d'un investisseur dans le capital de l'entreprise avec partage des risques.",
  },
  {
    id: BesoinsFinancement.DETTE,
    label: "Dette",
    description: "Prêt avec conditions de remboursement définies (taux, maturité).",
  },
  {
    id: BesoinsFinancement.SUBVENTION,
    label: "Subvention",
    description: "Mécanismes de fonds perdus souvent couplés avec l'assistance technique.",
  },
  {
    id: BesoinsFinancement.LEASING,
    label: "Leasing (Crédit-bail)",
    description: "Acquisition de matériel pro ou machinerie de production.",
  },
  {
    id: BesoinsFinancement.MIXTE,
    label: "Mixte (Dette + Capital)",
    description: "Combinaison pour optimiser le levier et la syndication.",
  },
];
