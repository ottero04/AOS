import { put, list } from "@vercel/blob"
import type { Project } from "./types"
import { hasDb, sql, getSetting, setSetting } from "./db"

/*
 * Los proyectos se guardan en la base de datos (Neon/Postgres): cada proyecto es
 * un registro independiente, así que crear, editar o destacar uno nunca puede
 * borrar otro.
 *
 * Antes se guardaban todos juntos en un archivo "projects.json" de Vercel Blob.
 * Ese archivo queda en caché hasta 60 s después de cada cambio, y como cada
 * guardado reescribía la lista completa a partir de una copia vieja, los
 * proyectos se perdían. La primera vez que se usa la base de datos se importa
 * automáticamente lo que haya en ese archivo.
 */

interface ProjectsData {
  projects: Project[]
}

// ---------------- Lectura del sistema anterior (solo para migrar o si no hay BD) ----------------

async function readLegacyBlob(): Promise<Project[] | null> {
  try {
    const { blobs } = await list({ prefix: "projects.json" })
    if (blobs.length === 0) return null
    // El parámetro único evita recibir una copia vieja de la caché
    const res = await fetch(`${blobs[0].url}?v=${Date.now()}`, { cache: "no-store" })
    if (!res.ok) return null
    const data = (await res.json()) as ProjectsData
    return Array.isArray(data.projects) ? data.projects : null
  } catch {
    return null
  }
}

async function readLocalJson(): Promise<Project[]> {
  try {
    const { promises: fs } = await import("fs")
    const path = await import("path")
    const data = await fs.readFile(path.join(process.cwd(), "data", "projects.json"), "utf-8")
    return (JSON.parse(data) as ProjectsData).projects ?? []
  } catch {
    return []
  }
}

// ---------------- Base de datos ----------------

const COLUMNS = `id, title, short_description, long_description, main_image, additional_images,
  live_url, status, featured, tags, created_at, updated_at`

function fromRow(r: any): Project {
  return {
    id: r.id,
    title: r.title,
    shortDescription: r.short_description,
    longDescription: r.long_description,
    mainImage: r.main_image,
    additionalImages: Array.isArray(r.additional_images) ? r.additional_images : [],
    liveUrl: r.live_url,
    status: r.status === "published" ? "published" : "draft",
    featured: Boolean(r.featured),
    tags: Array.isArray(r.tags) ? r.tags : [],
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }
}

async function insertProject(p: Project): Promise<void> {
  await sql(
    `INSERT INTO projects (${COLUMNS})
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10::jsonb,$11,$12)
     ON CONFLICT (id) DO NOTHING`,
    [
      p.id,
      p.title ?? "",
      p.shortDescription ?? "",
      p.longDescription ?? "",
      p.mainImage ?? "",
      JSON.stringify(p.additionalImages ?? []),
      p.liveUrl ?? "",
      p.status === "published" ? "published" : "draft",
      Boolean(p.featured),
      JSON.stringify(p.tags ?? []),
      p.createdAt || new Date().toISOString(),
      p.updatedAt || new Date().toISOString(),
    ]
  )
}

let migration: Promise<void> | null = null

/** Importa una sola vez los proyectos del sistema anterior a la base de datos. */
async function ensureMigrated(): Promise<void> {
  if (!migration) {
    migration = (async () => {
      const done = await getSetting<{ at: string }>("projects_migrated")
      if (done) return
      const legacy = (await readLegacyBlob()) ?? (await readLocalJson())
      for (const p of legacy) {
        if (p?.id && p?.title) await insertProject(p)
      }
      await setSetting("projects_migrated", { at: new Date().toISOString(), imported: legacy.length })
    })().catch((e) => {
      migration = null
      throw e
    })
  }
  return migration
}

// ---------------- API pública ----------------

export async function getProjects(): Promise<Project[]> {
  if (hasDb()) {
    await ensureMigrated()
    const rows = await sql(`SELECT ${COLUMNS} FROM projects ORDER BY created_at DESC`)
    return rows.map(fromRow)
  }
  return (await readLegacyBlob()) ?? (await readLocalJson())
}

