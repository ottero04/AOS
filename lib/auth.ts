import { cookies, headers } from "next/headers"
import { hasDb, sql, getSetting, setSetting, deleteSetting } from "./db"
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
  safeEqual,
} from "./session"
import { decryptSecret, verifyTotp } from "./totp"

// ---------------- Sesiones ----------------

export async function createSession(ip: string, userAgent: string): Promise<boolean> {
  const sessionId = crypto.randomUUID()
  const token = await createSessionToken(sessionId)
  if (!token) return false

  if (hasDb()) {
    await sql(
      `INSERT INTO admin_sessions (id, expires_at, ip, user_agent)
       VALUES ($1, now() + ($2 || ' seconds')::interval, $3, $4)`,
      [sessionId, String(SESSION_MAX_AGE_SECONDS), ip, userAgent.slice(0, 300)]
    )
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  })
  return true
}

/** Devuelve el id de la sesión actual si es válida (firma + no revocada en la BD). */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  const verified = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)
  if (!verified) return null
  if (!hasDb()) return verified.sessionId

  try {
    const rows = await sql<{ id: string }>(
      `UPDATE admin_sessions SET last_seen_at = now()
       WHERE id = $1 AND revoked_at IS NULL AND expires_at > now()
       RETURNING id`,
      [verified.sessionId]
    )
    return rows[0]?.id ?? null
  } catch (e) {
    // Si la base de datos falla, se bloquea el acceso (falla cerrada, más seguro).
    console.error("session check error", e)
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSessionId()) !== null
}

export async function destroySession(): Promise<void> {
  const sessionId = await getSessionId()
  if (sessionId && hasDb()) {
    await sql("UPDATE admin_sessions SET revoked_at = now() WHERE id = $1", [sessionId])
  }
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function revokeSessions(opts: { exceptId?: string; onlyId?: string } = {}): Promise<number> {
  if (!hasDb()) return 0
  if (opts.onlyId) {
    const r = await sql("UPDATE admin_sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL RETURNING id", [opts.onlyId])
    return r.length
  }
  const r = await sql(
    "UPDATE admin_sessions SET revoked_at = now() WHERE revoked_at IS NULL AND id <> $1 RETURNING id",
    [opts.exceptId ?? ""]
  )
  return r.length
}

// ---------------- Credenciales ----------------

export function validateCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminUsername || !adminPassword) {
    console.error("Admin credentials not configured in environment variables")
    return false
  }
  // Se evalúan ambas comparaciones siempre, para no revelar cuál falló.
  const userOk = safeEqual(String(username), adminUsername)
  const passOk = safeEqual(String(password), adminPassword)
  return userOk && passOk
}

// ---------------- Verificación en dos pasos (2FA) ----------------

export interface TotpSetting {
  enabled: boolean
  secretEnc: string
  lastCounter: number
  enabledAt: string
}

export async function getTotpSetting(): Promise<TotpSetting | null> {
  if (process.env.ADMIN_RESET_2FA === "true") return null // salida de emergencia (ver README)
  const s = await getSetting<TotpSetting>("totp")
  return s?.enabled ? s : null
}

export async function verifyAndConsumeTotp(code: string): Promise<boolean> {
  const setting = await getTotpSetting()
  if (!setting) return true
  let secret: string
  try {
    secret = decryptSecret(setting.secretEnc)
  } catch {
    console.error("No se pudo descifrar el secreto 2FA (¿cambió SESSION_SECRET?)")
    return false
  }
  const counter = verifyTotp(secret, code, setting.lastCounter)
  if (counter === null) return false
  await setSetting("totp", { ...setting, lastCounter: counter }) // un código no se puede reutilizar
  return true
}

export async function disableTotp(): Promise<void> {
  await deleteSetting("totp")
}

// ---------------- Límite de intentos y registro de accesos ----------------

const MAX_FAILS_PER_IP = 5
const WINDOW_MINUTES = 15
const memoryAttempts = new Map<string, { count: number; firstAt: number }>()

export async function isLoginBlocked(ip: string): Promise<boolean> {
  if (hasDb()) {
    try {
      const rows = await sql<{ n: string }>(
        `SELECT count(*) AS n FROM login_attempts
         WHERE ip = $1 AND success = false AND created_at > now() - ($2 || ' minutes')::interval`,
        [ip, String(WINDOW_MINUTES)]
      )
      return Number(rows[0]?.n ?? 0) >= MAX_FAILS_PER_IP
    } catch (e) {
      console.error("rate limit check error", e)
      return true // falla cerrada
    }
  }
  const entry = memoryAttempts.get(ip)
  if (!entry) return false
  if (Date.now() - entry.firstAt > WINDOW_MINUTES * 60_000) {
    memoryAttempts.delete(ip)
    return false
  }
  return entry.count >= MAX_FAILS_PER_IP
}

export async function recordLoginAttempt(
  ip: string,
  username: string,
  success: boolean,
  reason: string,
  userAgent: string
): Promise<void> {
  if (hasDb()) {
    try {
      await sql(
        "INSERT INTO login_attempts (ip, username, success, reason, user_agent) VALUES ($1, $2, $3, $4, $5)",
        [ip, username.slice(0, 80), success, reason, userAgent.slice(0, 300)]
      )
    } catch (e) {
      console.error("login log error", e)
    }
    return
  }
  if (success) {
    memoryAttempts.delete(ip)
    return
  }
  const entry = memoryAttempts.get(ip)
  if (!entry || Date.now() - entry.firstAt > WINDOW_MINUTES * 60_000) {
    memoryAttempts.set(ip, { count: 1, firstAt: Date.now() })
  } else {
    entry.count++
  }
}

// ---------------- Utilidades de petición ----------------

export function getClientIp(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "desconocida"
  ).slice(0, 64)
}

export async function currentRequestInfo(): Promise<{ ip: string; userAgent: string }> {
  const h = await headers()
  return { ip: getClientIp(h), userAgent: h.get("user-agent") || "" }
}
