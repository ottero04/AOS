import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { hasDb, setSetting, getSetting, logActivity } from "@/lib/db"
import { DEFAULT_CONTENT, getSiteContent, type SiteContent } from "@/lib/content"
import { requireAdmin, readJson, safeText, safeUrl } from "@/lib/security"

export async function GET(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  const notify = hasDb() ? await getSetting<{ email: string }>("notifications").catch(() => null) : null
  return NextResponse.json({
    content: await getSiteContent(),
    hasDb: hasDb(),
    notifyEmail: notify?.email ?? "",
    hasResend: Boolean(process.env.RESEND_API_KEY),
  })
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (!hasDb()) return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })
  const b = await readJson(request)
  if (!b) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const content: SiteContent = {
    heroTitle: safeText(b.heroTitle, 80) || DEFAULT_CONTENT.heroTitle,
    heroHighlight: safeText(b.heroHighlight, 80),
    heroSubtitle: safeText(b.heroSubtitle, 300),
    whatsappNumber: safeText(b.whatsappNumber, 20).replace(/\D/g, "") || DEFAULT_CONTENT.whatsappNumber,
    whatsappMessage: safeText(b.whatsappMessage, 300),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeText(b.email, 160)) ? safeText(b.email, 160) : DEFAULT_CONTENT.email,
    location: safeText(b.location, 80),
    facebookUrl: safeUrl(b.facebookUrl),
    instagramUrl: safeUrl(b.instagramUrl),
    tiktokUrl: safeUrl(b.tiktokUrl),
    xUrl: safeUrl(b.xUrl),
  }
  await setSetting("site_content", content)
  if (typeof b.notifyEmail === "string") {
    const email = safeText(b.notifyEmail, 160)
    await setSetting("notifications", { email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "" })
  }
  await logActivity("contenido_actualizado", "Textos del sitio")
  revalidatePath("/")
  return NextResponse.json({ success: true, content })
}
