import crypto from "node:crypto"

// Códigos de verificación de 6 dígitos (TOTP, RFC 6238), compatibles con
// Google Authenticator, Microsoft Authenticator, Authy, 1Password, etc.

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

export function base32Encode(buf: Buffer): string {
  let bits = 0
  let value = 0
  let out = ""
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31]
  return out
}

export function base32Decode(str: string): Buffer {
  const clean = str.replace(/=+$/, "").replace(/\s/g, "").toUpperCase()
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch)
    if (idx === -1) throw new Error("base32 inválido")
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(out)
}

export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20))
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(counter))
  const hmac = crypto.createHmac("sha1", secret).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3]
  return String(code % 1_000_000).padStart(6, "0")
}

export function currentCounter(now = Date.now()): number {
  return Math.floor(now / 1000 / 30)
}

/**
 * Verifica un código. Acepta ±1 intervalo (30 s) por desfase de reloj.
 * Devuelve el contador usado (para impedir reutilizar el mismo código) o null.
 */
export function verifyTotp(secretBase32: string, code: string, lastUsedCounter = -1): number | null {
  const clean = String(code).replace(/\s/g, "")
  if (!/^\d{6}$/.test(clean)) return null
  const secret = base32Decode(secretBase32)
  const now = currentCounter()
  for (const c of [now - 1, now, now + 1]) {
    if (c <= lastUsedCounter) continue
    const expected = hotp(secret, c)
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(clean))) return c
  }
  return null
}

export function totpUri(secretBase32: string, account: string, issuer = "AOS Admin"): string {
  const label = encodeURIComponent(`${issuer}:${account}`)
  return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
}

// --- Cifrado del secreto 2FA en la base de datos (AES-256-GCM) ---
function key(): Buffer {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET no está configurado")
  return crypto.createHash("sha256").update(`totp:${secret}`).digest()
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv)
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  return [iv, cipher.getAuthTag(), enc].map((b) => b.toString("base64")).join(".")
}

export function decryptSecret(payload: string): string {
  const [iv, tag, enc] = payload.split(".").map((p) => Buffer.from(p, "base64"))
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8")
}
