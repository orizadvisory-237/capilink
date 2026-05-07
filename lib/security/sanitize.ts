import DOMPurify from 'isomorphic-dompurify'

// Sanitiser toutes les chaînes pour prévenir XSS
export function sanitiserTexte(input: unknown): string {
  if (typeof input !== 'string') return ''
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [],      // Aucun HTML autorisé dans les champs texte
    ALLOWED_ATTR: [],
  })
}

// Sanitiser récursivement un objet
export function sanitiserObjet<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitiserTexte(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitiserObjet(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'string' ? sanitiserTexte(item) : item
      )
    } else {
      result[key] = value
    }
  }
  return result as T
}

// Valider et normaliser les numéros camerounais
export function validerTelephoneCamerounais(tel: string): {
  valide: boolean
  normalise?: string
} {
  const clean = tel.replace(/[\s\-().+]/g, '')
  const patterns = [
    /^(6[5-9]\d{7})$/,        // 9 chiffres commençant par 6
    /^(237)(6[5-9]\d{7})$/,   // Avec indicatif pays
  ]
  for (const pattern of patterns) {
    const match = clean.match(pattern)
    if (match) {
      const numero = match[1] === '237' ? match[2] : match[1]
      return { valide: true, normalise: `+237${numero}` }
    }
  }
  return { valide: false }
}

// Prévenir l'injection SQL via Prisma
export function echapperPourSQL(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, '').replace(/--/g, '')
}
