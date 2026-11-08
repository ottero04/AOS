import { NextResponse } from "next/server"
import {
  createSession,
  destroySession,
  validateCredentials,
  isLoginBlocked,
  recordLoginAttempt,
  getTotpSetting,
  verifyAndConsumeTotp,
  getClientIp,
} from "@/lib/auth"
import { logActivity } from "@/lib/db"
import { readJson } from "@/lib/security"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  const userAgent = request.headers.get("user-agent") || ""

  try {
    if (await isLoginBlocked(ip)) {
      return NextResponse.json(
        { error: "Demasiados intentos fallidos. Espera 15 minutos e intenta de nuevo." },
        { status: 429 }
      )
    }

    const body = await readJson(request)
    const username = typeof body?.username === "string" ? body.username : ""
    const password = typeof body?.password === "string" ? body.password : ""
    const code = typeof body?.code === "string" ? body.code : ""

    if (!username || !password) {
      return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    if (!validateCredentials(username, password)) {
      await recordLoginAttempt(ip, username, false, "credenciales", userAgent)
      await wait(700)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const totp = await getTotpSetting()
    if (totp) {
      if (!code) {
        return NextResponse.json({ requires2fa: true })
      }
      if (!(await verifyAndConsumeTotp(code))) {
        await recordLoginAttempt(ip, username, false, "codigo_2fa", userAgent)
        await wait(700)
        return NextResponse.json({ error: "Código de verificación incorrecto", requires2fa: true }, { status: 401 })
      }
    }

    const ok = await createSession(ip, userAgent)
    if (!ok) {
      return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }
    await recordLoginAttempt(ip, username, true, totp ? "ok_2fa" : "ok", userAgent)
    await logActivity("login", `Inicio de sesión desde ${ip}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await destroySession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
}
