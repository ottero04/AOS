// Token de sesión firmado (HMAC-SHA256). Funciona en el middleware (Edge) y en Node.
// Formato: "<idSesion>.<expiraEnMs>.<firma>". Solo el servidor puede generarlo.

export const SESSION_COOKIE_NAME = "aos_admin_session"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 horas

export function getSessionSecret(): string | null {
  // Recomendado: SESSION_SECRET largo y aleatorio. Respaldo: la contraseña de admin.
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || null
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = ""
  const arr = new Uint8Array(bytes)
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i])
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  return toBase64Url(sig)
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function createSessionToken(sessionId: string): Promise<string | null> {
  const secret = getSessionSecret()
  if (!secret) return null
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const payload = `${sessionId}.${expiresAt}`
  return `${payload}.${await sign(payload, secret)}`
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<{ sessionId: string; expiresAt: number } | null> {
  if (!token) return null
  const secret = getSessionSecret()
  if (!secret) return null
  const parts = token.split(".")
  if (parts.length !== 3) return null
  const [sessionId, exp, signature] = parts
  const expiresAt = Number(exp)
  if (!sessionId || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return null
  const expected = await sign(`${sessionId}.${exp}`, secret)
  return safeEqual(signature, expected) ? { sessionId, expiresAt } : null
}
