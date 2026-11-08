import { NextResponse } from "next/server"
import { hasDb, sql } from "@/lib/db"
import { requireAdmin, readJson } from "@/lib/security"

const NO_DB = NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })

export async function GET(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (!hasDb()) return NO_DB
  const messages = await sql(
    "SELECT id, nombre, email, mensaje, created_at, read_at FROM contact_messages ORDER BY created_at DESC LIMIT 200"
  )
  return NextResponse.json({ messages })
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (!hasDb()) return NO_DB
  const body = await readJson(request)
  if (!body?.id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })
  await sql(
    `UPDATE contact_messages SET read_at = ${body.read === false ? "NULL" : "now()"} WHERE id = $1`,
    [String(body.id)]
  )
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (!hasDb()) return NO_DB
  const id = new URL(request.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })
  await sql("DELETE FROM contact_messages WHERE id = $1", [id])
  return NextResponse.json({ success: true })
}
