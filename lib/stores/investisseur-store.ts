import { create } from "zustand";
import type {
  FiltresVitrineExtended,
  ContactFormData,
} from "@/lib/types";

const DEFAULT_FILTRES: FiltresVitrineExtended = {
  secteurs: [],
  typesFinancement: [],
  montantMin: 5000000,
  montantMax: 500000000,
  stades: [],
  zones: [],
  scoreMin: 52,
  prioritairesUniquement: false,
};

interface InvestisseurStore {
  filtresActifs: FiltresVitrineExtended;
  projetsEnregistres: string[];
  historiqueConsultations: string[];
  contactEnCours: {
    projetId: string | null;
    etape: 1 | 2 | 3;
    donnees: Partial<ContactFormData>;
  };

  setFiltres: (filtres: Partial<FiltresVitrineExtended>) => void;
  resetFiltres: () => void;
  toggleProjetEnregistre: (id: string) => void;
  addConsultation: (id: string) => void;
  setContactEtape: (etape: 1 | 2 | 3) => void;
  setContactDonnees: (donnees: Partial<ContactFormData>) => void;
  resetContact: () => void;
}

export const useInvestisseurStore = create<InvestisseurStore>((set) => ({
  filtresActifs: { ...DEFAULT_FILTRES },
  projetsEnregistres:
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("capilink_saved") || "[]")
      : [],
  historiqueConsultations: [],
  contactEnCours: { projetId: null, etape: 1, donnees: {} },

  setFiltres: (filtres) =>
    set((state) => ({
      filtresActifs: { ...state.filtresActifs, ...filtres },
    })),

  resetFiltres: () => set({ filtresActifs: { ...DEFAULT_FILTRES } }),

  toggleProjetEnregistre: (id) =>
    set((state) => {
      const exists = state.projetsEnregistres.includes(id);
      const next = exists
        ? state.projetsEnregistres.filter((p) => p !== id)
        : [...state.projetsEnregistres, id];
      if (typeof window !== "undefined") {
        sessionStorage.setItem("capilink_saved", JSON.stringify(next));
      }
      return { projetsEnregistres: next };
    }),

  addConsultation: (id) =>
    set((state) => ({
      historiqueConsultations: state.historiqueConsultations.includes(id)
        ? state.historiqueConsultations
        : [...state.historiqueConsultations, id],
    })),

  setContactEtape: (etape) =>
    set((state) => ({
      contactEnCours: { ...state.contactEnCours, etape },
    })),

  setContactDonnees: (donnees) =>
    set((state) => ({
      contactEnCours: {
        ...state.contactEnCours,
        donnees: { ...state.contactEnCours.donnees, ...donnees },
      },
    })),

  resetContact: () =>
    set({ contactEnCours: { projetId: null, etape: 1, donnees: {} } }),
}));
