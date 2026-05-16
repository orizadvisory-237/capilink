import { z } from 'zod'

export const connexionSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(10, "Le mot de passe doit faire au moins 10 caractères")
})

export const inscriptionPorteurSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(10, "Le mot de passe doit faire au moins 10 caractères"),
  nom: z.string().min(2, "Nom trop court"),
  prenom: z.string().min(2, "Prénom trop court"),
  telephone: z.string().regex(/^\+237\s?6\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/, "Format attendu : +237 6XX XX XX XX").optional(),
  ville: z.string().optional(),
  qualitePorteur: z.string().optional(),
  secteurPrincipal: z.string().optional(),
  sourceConnaissance: z.string().optional(),
})

export const inscriptionInvestisseurSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(10, "Le mot de passe doit faire au moins 10 caractères"),
  nom: z.string().min(2, "Nom trop court"),
  prenom: z.string().min(2, "Prénom trop court"),
  telephone: z.string().regex(/^\+?[0-9\s\-()]{8,20}$/, "Format de téléphone invalide").optional(),
})
