import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || 'https://dummy.upstash.io',
  token: process.env.UPSTASH_REDIS_TOKEN || 'dummy_token',
})

// Configurations par type d'opération
export const limiteurs = {
  // Connexion : 5 tentatives par 15 min par IP
  connexion: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'rl:connexion',
  }),

  // Inscription : 3 comptes par heure par IP
  inscription: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'rl:inscription',
  }),

  // Contact investisseur : 5 par heure par IP
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'rl:contact',
  }),

  // Upload document : 20 par heure par utilisateur
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    prefix: 'rl:upload',
  }),

  // API générale : 100 requêtes par minute par IP
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'rl:api',
  }),
}

export async function verifierLimite(
  limiteur: Ratelimit,
  identifiant: string
): Promise<{ autorise: boolean; restant: number; resetAt: Date }> {
  // En mode dev sans redis configuré, on bypass temporairement
  if (!process.env.UPSTASH_REDIS_URL || process.env.UPSTASH_REDIS_URL.includes('dummy')) {
     return { autorise: true, restant: 100, resetAt: new Date(Date.now() + 60000) }
  }

  const { success, remaining, reset } = await limiteur.limit(identifiant)
  return {
    autorise: success,
    restant: remaining,
    resetAt: new Date(reset),
  }
}

// Helper pour extraire l'IP réelle derrière Vercel/CDN
export function extraireIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  if (forwarded) return forwarded.split(',')[0].trim()
  if (real) return real
  return '127.0.0.1'
}
