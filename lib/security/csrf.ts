import { createHmac, randomBytes } from 'crypto'

const CSRF_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev'

export function genererTokenCSRF(sessionId: string): string {
  const nonce = randomBytes(16).toString('hex')
  const message = `${sessionId}:${nonce}:${Date.now()}`
  const signature = createHmac('sha256', CSRF_SECRET).update(message).digest('hex')
  return Buffer.from(`${message}:${signature}`).toString('base64')
}

export function validerTokenCSRF(token: string, sessionId: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [sid, nonce, timestamp, signature] = decoded.split(':')

    // Vérifier que c'est bien la bonne session
    if (sid !== sessionId) return false

    // Vérifier que le token n'est pas expiré (1 heure)
    if (Date.now() - parseInt(timestamp) > 3600000) return false

    // Vérifier la signature HMAC
    const message = `${sid}:${nonce}:${timestamp}`
    const expectedSig = createHmac('sha256', CSRF_SECRET).update(message).digest('hex')
    return signature === expectedSig
  } catch {
    return false
  }
}
