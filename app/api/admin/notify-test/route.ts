import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/security"
import { sendEmailNotification } from "@/lib/notify"

// Envía un correo de prueba al correo de notificaciones configurado
export async function POST(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Falta configurar RESEND_API_KEY en Vercel" }, { status: 400 })
  }
  const ok = await sendEmailNotification(
    "Prueba del panel",
    "no-responder@aotesoft.com",
    "Este es un correo de prueba. Si lo ves con la etiqueta AOS, el filtro de Gmail quedó bien configurado."
  )
  if (!ok) return NextResponse.json({ error: "Resend rechazó el envío. Revisa la clave y el correo destino." }, { status: 502 })
  return NextResponse.json({ success: true })
}