export async function getPublishedProjects(): Promise<Project[]> {
  if (hasDb()) {
    await ensureMigrated()
    const rows = await sql(`SELECT ${COLUMNS} FROM projects WHERE status = 'published' ORDER BY created_at DESC`)
    return rows.map(fromRow)
  }
  return (await getProjects()).filter((p) => p.status === "published")
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (hasDb()) {
    await ensureMigrated()
    const rows = await sql(`SELECT ${COLUMNS} FROM projects WHERE id = $1`, [id])
    return rows[0] ? fromRow(rows[0]) : null
  }
  return (await getProjects()).find((p) => p.id === id) ?? null
}

export async function createProject(
  projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<Project> {
  const now = new Date().toISOString()
  const project: Project = { ...projectData, id: crypto.randomUUID(), createdAt: now, updatedAt: now }

  if (hasDb()) {
    await ensureMigrated()
    await insertProject(project)
    return project
  }
  // Sin base de datos: modo antiguo (no recomendado)
  const projects = await getProjects()
  projects.unshift(project)
  await saveLegacy(projects)
  return project
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  if (hasDb()) {
    await ensureMigrated()
    const map: Record<string, [string, (v: any) => unknown]> = {
      title: ["title", (v) => String(v ?? "")],
      shortDescription: ["short_description", (v) => String(v ?? "")],
      longDescription: ["long_description", (v) => String(v ?? "")],
      mainImage: ["main_image", (v) => String(v ?? "")],
      additionalImages: ["additional_images", (v) => JSON.stringify(Array.isArray(v) ? v : [])],
      liveUrl: ["live_url", (v) => String(v ?? "")],
      status: ["status", (v) => (v === "published" ? "published" : "draft")],
      featured: ["featured", (v) => Boolean(v)],
      tags: ["tags", (v) => JSON.stringify(Array.isArray(v) ? v : [])],
    }
    const sets: string[] = []
    const params: unknown[] = [id]
    for (const [key, value] of Object.entries(updates)) {
      const m = map[key]
      if (!m || value === undefined) continue
      params.push(m[1](value))
      const cast = key === "additionalImages" || key === "tags" ? "::jsonb" : ""
      sets.push(`${m[0]} = $${params.length}${cast}`)
    }
    sets.push("updated_at = now()")
    const rows = await sql(`UPDATE projects SET ${sets.join(", ")} WHERE id = $1 RETURNING ${COLUMNS}`, params)
    return rows[0] ? fromRow(rows[0]) : null
  }

  const projects = await getProjects()
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return null
  projects[index] = { ...projects[index], ...updates, id, updatedAt: new Date().toISOString() }
  await saveLegacy(projects)
  return projects[index]
}

export async function deleteProject(id: string): Promise<boolean> {
  if (hasDb()) {
    await ensureMigrated()
    const rows = await sql("DELETE FROM projects WHERE id = $1 RETURNING id", [id])
    return rows.length > 0
  }
  const projects = await getProjects()
  const filtered = projects.filter((p) => p.id !== id)
  if (filtered.length === projects.length) return false
  await saveLegacy(filtered)
  return true
}

async function saveLegacy(projects: Project[]): Promise<void> {
  await put("projects.json", JSON.stringify({ projects }, null, 2), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  })
}

/** Destacados para el carrusel; si no hay ninguno marcado, los más recientes. */
export async function getFeaturedProjects(limit = 6): Promise<Project[]> {
  const published = await getPublishedProjects()
  const featured = published.filter((p) => p.featured)
  return (featured.length > 0 ? featured : published).slice(0, limit)
}

export async function getPublishedProjectById(id: string): Promise<Project | null> {
  const project = await getProjectById(id)
  return project && project.status === "published" ? project : null
}

/** Imágenes ya subidas al almacenamiento, para reutilizarlas al recrear un proyecto. */
export async function listUploadedImages(): Promise<{ url: string; uploadedAt: string; size: number }[]> {
  try {
    const { blobs } = await list({ prefix: "projects/", limit: 200 })
    return blobs
      .filter((b) => /\.(jpe?g|png|webp|gif)$/i.test(b.pathname))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .map((b) => ({ url: b.url, uploadedAt: new Date(b.uploadedAt).toISOString(), size: b.size }))
  } catch {
    return []
  }
}
