import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getSecretKey() {
  const secret = process.env.NEXTAUTH_SECRET || 'dev-fallback-secret'
  return scryptSync(secret, 'capilink-salt', 32)
}

// Chiffrer les données sensibles (ex. numéros de contribuable)
export function chiffrer(texte: string): string {
  const iv = randomBytes(16)
  const KEY = getSecretKey()
  const cipher = createCipheriv(ALGORITHM, KEY, iv)
  const chiffre = Buffer.concat([cipher.update(texte, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format : iv:tag:données
  return `${iv.toString('hex')}:${tag.toString('hex')}:${chiffre.toString('hex')}`
}

export function dechiffrer(donnees: string): string {
  const [ivHex, tagHex, chiffreHex] = donnees.split(':')
  if (!ivHex || !tagHex || !chiffreHex) return donnees
  
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const chiffre = Buffer.from(chiffreHex, 'hex')
  const KEY = getSecretKey()
  const decipher = createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(chiffre), decipher.final()]).toString('utf8')
}
