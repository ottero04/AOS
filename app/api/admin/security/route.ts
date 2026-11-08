import { NextResponse } from "next/server"
import QRCode from "qrcode"
import { hasDb, sql, getSetting, setSetting, deleteSetting, logActivity } from "@/lib/db"
import {
  getSessionId,
  getTotpSetting,
  revokeSessions,
  verifyAndConsumeTotp,
  disableTotp,
  type TotpSetting,
} from "@/lib/auth"
import { requireAdmin, readJson } from "@/lib/security"
import { generateTotpSecret, totpUri, encryptSecret, decryptSecret, verifyTotp } from "@/lib/totp"

export async function GET(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const currentId = await getSessionId()
  const base = {
    hasDb: hasDb(),
    hasSessionSecret: Boolean(process.env.SESSION_SECRET),
    hasResend: Boolean(process.env.RESEND_API_KEY),
    resetFlagActive: process.env.ADMIN_RESET_2FA === "true",
  }
  if (!hasDb()) {
    return NextResponse.json({ ...base, twoFactorEnabled: false, sessions: [], attempts: [] })
  }

  const [totp, sessions, attempts, failed24h] = await Promise.all([
    getTotpSetting(),
    sql(
      `SELECT id, created_at, last_seen_at, ip, user_agent FROM admin_sessions
       WHERE revoked_at IS NULL AND expires_at > now() ORDER BY last_seen_at DESC LIMIT 20`
    ),
    sql(
      `SELECT id, ip, username, success, reason, user_agent, created_at FROM login_attempts
       ORDER BY created_at DESC LIMIT 30`
    ),
    sql<{ n: string }>(
      "SELECT count(*) AS n FROM login_attempts WHERE success = false AND created_at > now() - interval '24 hours'"
    ),
  ])

  return NextResponse.json({
    ...base,
    twoFactorEnabled: Boolean(totp),
    twoFactorSince: totp?.enabledAt ?? null,
    sessions: sessions.map((s: any) => ({ ...s, current: s.id === currentId })),
    attempts,
    failed24h: Number(failed24h[0]?.n ?? 0),
  })
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (!hasDb()) return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })

  const body = await readJson(request)
  const action = body?.action
  const currentId = await getSessionId()

  switch (action) {
    case "start2fa": {
      if (!process.env.SESSION_SECRET) {
        return NextResponse.json(
          { error: "Primero agrega la variable SESSION_SECRET en Vercel (ver instrucciones)." },
          { status: 400 }
        )
      }
      if (await getTotpSetting()) {
        return NextResponse.json({ error: "La verificación en dos pasos ya está activa" }, { status: 400 })
      }
      const secret = generateTotpSecret()
      await setSetting("totp_pending", { secretEnc: encryptSecret(secret), createdAt: new Date().toISOString() })
      const uri = totpUri(secret, process.env.ADMIN_USERNAME || "admin")
      const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220 })
      return NextResponse.json({ qr, secret })
    }

    case "confirm2fa": {
      const pending = await getSetting<{ secretEnc: string; createdAt: string }>("totp_pending")
      if (!pending || Date.now() - new Date(pending.createdAt).getTime() > 15 * 60_000) {
        return NextResponse.json({ error: "La configuración expiró. Empieza de nuevo." }, { status: 400 })
      }
      const secret = decryptSecret(pending.secretEnc)
      const counter = verifyTotp(secret, String(body?.code ?? ""))
      if (counter === null) {
        return NextResponse.json({ error: "Código incorrecto. Revisa la hora del celular e intenta otra vez." }, { status: 400 })
      }
      const setting: TotpSetting = {
        enabled: true,
        secretEnc: pending.secretEnc,
        lastCounter: counter,
        enabledAt: new Date().toISOString(),
      }
      await setSetting("totp", setting)
      await deleteSetting("totp_pending")
      // Por seguridad, se cierran las demás sesiones abiertas
      await revokeSessions({ exceptId: currentId ?? undefined })
      await logActivity("2fa_activada", "Verificación en dos pasos activada")
      return NextResponse.json({ success: true })
    }

    case "disable2fa": {
      if (!(await getTotpSetting())) return NextResponse.json({ success: true })
      if (!(await verifyAndConsumeTotp(String(body?.code ?? "")))) {
        return NextResponse.json({ error: "Código incorrecto" }, { status: 400 })
      }
      await disableTotp()
      await logActivity("2fa_desactivada", "Verificación en dos pasos desactivada")
      return NextResponse.json({ success: true })
    }

    case "revokeOthers": {
      const n = await revokeSessions({ exceptId: currentId ?? undefined })
      await logActivity("sesiones_cerradas", `${n} sesión(es) cerradas`)
      return NextResponse.json({ success: true, revoked: n })
    }

    case "revoke": {
      const id = String(body?.id ?? "")
      if (!id || id === currentId) return NextResponse.json({ error: "Sesión inválida" }, { status: 400 })
      await revokeSessions({ onlyId: id })
      await logActivity("sesion_cerrada", "Sesión cerrada manualmente")
      return NextResponse.json({ success: true })
    }

    default:
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
  }
}
