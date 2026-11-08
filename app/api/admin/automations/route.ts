import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { hasDb, sql, logActivity } from "@/lib/db"
import { requireAdmin, readJson, safeText, safeUrl } from "@/lib/security"

const NO_DB = () => NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })
const STATUSES = ["activa", "pausada", "en_desarrollo"]
const CATEGORIES = ["correo", "informes", "documentos", "notificaciones", "otro"]

function sanitize(b: any) {
  return {
    title: safeText(b.title, 120),
    client: safeText(b.client, 120),
    category: CATEGORIES.includes(b.category) ? b.category : "otro",
    description: safeText(b.description, 3000),
    status: STATUSES.includes(b.status) ? b.status : "en_desarrollo",
    driveUrl: safeUrl(b.driveUrl),
    reportsCount: Math.max(0, Math.min(1_000_000, Math.floor(Number(b.reportsCount) || 0))),
    isPublic: b.isPublic === true,
    publicTitle: safeText(b.publicTitle, 120),
    publicSummary: safeText(b.publicSummary, 400),
  }
}

const SELECT = `SELECT id, title, client, category, description, status, drive_url AS "driveUrl",
  reports_count AS "reportsCount", last_report_at AS "lastReportAt", is_public AS "isPublic",
  public_title AS "publicTitle", public_summary AS "publicSummary",
  created_at AS "createdAt", updated_at AS "updatedAt" FROM automations`

export async function GET(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (!hasDb()) return NO_DB()
  const automations = await sql(`${SELECT} ORDER BY updated_at DESC`)
  return NextResponse.json({ automations })
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (!hasDb()) return NO_DB()
  const body = await readJson(request)
  if (!body) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  // Acción rápida: registrar que se generó un informe
  if (body.action === "report" && body.id) {
    const n = Math.max(1, Math.min(1000, Math.floor(Number(body.count) || 1)))
    const rows = await sql<{ title: string }>(
      `UPDATE automations SET reports_count = reports_count + $2, last_report_at = now(), updated_at = now()
       WHERE id = $1 RETURNING title`,
      [String(body.id), n]
    )
    if (!rows[0]) return NextResponse.json({ error: "No encontrada" }, { status: 404 })
    await logActivity("informe_registrado", `${rows[0].title} (+${n})`)
    revalidatePath("/")
    return NextResponse.json({ success: true })
  }

  const d = sanitize(body)
  if (!d.title) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
  const id = crypto.randomUUID()
  await sql(
    `INSERT INTO automations (id, title, client, category, description, status, drive_url, reports_count,
       is_public, public_title, public_summary, last_report_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, CASE WHEN $8 > 0 THEN now() ELSE NULL END)`,
    [id, d.title, d.client, d.category, d.description, d.status, d.driveUrl, d.reportsCount,
     d.isPublic, d.publicTitle, d.publicSummary]
  )
  await logActivity("automatizacion_creada", d.title)
  revalidatePath("/")
  return NextResponse.json({ success: true, id })
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (!hasDb()) return NO_DB()
  const body = await readJson(request)
  if (!body?.id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })
  const d = sanitize(body)
  if (!d.title) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
  const rows = await sql(
    `UPDATE automations SET title=$2, client=$3, category=$4, description=$5, status=$6, drive_url=$7,
       reports_count=$8, is_public=$9, public_title=$10, public_summary=$11, updated_at=now()
     WHERE id=$1 RETURNING id`,
    [String(body.id), d.title, d.client, d.category, d.description, d.status, d.driveUrl,
     d.reportsCount, d.isPublic, d.publicTitle, d.publicSummary]
  )
  if (!rows[0]) return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  await logActivity("automatizacion_editada", d.title)
  revalidatePath("/")
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (!hasDb()) return NO_DB()
  const id = new URL(request.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })
  const rows = await sql<{ title: string }>("DELETE FROM automations WHERE id = $1 RETURNING title", [id])
  if (rows[0]) await logActivity("automatizacion_eliminada", rows[0].title)
  revalidatePath("/")
  return NextResponse.json({ success: true })
}
