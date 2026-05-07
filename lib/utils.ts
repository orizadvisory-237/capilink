import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formate un montant en FCFA avec séparateur de milliers (ex. 25 000 000 FCFA) */
export function formatFCFA(montant: number | string): string {
  return new Intl.NumberFormat("fr-FR").format(Number(montant)) + " FCFA";
}

