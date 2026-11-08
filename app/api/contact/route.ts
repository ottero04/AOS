import { type NextRequest, NextResponse } from "next/server"
import { hasDb, sql, logActivity } from "@/lib/db"
import { sendEmailNotification } from "@/lib/notify"
import { getClientIp } from "@/lib/auth"
import { readJson, safeText } from "@/lib/security"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(request: NextRequest) {
  try {
    const body = await readJson(request)
    if (!body) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

    // Campo trampa: los humanos no lo ven; los robots lo llenan.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ success: true })
    }

    const nombre = safeText(body.nombre, 100)
    const email = safeText(body.email, 160)
    const mensaje = safeText(body.mensaje, 4000)

    if (!nombre || !email || !mensaje) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    const ip = getClientIp(request.headers)

    if (hasDb()) {
      const recent = await sql<{ n: string }>(
        "SELECT count(*) AS n FROM contact_messages WHERE ip = $1 AND created_at > now() - interval '10 minutes'",
        [ip]
      )
      if (Number(recent[0]?.n ?? 0) >= 3) {
        return NextResponse.json(
          { error: "Has enviado varios mensajes seguidos. Intenta de nuevo en unos minutos." },
          { status: 429 }
        )
      }
      await sql(
        "INSERT INTO contact_messages (id, nombre, email, mensaje, ip) VALUES ($1, $2, $3, $4, $5)",
        [crypto.randomUUID(), nombre, email, mensaje, ip]
      )
      await logActivity("mensaje_recibido", `${nombre} <${email}>`)
    } else {
      console.log("Contact form submission (sin base de datos):", { nombre, email })
    }

    await sendEmailNotification(nombre, email, mensaje)

    return NextResponse.json({ success: true, message: "Mensaje enviado correctamente" })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Error al enviar el mensaje" }, { status: 500 })
  }
}
