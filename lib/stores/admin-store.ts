import { create } from "zustand";
import { StatutScoring } from "@/lib/types";

// ─── Types ─────────────────────────────────────────────────────

export interface SubScore {
  valeur: number;
  justification: string;
}

interface ScoresD1 { experienaceSectorielle: SubScore; competencesGestion: SubScore; resilienceEngagement: SubScore; }
interface ScoresD2 { clarteBizModel: SubScore; realismeProjections: SubScore; utilisationFonds: SubScore; }
interface ScoresD3 { tailleMarche: SubScore; tractionValidation: SubScore; avantageConcurrentiel: SubScore; }
interface ScoresD4 { structureLegale: SubScore; qualiteDocumentsFinanciers: SubScore; absenceContentieux: SubScore; }
interface ScoresD5 { clarteOffreInvestisseur: SubScore; potentielRendement: SubScore; }

interface AdminStore {
  // Utilisateur mocké
  analysteConnecte: { id: string; nom: string; prenom: string; role: "ADMIN" | "ANALYSTE" };

  // Scoring en cours
  scoringEnCours: {
    projetId: string | null;
    dimensionActive: 1 | 2 | 3 | 4 | 5;
    d1: ScoresD1;
    d2: ScoresD2;
    d3: ScoresD3;
    d4: ScoresD4;
    d5: ScoresD5;
    commentaireGlobal: string;
    commentaireSyntheseInvestisseur: string;
    statutChoisi: StatutScoring | null;
    documentsVerifies: string[];
    notesInternes: string;
    derniereSauvegarde: string | null;
  };

  // Filtres et navigation
  filtresDossiers: { statut: StatutScoring | "TOUS"; search: string; tri: string };
  filtresInvestisseurs: { statut: string; search: string };
  sidebarCollapsed: boolean;

  // Actions scoring
  initScoring: (projetId: string) => void;
  loadScoring: (projetId: string, scoringData: any) => void;
  setDimensionActive: (dim: 1 | 2 | 3 | 4 | 5) => void;
  setSubScore: (dim: "d1" | "d2" | "d3" | "d4" | "d5", critere: string, valeur: number) => void;
  setJustification: (dim: "d1" | "d2" | "d3" | "d4" | "d5", critere: string, texte: string) => void;
  setCommentaireGlobal: (texte: string) => void;
  setCommentaireSynthese: (texte: string) => void;
  setStatutChoisi: (statut: StatutScoring) => void;
  toggleDocumentVerifie: (docId: string) => void;
  setNotesInternes: (notes: string) => void;
  sauvegarderBrouillon: () => void;
  resetScoring: () => void;

  // Filtres
  setFiltresDossiers: (f: Partial<AdminStore["filtresDossiers"]>) => void;
  setFiltresInvestisseurs: (f: Partial<AdminStore["filtresInvestisseurs"]>) => void;
  toggleSidebar: () => void;

  // Getters (computed)
  getScoreD1: () => number;
  getScoreD2: () => number;
  getScoreD3: () => number;
  getScoreD4: () => number;
  getScoreD5: () => number;
  getScoreTotal: () => number;
  getStatutRecommande: () => StatutScoring;
  getPourcentageCompletion: () => number;
}

const makeSubScore = (valeur = 0): SubScore => ({ valeur, justification: "" });

const DEFAULT_SCORING: AdminStore["scoringEnCours"] = {
  projetId: null,
  dimensionActive: 1,
  d1: {
    experienaceSectorielle: makeSubScore(),
    competencesGestion: makeSubScore(),
    resilienceEngagement: makeSubScore(),
  },
  d2: {
    clarteBizModel: makeSubScore(),
    realismeProjections: makeSubScore(),
    utilisationFonds: makeSubScore(),
  },
  d3: {
    tailleMarche: makeSubScore(),
    tractionValidation: makeSubScore(),
    avantageConcurrentiel: makeSubScore(),
  },
  d4: {
    structureLegale: makeSubScore(),
    qualiteDocumentsFinanciers: makeSubScore(),
    absenceContentieux: makeSubScore(),
  },
  d5: {
    clarteOffreInvestisseur: makeSubScore(),
    potentielRendement: makeSubScore(),
  },
  commentaireGlobal: "",
  commentaireSyntheseInvestisseur: "",
  statutChoisi: null,
  documentsVerifies: [],
  notesInternes: "",
  derniereSauvegarde: null,
};

