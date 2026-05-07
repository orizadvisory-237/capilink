import { createHash } from 'crypto'

// Types MIME autorisés avec vérification des magic bytes
const TYPES_AUTORISES: Record<string, { mime: string; magicBytes: number[] }> = {
  pdf: {
    mime: 'application/pdf',
    magicBytes: [0x25, 0x50, 0x44, 0x46], // %PDF
  },
  jpg: {
    mime: 'image/jpeg',
    magicBytes: [0xFF, 0xD8, 0xFF],
  },
  png: {
    mime: 'image/png',
    magicBytes: [0x89, 0x50, 0x4E, 0x47], // .PNG
  },
}

const TAILLE_MAX_OCTETS = 10 * 1024 * 1024 // 10 Mo

export async function validerFichier(file: File): Promise<{
  valide: boolean
  erreur?: string
  hash?: string
}> {
  // 1. Vérifier la taille
  if (file.size > TAILLE_MAX_OCTETS) {
    return { valide: false, erreur: 'Fichier trop volumineux (max 10 Mo)' }
  }

  if (file.size === 0) {
    return { valide: false, erreur: 'Fichier vide' }
  }

  // 2. Vérifier le type MIME déclaré
  const typeAutorise = Object.values(TYPES_AUTORISES).find(
    t => t.mime === file.type
  )
  if (!typeAutorise) {
    return { valide: false, erreur: 'Type de fichier non autorisé (PDF, JPG, PNG uniquement)' }
  }

  // 3. Vérifier les magic bytes réels
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer.slice(0, 8))
  const magicValide = typeAutorise.magicBytes.every(
    (byte, i) => bytes[i] === byte
  )
  if (!magicValide) {
    return {
      valide: false,
      erreur: 'Le contenu du fichier ne correspond pas au type déclaré',
    }
  }

  // 4. Calculer le hash SHA-256 pour déduplication et intégrité
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return { valide: true, hash }
}

// Générer un nom de fichier sécurisé (sans path traversal possible)
export function nomFichierSecurise(
  originalName: string,
  projetId: string,
  type: string
): string {
  const ext = originalName.split('.').pop()?.toLowerCase() ?? 'bin'
  const extAutorisees = ['pdf', 'jpg', 'jpeg', 'png']
  const extSure = extAutorisees.includes(ext) ? ext : 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${type}-${timestamp}-${random}.${extSure}`
}
