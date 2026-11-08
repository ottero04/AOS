import { getSetting, hasDb } from "./db"

// Textos y datos editables desde Configuración → Contenido del sitio.
// Si la base de datos no responde, la página usa estos valores por defecto.
export interface SiteContent {
  heroTitle: string
  heroHighlight: string
  heroSubtitle: string
  whatsappNumber: string
  whatsappMessage: string
  email: string
  location: string
  facebookUrl: string
  instagramUrl: string
  xUrl: string
}

export const DEFAULT_CONTENT: SiteContent = {
  heroTitle: "Soluciones Tecnologicas",
  heroHighlight: "para tu Negocio",
  heroSubtitle:
    "Desarrollamos software a medida que impulsa el crecimiento de tu empresa. Confiabilidad, innovacion y resultados garantizados.",
  whatsappNumber: "573177300185",
  whatsappMessage: "Hola, estoy interesado en crear una página web y quisiera recibir una cotización",
  email: "contactanos@aotesoft.com",
  location: "Colombia",
  facebookUrl: "",
  instagramUrl: "",
  xUrl: "",
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!hasDb()) return DEFAULT_CONTENT
  try {
    const saved = await getSetting<Partial<SiteContent>>("site_content")
    return { ...DEFAULT_CONTENT, ...(saved ?? {}) }
  } catch (e) {
    console.error("site content error", e)
    return DEFAULT_CONTENT
  }
}

export function whatsappUrl(content: SiteContent, message?: string): string {
  const number = content.whatsappNumber.replace(/\D/g, "")
  return `https://wa.me/${number}?text=${encodeURIComponent(message ?? content.whatsappMessage)}`
}

export interface PublicAutomation {
  id: string
  title: string
  summary: string
  category: string
  reportsCount: number
}

export const CATEGORY_LABELS: Record<string, string> = {
  correo: "Correo y adjuntos",
  informes: "Informes",
  documentos: "Documentos",
  notificaciones: "Notificaciones",
  otro: "Otro",
}

export async function getPublicAutomations(): Promise<PublicAutomation[]> {
  if (!hasDb()) return []
  try {
    const { sql } = await import("./db")
    const rows = await sql<any>(
      `SELECT id, public_title, public_summary, category, reports_count
       FROM automations WHERE is_public = true AND public_title <> ''
       ORDER BY updated_at DESC LIMIT 6`
    )
    return rows.map((r) => ({
      id: r.id,
      title: r.public_title,
      summary: r.public_summary,
      category: r.category,
      reportsCount: Number(r.reports_count) || 0,
    }))
  } catch (e) {
    console.error("public automations error", e)
    return []
  }
}
