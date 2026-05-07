import { z } from "zod";

// ─── Étape 1 : Identification investisseur ──────────────────────
export const contactEtape1Schema = z.object({
  prenom: z.string().min(1, "Le prénom est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Adresse email professionnelle invalide"),
  telephone: z
    .string()
    .min(1, "Le numéro de téléphone est requis")
    .regex(/^\+237\s?6\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/, "Format attendu : +237 6XX XX XX XX"),
  qualite: z.string().min(1, "Veuillez sélectionner votre qualité"),
  paysResidence: z.string().min(1, "Veuillez sélectionner votre pays"),
  ticketHabituel: z.string().min(1, "Veuillez indiquer votre ticket habituel"),
});

// ─── Étape 2 : Message et intention ─────────────────────────────
export const contactEtape2Schema = z.object({
  message: z
    .string()
    .min(50, "Le message doit faire au moins 50 caractères")
    .max(500, "500 caractères maximum"),
  intention: z.string().min(1, "Veuillez sélectionner votre intention"),
  dejaInvestiAfrique: z.boolean(),
  accepteTransmission: z.literal(true, {
    message: "Vous devez accepter la transmission de vos coordonnées",
  }),
});

// ─── Schéma complet ─────────────────────────────────────────────
export const contactCompletSchema = contactEtape1Schema.merge(
  contactEtape2Schema
);

export type ContactEtape1Data = z.infer<typeof contactEtape1Schema>;
export type ContactEtape2Data = z.infer<typeof contactEtape2Schema>;
export type ContactCompletData = z.infer<typeof contactCompletSchema>;