export const useAdminStore = create<AdminStore>((set, get) => ({
  analysteConnecte: { id: "a1", nom: "Ekotto", prenom: "Marie", role: "ADMIN" },

  scoringEnCours: { ...DEFAULT_SCORING },

  filtresDossiers: { statut: "TOUS", search: "", tri: "date_desc" },
  filtresInvestisseurs: { statut: "TOUS", search: "" },
  sidebarCollapsed: false,

  initScoring: (projetId) =>
    set({ scoringEnCours: { ...DEFAULT_SCORING, projetId } }),

  loadScoring: (projetId, data) => set({
    scoringEnCours: {
      ...DEFAULT_SCORING,
      projetId,
      d1: {
        experienaceSectorielle: { valeur: data.d1ExperienceSectorielle || 0, justification: data.d1Justifications?.experienaceSectorielle || "" },
        competencesGestion: { valeur: data.d1CompetencesGestion || 0, justification: data.d1Justifications?.competencesGestion || "" },
        resilienceEngagement: { valeur: data.d1ResilienceEngagement || 0, justification: data.d1Justifications?.resilienceEngagement || "" },
      },
      d2: {
        clarteBizModel: { valeur: data.d2ClarteBM || 0, justification: data.d2Justifications?.clarteBizModel || "" },
        realismeProjections: { valeur: data.d2RealismeProjections || 0, justification: data.d2Justifications?.realismeProjections || "" },
        utilisationFonds: { valeur: data.d2StructurationFonds || 0, justification: data.d2Justifications?.utilisationFonds || "" },
      },
      d3: {
        tailleMarche: { valeur: data.d3TailleMarche || 0, justification: data.d3Justifications?.tailleMarche || "" },
        tractionValidation: { valeur: data.d3Traction || 0, justification: data.d3Justifications?.tractionValidation || "" },
        avantageConcurrentiel: { valeur: data.d3AvantagesConcurrentiels || 0, justification: data.d3Justifications?.avantageConcurrentiel || "" },
      },
      d4: {
        structureLegale: { valeur: data.d4StructureLegale || 0, justification: data.d4Justifications?.structureLegale || "" },
        qualiteDocumentsFinanciers: { valeur: data.d4DocumentsFinanciers || 0, justification: data.d4Justifications?.qualiteDocumentsFinanciers || "" },
        absenceContentieux: { valeur: data.d4AbsenceContentieux || 0, justification: data.d4Justifications?.absenceContentieux || "" },
      },
      d5: {
        clarteOffreInvestisseur: { valeur: data.d5ClarteOffre || 0, justification: data.d5Justifications?.clarteOffreInvestisseur || "" },
        potentielRendement: { valeur: data.d5PotentielRendement || 0, justification: data.d5Justifications?.potentielRendement || "" },
      },
      commentaireGlobal: data.commentaireGlobal || "",
      commentaireSyntheseInvestisseur: data.commentaireSyntheseInvestisseur || "",
      statutChoisi: data.statutChoisi || null,
      derniereSauvegarde: data.updatedAt || null,
    }
  }),

  setDimensionActive: (dim) =>
    set((s) => ({ scoringEnCours: { ...s.scoringEnCours, dimensionActive: dim } })),

  setSubScore: (dim, critere, valeur) =>
    set((s) => ({
      scoringEnCours: {
        ...s.scoringEnCours,
        [dim]: {
          ...(s.scoringEnCours[dim] as unknown as Record<string, SubScore>),
          [critere]: {
            ...(s.scoringEnCours[dim] as unknown as Record<string, SubScore>)[critere],
            valeur,
          },
        },
      },
    })),

  setJustification: (dim, critere, texte) =>
    set((s) => ({
      scoringEnCours: {
        ...s.scoringEnCours,
        [dim]: {
          ...(s.scoringEnCours[dim] as unknown as Record<string, SubScore>),
          [critere]: {
            ...(s.scoringEnCours[dim] as unknown as Record<string, SubScore>)[critere],
            justification: texte,
          },
        },
      },
    })),

  setCommentaireGlobal: (texte) =>
    set((s) => ({ scoringEnCours: { ...s.scoringEnCours, commentaireGlobal: texte } })),

  setCommentaireSynthese: (texte) =>
    set((s) => ({ scoringEnCours: { ...s.scoringEnCours, commentaireSyntheseInvestisseur: texte } })),

  setStatutChoisi: (statut) =>
    set((s) => ({ scoringEnCours: { ...s.scoringEnCours, statutChoisi: statut } })),

  toggleDocumentVerifie: (docId) =>
    set((s) => {
      const docs = s.scoringEnCours.documentsVerifies;
      return {
        scoringEnCours: {
          ...s.scoringEnCours,
          documentsVerifies: docs.includes(docId)
            ? docs.filter((d) => d !== docId)
            : [...docs, docId],
        },
      };
    }),

  setNotesInternes: (notes) =>
    set((s) => ({ scoringEnCours: { ...s.scoringEnCours, notesInternes: notes } })),

  sauvegarderBrouillon: () =>
    set((s) => ({
      scoringEnCours: {
        ...s.scoringEnCours,
        derniereSauvegarde: new Date().toISOString(),
      },
    })),

  resetScoring: () => set({ scoringEnCours: { ...DEFAULT_SCORING } }),

  setFiltresDossiers: (f) =>
    set((s) => ({ filtresDossiers: { ...s.filtresDossiers, ...f } })),

  setFiltresInvestisseurs: (f) =>
    set((s) => ({ filtresInvestisseurs: { ...s.filtresInvestisseurs, ...f } })),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // ─── Getters ─────────────────────────────────────────────────
  getScoreD1: () => {
    const { d1 } = get().scoringEnCours;
    return d1.experienaceSectorielle.valeur + d1.competencesGestion.valeur + d1.resilienceEngagement.valeur;
  },
  getScoreD2: () => {
    const { d2 } = get().scoringEnCours;
    return d2.clarteBizModel.valeur + d2.realismeProjections.valeur + d2.utilisationFonds.valeur;
  },
  getScoreD3: () => {
    const { d3 } = get().scoringEnCours;
    return d3.tailleMarche.valeur + d3.tractionValidation.valeur + d3.avantageConcurrentiel.valeur;
  },
  getScoreD4: () => {
    const { d4 } = get().scoringEnCours;
    return d4.structureLegale.valeur + d4.qualiteDocumentsFinanciers.valeur + d4.absenceContentieux.valeur;
  },
  getScoreD5: () => {
    const { d5 } = get().scoringEnCours;
    return d5.clarteOffreInvestisseur.valeur + d5.potentielRendement.valeur;
  },
  getScoreTotal: () => {
    const s = get();
    return s.getScoreD1() + s.getScoreD2() + s.getScoreD3() + s.getScoreD4() + s.getScoreD5();
  },
  getStatutRecommande: () => {
    const score = get().getScoreTotal();
    if (score >= 75) return StatutScoring.PRIORITAIRE;
    if (score >= 60) return StatutScoring.STANDARD;
    if (score >= 45) return StatutScoring.ACCOMPAGNEMENT;
    return StatutScoring.REJETE;
  },
  getPourcentageCompletion: () => {
    const s = get();
    const sc = s.scoringEnCours;
    let filled = 0;
    const check = (sub: SubScore) => { if (sub.valeur > 0 || sub.justification.length > 0) filled++; };
    Object.values(sc.d1).forEach(check);
    Object.values(sc.d2).forEach(check);
    Object.values(sc.d3).forEach(check);
    Object.values(sc.d4).forEach(check);
    Object.values(sc.d5).forEach(check);
    // 11 sous-critères + commentaire global
    if (sc.commentaireGlobal.length >= 100) filled++;
    return Math.round((filled / 12) * 100);
  },
}));
