import { NextResponse } from "next/server"
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/projects"
import { isAuthenticated } from "@/lib/auth"
import { requireAdmin, safeText, safeUrl, readJson } from "@/lib/security"
import { logActivity } from "@/lib/db"
import { revalidatePath } from "next/cache"

function safeStatus(value: unknown): "draft" | "published" {
  return value === "published" ? "published" : "draft"
}

function sanitize(body: any) {
  return {
    title: safeText(body.title, 120),
    shortDescription: safeText(body.shortDescription, 300),
    longDescription: safeText(body.longDescription, 5000),
    mainImage: safeUrl(body.mainImage),
    additionalImages: Array.isArray(body.additionalImages)
      ? body.additionalImages.map(safeUrl).filter(Boolean).slice(0, 20)
      : [],
    liveUrl: safeUrl(body.liveUrl),
    status: safeStatus(body.status),
    featured: body.featured === true,
    tags: Array.isArray(body.tags)
      ? body.tags.map((t: unknown) => safeText(t, 30)).filter(Boolean).slice(0, 8)
      : [],
  }
}

export async function GET() {
  try {
    const all = await getProjects()
    // Los borradores solo los ve el administrador
    const projects = (await isAuthenticated()) ? all : all.filter((p) => p.status === "published")
    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Error al obtener proyectos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  try {
    const body = await readJson(request)
    if (!body) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    const data = sanitize(body)
    if (!data.title) {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 })
    }
    const project = await createProject(data)
    await logActivity("proyecto_creado", data.title)
    revalidatePath("/"); revalidatePath("/proyectos", "layout")
    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Error al crear proyecto" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  try {
    const body = await readJson(request)
    if (!body?.id) {
      return NextResponse.json({ error: "ID de proyecto requerido" }, { status: 400 })
    }
    const project = await updateProject(String(body.id), sanitize(body))
    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }
    await logActivity("proyecto_editado", project.title)
    revalidatePath("/"); revalidatePath("/proyectos", "layout")
    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Error al actualizar proyecto" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  try {
    const body = await readJson(request)
    if (!body?.id) {
      return NextResponse.json({ error: "ID de proyecto requerido" }, { status: 400 })
    }
    const changes: { status?: "draft" | "published"; featured?: boolean } = {}
    if (body.status !== undefined) changes.status = safeStatus(body.status)
    if (body.featured !== undefined) changes.featured = body.featured === true
    const project = await updateProject(String(body.id), changes)
    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }
    await logActivity(
      body.featured !== undefined
        ? (project.featured ? "proyecto_destacado" : "proyecto_no_destacado")
        : project.status === "published" ? "proyecto_publicado" : "proyecto_ocultado",
      project.title
    )
    revalidatePath("/"); revalidatePath("/proyectos", "layout")
    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error updating project status:", error)
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  try {
    const id = new URL(request.url).searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID de proyecto requerido" }, { status: 400 })
    }
    const deleted = await deleteProject(id)
    if (!deleted) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }
    await logActivity("proyecto_eliminado", id)
    revalidatePath("/"); revalidatePath("/proyectos", "layout")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Error al eliminar proyecto" }, { status: 500 })
  }
}
