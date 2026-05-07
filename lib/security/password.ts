import bcrypt from 'bcryptjs'
import zxcvbn from 'zxcvbn'

export const PASSWORD_CONFIG = {
  MIN_LENGTH: 10,
  BCRYPT_ROUNDS: 12,    // ~300ms sur serveur moderne — bon équilibre sécurité/perf
  MAX_LENGTH: 128,      // Prévenir les attaques DoS par bcrypt sur très longs mots de passe
}

export function evaluerForceMotDePasse(password: string): {
  score: 0 | 1 | 2 | 3 | 4
  acceptable: boolean
  retour: string
} {
  if (password.length > PASSWORD_CONFIG.MAX_LENGTH) {
    return { score: 0, acceptable: false, retour: 'Mot de passe trop long.' }
  }
  const result = zxcvbn(password)
  const acceptable = result.score >= 3
  const messages = [
    'Très faible — à éviter',
    'Faible — trop prévisible',
    'Moyen — peut mieux faire',
    'Fort — bon choix',
    'Très fort — excellent',
  ]
  return {
    score: result.score as 0 | 1 | 2 | 3 | 4,
    acceptable,
    retour: messages[result.score],
  }
}

export async function hasherMotDePasse(password: string): Promise<string> {
  if (password.length < PASSWORD_CONFIG.MIN_LENGTH)
    throw new Error('Mot de passe trop court')
  if (password.length > PASSWORD_CONFIG.MAX_LENGTH)
    throw new Error('Mot de passe trop long')
  return bcrypt.hash(password, PASSWORD_CONFIG.BCRYPT_ROUNDS)
}

export async function verifierMotDePasse(
  plain: string,
  hash: string
): Promise<boolean> {
  // Toujours exécuter bcrypt même si le mot de passe est vide
  // pour éviter les timing attacks sur l'existence d'un compte
  if (!plain || plain.length > PASSWORD_CONFIG.MAX_LENGTH) {
    await bcrypt.hash('dummy-constant-time', 12)
    return false
  }
  return bcrypt.compare(plain, hash)
}
