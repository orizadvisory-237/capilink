const DOMAINES_AUTORISES = [
  'capilink.cm',
  'www.capilink.cm',
  process.env.NEXTAUTH_URL?.replace('https://', '') ?? '',
].filter(Boolean)

export function validerURLRedirection(url: string): string {
  const fallback = '/'
  if (!url) return fallback

  try {
    // Accepter les chemins relatifs
    if (url.startsWith('/') && !url.startsWith('//')) {
      // Vérifier qu'il n'y a pas de path traversal
      const decoded = decodeURIComponent(url)
      if (decoded.includes('..') || decoded.includes('\0')) return fallback
      return url
    }

    // Pour les URLs absolues, vérifier le domaine
    const parsed = new URL(url)
    if (DOMAINES_AUTORISES.includes(parsed.hostname)) {
      return url
    }
    return fallback
  } catch {
    return fallback
  }
}
