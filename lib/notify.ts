import { getSetting, hasDb } from "./db"

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

export async function getNotifyEmail(): Promise<string> {
  try {
    const saved = hasDb() ? await getSetting<{ email: string }>("notifications") : null
    if (saved?.email) return saved.email
  } catch {}
  return process.env.CONTACT_TO_EMAIL || "contactanos@aotesoft.com"
}

export async function sendEmailNotification(nombre: string, email: string, mensaje: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false
  const to = await getNotifyEmail()
  const from = process.env.CONTACT_FROM_EMAIL || "AOS Web <onboarding@resend.dev>"
  const fecha = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "long", timeStyle: "short" })
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        // El prefijo [AOS Web] permite crear un filtro en Gmail que aplique la etiqueta "AOS"
        subject: `[AOS Web] Nuevo mensaje de ${nombre}`,
        text: `Nuevo mensaje desde la página web\n\nNombre: ${nombre}\nCorreo: ${email}\nFecha: ${fecha}\n\n${mensaje}\n\nResponde directamente a este correo para contestarle.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
  <div style="background:#0f172a;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
    <strong style="font-size:18px">AOS · Nuevo mensaje</strong>
    <div style="color:#94a3b8;font-size:13px;margin-top:4px">${escapeHtml(fecha)}</div>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:0;padding:24px;border-radius:0 0 12px 12px">
    <p style="margin:0 0 6px"><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
    <p style="margin:0 0 18px"><strong>Correo:</strong> ${escapeHtml(email)}</p>
    <div style="background:#f8fafc;border-radius:10px;padding:16px;white-space:pre-wrap;line-height:1.5">${escapeHtml(mensaje)}</div>
    <p style="color:#64748b;font-size:13px;margin-top:20px">Responde directamente a este correo para contestarle a ${escapeHtml(nombre)}.</p>
  </div>
</div>`,
      }),
    })
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text())
      return false
    }
    return true
  } catch (e) {
    console.error("Resend error", e)
    return false
  }
}

