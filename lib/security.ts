import { NextResponse } from "next/server"
import { getSessionId } from "./auth"

/**
 * Protección para las rutas de administración:
 *  - Exige sesión válida (firmada y no revocada).
 *  - En peticiones que modifican datos, exige que vengan de tu propio dominio (anti-CSRF).
 * Devuelve una respuesta de error, o null si todo está bien.
 */
export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin")
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
    if (!origin || !host) {
      return NextResponse.json({ error: "Solicitud no permitida" }, { status: 403 })
    }
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ error: "Solicitud no permitida" }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: "Solicitud no permitida" }, { status: 403 })
    }
  }

  if (!(await getSessionId())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  return null
}

// Solo se aceptan enlaces http(s) o rutas internas; bloquea "javascript:" y similares.
export function safeUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return ""
  const v = value.trim()
  if (v.startsWith("/") && !v.startsWith("//")) return v.slice(0, 500)
  try {
    const u = new URL(v)
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString().slice(0, 500) : ""
  } catch {
    return ""
  }
}

export function safeText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

export async function readJson(request: Request): Promise<any> {
  try {
    const text = await request.text()
    if (text.length > 100_000) return null
    return JSON.parse(text)
  } catch {
    return null
  }
}
