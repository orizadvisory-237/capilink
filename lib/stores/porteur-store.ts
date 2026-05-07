import { create } from "zustand";
import type { DocumentUploadItem, ForfaitType, ProjetFormData } from "@/lib/types";

interface PorteurStore {
  /** Données du formulaire multi-étapes */
  projetDraft: Partial<ProjetFormData>;
  currentStep: number;
  forfaitChoisi: ForfaitType | null;
  documentsUploades: DocumentUploadItem[];

  /** Actions */
  setProjetDraft: (data: Partial<ProjetFormData>) => void;
  setCurrentStep: (step: number) => void;
  setForfait: (forfait: ForfaitType) => void;
  addDocument: (doc: DocumentUploadItem) => void;
  removeDocument: (id: string) => void;
  resetForm: () => void;
}

export const usePorteurStore = create<PorteurStore>((set) => ({
  projetDraft: {},
  currentStep: 0,
  forfaitChoisi: null,
  documentsUploades: [],

  setProjetDraft: (data) =>
    set((state) => ({
      projetDraft: { ...state.projetDraft, ...data },
    })),

  setCurrentStep: (step) => set({ currentStep: step }),

  setForfait: (forfait) => set({ forfaitChoisi: forfait }),

  addDocument: (doc) =>
    set((state) => ({
      documentsUploades: [...state.documentsUploades, doc],
    })),

  removeDocument: (id) =>
    set((state) => ({
      documentsUploades: state.documentsUploades.filter((d) => d.id !== id),
    })),

  resetForm: () =>
    set({
      projetDraft: {},
      currentStep: 0,
      forfaitChoisi: null,
      documentsUploades: [],
    }),
}));
