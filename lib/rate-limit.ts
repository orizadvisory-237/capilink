/**
 * Rate limiter simple avec Token Bucket en mémoire.
 * Approprié pour le développement et les petits déploiements Vercel.
 * Pour la production à grande échelle, préférer Redis (Upstash).
 */

interface BucketEntry {
  tokens: number
  lastRefill: number
}

const buckets = new Map<string, BucketEntry>()

interface RateLimitConfig {
  /** Nombre maximum de requêtes autorisées dans la fenêtre */
  maxTokens: number
  /** Durée de la fenêtre en millisecondes */
  refillInterval: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 10,
  refillInterval: 60 * 1000, // 1 minute
}

/**
 * Vérifie si une clé (IP, userId, etc.) est autorisée à effectuer une requête.
 * @returns `true` si la requête est autorisée, `false` si rate limited
 */
export function checkRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetMs: number } {
  const { maxTokens, refillInterval } = { ...DEFAULT_CONFIG, ...config }
  const now = Date.now()

  let entry = buckets.get(key)

  if (!entry) {
    entry = { tokens: maxTokens - 1, lastRefill: now }
    buckets.set(key, entry)
    return { allowed: true, remaining: maxTokens - 1, resetMs: refillInterval }
  }

  // Refill si la fenêtre est passée
  const elapsed = now - entry.lastRefill
  if (elapsed >= refillInterval) {
    entry.tokens = maxTokens - 1
    entry.lastRefill = now
    return { allowed: true, remaining: entry.tokens, resetMs: refillInterval }
  }

  // Consommer un token
  if (entry.tokens > 0) {
    entry.tokens--
    return {
      allowed: true,
      remaining: entry.tokens,
      resetMs: refillInterval - elapsed,
    }
  }

  // Rate limited
  return {
    allowed: false,
    remaining: 0,
    resetMs: refillInterval - elapsed,
  }
}

/**
 * Extraire l'IP depuis les headers de la requête (compatibles Vercel).
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}

// Nettoyage périodique des entrées expirées (toutes les 5 minutes)
if (typeof globalThis !== 'undefined') {
  const CLEANUP_INTERVAL = 5 * 60 * 1000
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of buckets.entries()) {
      if (now - entry.lastRefill > 10 * 60 * 1000) {
        buckets.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)
}
