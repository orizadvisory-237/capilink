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
  telephone: z.string().optional(),
})

export const inscriptionInvestisseurSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(10, "Le mot de passe doit faire au moins 10 caractères"),
  nom: z.string().min(2, "Nom trop court"),
  prenom: z.string().min(2, "Prénom trop court"),
  telephone: z.string().optional(),
})
